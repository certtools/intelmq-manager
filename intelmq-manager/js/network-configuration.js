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
                color: GROUP_COLORS['Collector'],
            },
            Parser: {
                shape: 'box',
                color: GROUP_COLORS['Parser']
            },
            Expert: {
                shape: 'box',
                color: GROUP_COLORS['Expert'],
                fontColor: "#FFFFFF"
            },
            Output: {
                shape: 'box',
                color: GROUP_COLORS['Output']
            }
        },

        manipulation: {
            enabled: true,
            initiallyActive: true,
            addNode: true,
            addEdge: true,
            editNode: true,
            editEdge: false,
            deleteNode: true,
            deleteEdge: true,

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
                    delete edges[data.edges[index]];
                }

                for (index in data.nodes) {
                    delete nodes[data.nodes[index]];
                }
                enableSaveButtonBlinking();
            },
            addEdge: function (data, callback) {
                if (data.from == data.to) {
                    show_error('This action would cause an infinite loop');
                    return;
                }

                for (index in edges) {
                    if (edges[index].from == data.from && edges[index].to == data.to) {
                        show_error('There is already a link between those bots');
                        return;
                    }
                }

                var neighbors = ACCEPTED_NEIGHBORS[nodes[data.from].group];
                var available_neighbor = false;
                for (index in neighbors) {
                    if (nodes[data.to].group == neighbors[index]) {
                        callback(data);
                        available_neighbor = true;
                    }
                }

                if (!available_neighbor) {
                    if (neighbors.length == 0) {
                        show_error("Node type " + nodes[data.from].group + " can't connect to other nodes");
                    } else {
                        show_error('Node type ' + nodes[data.from].group + ' can only connect to nodes of types: ' + neighbors.join());
                    }
                    return;
                }


                if (edges[data.id] === undefined) {
                    edges[data.id] = {};
                }

                edges[data.id] = {'from': data.from, 'to': data.to};
                enableSaveButtonBlinking();
            },
            deleteEdge: function (data, callback) {
                delete edges[data["edges"][0]];
                callback(data);
                enableSaveButtonBlinking();
            }
        },
        layout: {
            hierarchical: false,
            randomSeed: undefined
        }
    };