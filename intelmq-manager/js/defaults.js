function generate_defaults_conf(defaults) {
    defaults = sortObjectByPropertyName(defaults);
    return JSON.stringify(defaults, undefined, 4);
}

function read_defaults_conf(config) {

    for (key in config) {
        try {
            config[key] = JSON.parse(config[key]);
        } catch (err) {
            config[key] = config[key];
        }
    }

    return config
}

function remove_defaults(nodes) {
    for (id in nodes) {
        delete nodes[id].defaults;
    }

    return nodes;
}

function add_defaults_to_nodes(nodes, defaultConfig) {
    var defaults = 'defaults';
    for (id in nodes) {
        var node=nodes[id];
        node.id = id;
        node.defaults = {};

        for (key in defaultConfig) {
            if (key in node.parameters) {
                continue;
            } else {
                node.defaults[key] = defaultConfig[key];
            }
        }
    }

    return nodes;
}
