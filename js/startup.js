function generate_startup_conf(nodes) {
    var conf_string = '';
    var new_nodes = [];
    var save_keys = {};
    
    for (id in nodes) {
        var bot=nodes[id];
        save_keys[id] = {'id': id};
        
        for (index in STARTUP_KEYS) {
            save_keys[id][STARTUP_KEYS[index]] = bot[STARTUP_KEYS[index]];
        }
        
        new_nodes.push(save_keys[id]);
    }
    
    conf_string = JSON.stringify(new_nodes, undefined, 4);
    
    return '<p>' + conf_string.replace(/\n/g, '</p>\n<p>').replace(/ /g, "&nbsp;") + '</p>';
}

function read_startup_conf(config, nodes) {
    for (index in config) {
        var bot = config[index];
        
        nodes[bot['id']]['group'] = bot['group'];
        nodes[bot['id']]['name'] = bot['name'];
        nodes[bot['id']]['module'] = bot['module'];
        nodes[bot['id']]['description'] = bot['description'];
    }
    
    return nodes;
}
