/**
 * Big variable options, passed to vis library.
 * There are also all the manipulation methods.
 */

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

        addNode: function (data, callback) {
            create_form("Add Node", data, callback);
        },
        editNode: function (data, callback) {
            create_form("Edit Node", data, callback);
            fill_bot(data.id, undefined, undefined);
        },
        deleteNode: function (data, callback) {
            callback(data);

            for (index in data.edges) {
                delete app.edges[data.edges[index]];
            }

            for (index in data.nodes) {
                delete app.nodes[data.nodes[index]];
            }
            $saveButton.blinking();
        },
        addEdge: function (data, callback) {
            if (data.from == data.to) {
                show_error('This action would cause an infinite loop');
                return;
            }

            let edit_needed = false; // there is path name clash
            let occupied_values = new Set(); // prevent edges from overlapping
            let roundness = 0;
            for (let index in app.edges) {
                if (app.edges[index].from == data.from && app.edges[index].to == data.to) {
                    let smooth = app.network_data.edges.get(index).smooth;
                    occupied_values.add(smooth? smooth.roundness : 0);

                    if (app.edges[index].path == data.path) {
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
            for (let index in neighbors) {
                if (group_to == neighbors[index]) {
                    callback(data);
                    available_neighbor = true;
                    if(CAUTIOUS_NEIGHBORS[group_from] && CAUTIOUS_NEIGHBORS[group_from].indexOf(group_to) !== -1) {
                        show_error('Node type ' + group_from + ' can connect to the ' + group_to + ', however it\'s not so common.');
                    }
                }
            }

            if (!available_neighbor) {
                if (neighbors.length == 0) {
                    show_error("Node type " + group_from + " can't connect to other nodes");
                } else {
                    show_error('Node type ' + group_from + ' can only connect to nodes of types: ' + neighbors.join());
                }
                return;
            }


            if (app.edges[data.id] === undefined) {
                app.edges[data.id] = {};
            }
            app.edges[data.id] = {'from': data.from, 'to': data.to};
            $saveButton.blinking(data.from);
            if (edit_needed) {
                editPath(app, data.id, true);
            }
        },
        deleteEdge: function (data, callback) {
            $saveButton.blinking(app.edges[data["edges"][0]].from);
            delete app.edges[data["edges"][0]];
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
    let data = app.edges[edge];
    data.original_path = data.original_path  || data.path || true;
    console.log('169: "orig path"(): ', "orig path", data);
    let $input = $("<input/>", {"placeholder": "_default", "val": data.path});
    popupModal("Set the edge name", $input, () => {
        ok_clicked = true;
        console.log('161: 1, data["path"], $input.val()(): ', 1, data.path, $input.val());
        if (data.path === $input.val()) {
            console.log('163: 2(): ', 2);
            return;
        }
        console.log('166: 3(): ', 3);
        data.path = $input.val();
        if (!data.path) {
            delete data.path;
        }
        app.network_data.edges.update({"id": edge, "label": $input.val()});
        $saveButton.blinking();
    }).on("hide.bs.modal", () => {
        for (let index in app.edges) {
            if (index !== edge &&
                app.edges[index].from == data.from &&
                app.edges[index].to == data.to &&
                app.edges[index].path == data.path) {
                let path_name = data.path || "_default";
                if (ok_clicked) {
                    show_error(`Could not add the queue ${path_name}, there already is such queue.`);
                    return editPath(app, edge, adding);
                } else if(adding) {
                    show_error(`Removing duplicate edge ${path_name}.`);
                    app.network_data.edges.remove({"id": edge});
                    delete app.edges[edge];
                } else {
                    data.path = (data.original_path === true)?undefined:data.original_path;
                    show_error(`Restoring original path name.`);
                    app.network_data.edges.update({"id": edge, "label": data.path});
                }
            }

        }
    delete data.original_path;
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
    app.nodes[newbie]["id"] = newbie;
    // add to the Vis and focus
    app.network_data.nodes.add(convert_nodes([app.nodes[newbie]]));
    for (let id of app.network.getConnectedEdges(bot)) {
        let edge = app.network_data.edges.get(id);
        delete edge["id"];
        if (edge["from"] === bot) {
            edge["from"] = newbie;
        }
        if (edge["to"] === bot) {
            edge["to"] = newbie;
        }
        app.network_data.edges.add(edge);
    }

    app.network.selectNodes([newbie]);
    app.network.focus(newbie);
    $saveButton.blinking();
}