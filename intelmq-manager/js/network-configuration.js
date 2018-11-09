/**
 * Big variable options, passed to vis library.
 * There is also all the manipulation methods.
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
        navigationButtons: true
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

            for (index in app.edges) {
                if (app.edges[index].from == data.from && app.edges[index].to == data.to) {
                    show_error('There is already a link between those bots');
                    return;
                }
            }

            var neighbors = ACCEPTED_NEIGHBORS[app.nodes[data.from].group];
            var available_neighbor = false;
            for (index in neighbors) {
                if (app.nodes[data.to].group == neighbors[index]) {
                    callback(data);
                    available_neighbor = true;
                }
            }

            if (!available_neighbor) {
                if (neighbors.length == 0) {
                    show_error("Node type " + app.nodes[data.from].group + " can't connect to other nodes");
                } else {
                    show_error('Node type ' + app.nodes[data.from].group + ' can only connect to nodes of types: ' + neighbors.join());
                }
                return;
            }


            if (app.edges[data.id] === undefined) {
                app.edges[data.id] = {};
            }

            app.edges[data.id] = {'from': data.from, 'to': data.to};
            $saveButton.blinking();
        },
        deleteEdge: function (data, callback) {
            delete app.edges[data["edges"][0]];
            callback(data);
            $saveButton.blinking();
        }
    },
    layout: {
        hierarchical: false,
        randomSeed: undefined
    }
};


/**
 * Setting path name.
 * As this is not a standard-vis function, it has to be a separate method.
 */
function editPath(app, edge) {
    let $input = $("<input/>", {"placeholder": "_default", "val": app.edges[edge]["path"]});
    popupModal("Set the edge name", $input, () => {
        if(app.edges[edge]["path"] === $input.val()) {
            return;
        }
        app.edges[edge]["path"] = $input.val();
        app.network_data.edges.update({"id": edge, "label": $input.val()});
        $saveButton.blinking();
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