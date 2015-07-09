function generate_defaults_conf(defaults) {
    var conf_string = '';
    
    return conf_string;
}

function read_defaults_conf(config) {
    return config
}

function remove_defaults(nodes, defaults) {
    for (id in nodes) {
        var node=nodes[id];
        
        for (key in defaults) {
            if (key in node && node[key] == defaults[key]) {
                delete node[key];
            }
        }
    }

    return nodes;
}

function add_defaults_to_nodes(nodes, defaults) {
    for (id in nodes) {
        var node=nodes[id];

        for (key in defaults) {
            if (key in node) {
                continue;
            }

            node[key] = defaults[key];
        }
    }

    return nodes;
}
