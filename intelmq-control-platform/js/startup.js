function generate_startup_conf(nodes) {
    var conf_string = '';
    var new_nodes = {};
    var save_keys = {};
    
    for (id in nodes) {
        var bot=nodes[id];
        save_keys[id] = {};
        
        for (index in STARTUP_KEYS) {
            save_keys[id][STARTUP_KEYS[index]] = bot[STARTUP_KEYS[index]];
        }
        
        
        new_nodes[id] = save_keys[id];
    }
    
    conf_string = JSON.stringify(new_nodes, undefined, 4);
    
    return conf_string;
}

function read_startup_conf(config, nodes) {
    for (id in config) {
        var bot = config[id];
        
        nodes[id]['group'] = bot['group'];
        nodes[id]['name'] = bot['name'];
        nodes[id]['module'] = bot['module'];
        nodes[id]['description'] = bot['description'];
    }
    
    return nodes;
}
