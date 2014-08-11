function generate_runtime_conf(nodes) {
    var conf_string = '';
    var new_nodes = [];
    var save_keys = {};
    
    for (id in nodes) {
        var bot=nodes[id];
        save_keys[id] = {};
        
        for (index in STARTUP_KEYS) {
            save_keys[id][STARTUP_KEYS[index]] = bot[STARTUP_KEYS[index]];
            delete bot[STARTUP_KEYS[index]];
        }
        
        new_nodes.push(bot);
    }
    
    conf_string = JSON.stringify(new_nodes, undefined, 4);
    
    for (id in nodes) {
        var bot=nodes[id];
        for (index in STARTUP_KEYS) {
            bot[STARTUP_KEYS[index]] = save_keys[id][STARTUP_KEYS[index]];
        }
    }
    
    return '<p>' + conf_string.replace(/\n/g, '</p>\n<p>').replace(/ /g, "&nbsp;") + '</p>';
}

function read_runtime_conf(config) {
    var nodes = {};
    
    for (index in config) {
        var bot = config[index];
        
        nodes[bot['id']] = bot;
    }
    
    return nodes;
}