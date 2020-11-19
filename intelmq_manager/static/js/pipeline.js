/**
 * This object may accept/returns destination queues from pipeline.conf.
 *
 * Destination queues may be:
 *  * undefined if no queue is present
 *  * or in a short form of a mere list [...],
 *  * or in a combined form {"_default": "string"}
 *  * or in a full form {"_default": ["list", ...]}
 * @param {mixed} paths Object from pipeline.conf
 */
function DestinationQueues(paths = null) {
    this.paths = {};
    this.add = function (queue, path = undefined) {
        // add a new queue
        if (!path) {
            path = "_default";
        }
        if (!this.paths[path]) {
            this.paths[path] = [];
        }
        this.paths[path].push(queue);
    };

    if (paths) { // set initial form
        if (Array.isArray(paths)) { // ["non-named-queues-list", ]
            for (let queue of paths) {
                this.add(queue);
            }
        } else {
            for (let path in paths) {
                if (typeof (paths[path]) === "string") { // {"_default": "string"}
                    this.add(paths[path], path);
                } else {
                    for (let queue of paths[path]) { // {"_default": ["list", ]}
                        this.add(queue, path);
                    }
                }
            }
        }
    }
    this.getFullForm = function () {
        return this.paths;
    };
    this.getShortForm = function () {
        let retval = Object.assign({}, this.paths);
        for (let path in this.paths) {
            if (this.paths[path].length === 0) {
                delete retval[path];
            } else if (this.paths[path].length === 1) {
                retval[path] = this.paths[path][0];
            }
        }
        let keys = Object.keys(this.paths);
        if (keys.length === 0) {
            return undefined;
        } else if (keys.length === 1 && keys[0] === "_default") {
            return Array.isArray(retval["_default"]) ? retval["_default"].sort() : [retval["_default"]];
        } else {
            return sortObjectByPropertyName(retval);
        }
    };
}



function generate_pipeline_conf(edges) {
    var new_edges = {};

    for (let index in edges) {
        var edge = edges[index];

        if (!new_edges[edge.from]) {
            new_edges[edge.from] = {
                'source-queue': [],
                'destination-queues': new DestinationQueues()
            };
        }

        if (!new_edges[edge.to]) {
            new_edges[edge.to] = {
                'source-queue': [],
                'destination-queues': new DestinationQueues()
            };
        }

        new_edges[edge.from]['destination-queues'].add(edge.to + "-queue", edge.path); //push(queue);
        new_edges[edge.to]['source-queue'].push(edge.from + '-queue');
    }

    for (let id in new_edges) {
        var edge = new_edges[id];

        if (edge['source-queue'].length > 0) {
            edge['source-queue'] = id + '-queue';
        } else {
            edge['source-queue'] = undefined;
        }

        edge['destination-queues'] = edge['destination-queues'].getShortForm();
        edge = sortObjectByPropertyName(edge);
    }

    new_edges = sortObjectByPropertyName(new_edges);
    return JSON.stringify(new_edges, undefined, 4);
}

function read_pipeline_conf(config, nodes) {
    var edges = {};
    var i = 0;

    for (let from in config) {
        if (config[from]['destination-queues'] !== undefined) {
            let queues = (new DestinationQueues(config[from]['destination-queues'])).getFullForm();
            for (let path in queues) {
                for (let queue of queues[path]) {
                    var to_node = queue.replace(/-queue$/, "");
                    if (nodes[from] !== undefined && nodes[to_node] !== undefined) {
                        var edge_id = 'edge' + i++;
                        var new_edge = {
                            'id': edge_id,
                            'from': from,
                            'to': to_node
                        };
                        if (path !== "_default") {
                            new_edge["path"] = path;
                        }

                        edges[edge_id] = new_edge;
                    }
                }
            }
        }
    }

    return edges;
}