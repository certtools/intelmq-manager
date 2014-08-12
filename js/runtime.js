function generate_runtime_conf(nodes) {
    var conf_string = '';
    var new_nodes = {};
    var save_keys = {};
    
    for (id in nodes) {
        var bot=nodes[id];
        save_keys[id] = {};
        
        for (index in STARTUP_KEYS) {
            save_keys[id][STARTUP_KEYS[index]] = bot[STARTUP_KEYS[index]];
            delete bot[STARTUP_KEYS[index]];
        }
        
        save_keys[id]['id'] = bot['id'];
        delete bot['id'];
        
        new_nodes[id] = bot;
    }
    
    conf_string = JSON.stringify(new_nodes, undefined, 4);
    
    for (id in nodes) {
        var bot=nodes[id];
        for (index in STARTUP_KEYS) {
            bot[STARTUP_KEYS[index]] = save_keys[id][STARTUP_KEYS[index]];
        }
        
        bot['id'] = save_keys[id]['id'];
    }
    
    return conf_string.replace(/\n/g, '\n<br>').replace(/ /g, "&nbsp;");
}

function read_runtime_conf(config) {
    var nodes = {};
    
    for (id in config) {
        var bot = config[id];
        
        bot['id'] = id;
        nodes[id] = bot;
    }
    
    return nodes;
}