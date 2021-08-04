// SPDX-FileCopyrightText: 2020 IntelMQ Team <intelmq-team@cert.at>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Big variable options, passed to vis library.
 * There are also all the manipulation methods.
 */
'use strict';

var NETWORK_OPTIONS = {
    physics: {
        hierarchicalRepulsion: {
            nodeDistance: 200,
            springLength: 200
        },
        stabilization: {
            enabled: true,
            fit: true
        },
        solver: 'hierarchicalRepulsion'
    },
    interaction: {
        tooltipDelay: 1000,
        navigationButtons: true,
        keyboard: {
            bindToWindow: false
        }
    },
    nodes: {
        font: {
            size: 14, // px
            face: 'arial',
            align: 'center'
        }
    },
    edges: {
        length: 200,
        arrows: {
            to: {enabled: true, scaleFactor: 1, type: 'arrow'}
        },
        physics: true,
        font: {
            size: 14, // px
            face: 'arial',
        },
        color: {
            inherit: false
        },
        smooth: {
            enabled: true,
            type: 'continuous'
        }
    },
    groups: {
        Collector: {
            shape: 'box',
            color: GROUP_COLORS['Collector'][0],
        },
        Parser: {
            shape: 'box',
            color: GROUP_COLORS['Parser'][0]
        },
        Expert: {
            shape: 'box',
            color: GROUP_COLORS['Expert'][0],
            fontColor: "#FFFFFF"
        },
        Output: {
            shape: 'box',
            color: GROUP_COLORS['Output'][0]
        }
    },

    manipulation: {
        enabled: true,
        initiallyActive: true,
        editEdge: false,

        addNode: (data, callback) => create_form("Add Node", data, callback),
        editNode: function (data, callback) {
            create_form("Edit Node", data, callback);
            fill_bot(data.id, undefined, undefined);
        },
        deleteNode: function (data, callback) {
            callback(data);
            let node_set = new Set(data.nodes);

            for (let edge_index of data.edges) {
                let [from, to, path] = from_edge_id(edge_index);
                if (!node_set.has(from)) { // otherwise handled by node deletion below
                    remove_edge(from, to, path);
                }
            }

            for (let node_name of data.nodes) {
                delete app.nodes[node_name];
            }
            $saveButton.blinking();
        },
        addEdge: function (data, callback) {
            if (data.from === data.to) {
                show_error('This action would cause an infinite loop');
                return;
            }

            if (data.path === undefined)
                data.path = '_default';

            let edit_needed = false; // there is path name clash
            let occupied_values = new Set(); // prevent edges from overlapping
            let roundness = 0;

            let source_paths = app.nodes[data.from].parameters.destination_queues;
            for (let path_id in source_paths) {
                if (source_paths[path_id].includes(`${data.to}-queue`)) {
                    let smooth = app.network_data.edges.get(index).smooth;
                    occupied_values.add(smooth ? smooth.roundness : 0);

                    if(path_id === data.path) {
                        show_error('There is already a link between those bots with the same path, rename.');
                        edit_needed = true;
                    }
                }
            }

            if (occupied_values) {
                while(occupied_values.has(roundness)) {
                    roundness += 0.3;
                }
                data.smooth = {'type': 'curvedCCW', 'roundness': roundness};
            }

            let group_from = app.nodes[data.from].group;
            let group_to = app.nodes[data.to].group;
            let neighbors = ACCEPTED_NEIGHBORS[group_from];
            let available_neighbor = false;

            if (neighbors.includes(group_to)) {
                data.id = to_edge_id(data.from, data.to, data.path);
                callback(data);
                available_neighbor = true;
                let cautious = CAUTIOUS_NEIGHBORS[group_from] ?? [];
                if (cautious.includes(group_to)) {
                    show_error(`Node type ${group_from} can connect to the ${group_to}, however it's not so common.`);
                }
            }

            if (!available_neighbor) {
                if (neighbors.length === 0) {
                    show_error("Node type " + group_from + " can't connect to other nodes");
                } else {
                    show_error('Node type ' + group_from + ' can only connect to nodes of types: ' + neighbors.join());
                }
                return;
            }

            add_edge(data.from, data.to, data.path);

            $saveButton.blinking(data.from);
            if (edit_needed) {
                editPath(app, data.id, true);
            }
        },
        deleteEdge: function (data, callback) {
            let [from, to, path] = from_edge_id(data.edges[0]);
            let queue = app.nodes[from].parameters.destination_queues[path];
            remove_edge(from, to.replace(/-queue$/, ''), path);

            $saveButton.blinking(from);
            callback(data);
        }
    },
    layout: {
        hierarchical: false,
        randomSeed: undefined
    }
};

/**
 * Setting path name of a queue. If path already exists between bots, dialog re-appears.
 * If cancelled, previous path name is restored, or queue is deleted (if was just being added).
 * As this is not a standard-vis function, it has to be a separate method.
 *
 * @param app
 * @param edge id of the edge
 * @param adding True if edge is just being added (and shall be removed if we fail to provide a unique path name).
 */
function editPath(app, edge, adding=false) {
    let ok_clicked = false;
    let [from, to, original_path] = from_edge_id(edge);
    let nondefault_path = original_path === '_default' ? undefined : original_path;
    let new_path, nondefault_new_path;

    let $input = $("<input/>", {"placeholder": "_default", "val": nondefault_path});
    popupModal("Set the edge name", $input, () => {
        let in_val = $input.val();
        [new_path, nondefault_new_path] = (in_val && in_val !== '_default') ? [in_val, in_val] : ['_default', undefined];
        if (original_path === new_path) {
            return;
        }

        ok_clicked = true;
        $saveButton.blinking();
    }).on("hide.bs.modal", () => {
        let from_queues = app.nodes[from].parameters.destination_queues[new_path] ?? [];
        let duplicate_edge = from_queues.includes(`${to}-queue`);

        if (duplicate_edge) {
            if (ok_clicked) {
                show_error(`Could not add the queue ${new_path}, there already is such queue.`);
                return editPath(app, edge, adding);
            } else if(adding) {
                show_error(`Removing duplicate edge ${new_path}.`);
            } else {
                show_error("Keeping original path name.");
                return;
            }
        }

        if (ok_clicked) {
            let new_id = to_edge_id(from, to, new_path);

            remove_edge(from, to, original_path);
            app.network_data.edges.remove({"id": edge});

            add_edge(from, to, new_path);
            app.network_data.edges.add({"id": new_id, "from": from, "to": to, "label": nondefault_new_path});
        }
    });
}

/**
 * As this is not a standard-vis function, it has to be a separate method.
 */
function duplicateNode(app, bot) {
    let i = 2;
    //reserve a new unique name
    let newbie = "{0}-{1}".format(bot, i);
    while (newbie in app.nodes) {
        newbie = "{0}-{1}".format(bot, ++i);
    }
    // deep copy old bot information
    app.nodes[newbie] = $.extend(true, {}, app.nodes[bot]);
    app.nodes[newbie].id = newbie;
    // add to the Vis and focus
    app.network_data.nodes.add(convert_nodes([app.nodes[newbie]]));
    for (let id of app.network.getConnectedEdges(bot)) {
        let edge = app.network_data.edges.get(id);
        delete edge.id;
        if (edge.from === bot) {
            edge.from = newbie;
        }
        if (edge.to === bot) {
            edge.to = newbie;
        }
        app.network_data.edges.add(edge);
    }

    app.network.selectNodes([newbie]);
    app.network.focus(newbie);
    $saveButton.blinking();
}

function remove_edge(from, to, path) {
    let queues = app.nodes[from].parameters.destination_queues;
    let queue = queues[path];
    let to_index = queue.indexOf(`${to}-queue`);
    if (to_index !== -1)
        queue.splice(to_index, 1);

    if (queue.length === 0)
        delete queues[path];
}

function add_edge(from, to, path) {
    let queues = app.nodes[from].parameters.destination_queues;
    let queue = path in queues ? queues[path] : (queues[path] = []);
    queue.push(`${to}-queue`);
}
