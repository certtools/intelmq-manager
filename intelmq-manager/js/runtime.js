function generate_runtime_conf(nodes) {
    var conf_string = '';
    var save_keys = {};

    for (id in nodes) {
        save_keys[id] = {};
        save_keys[id]['parameters'] = {};

        for (index in nodes[id]) {
            if (STARTUP_KEYS.indexOf(index) == -1) {
                save_keys[id]['parameters'][index] = nodes[id][index];
            } else {
                if (index == 'enabled' && nodes[id][index] == true) {
                    delete nodes[id][index];
                } else {
                    save_keys[id][index] = nodes[id][index];
                }
            }
        }
        save_keys[id]['parameters'] = sortObjectByPropertyName(save_keys[id]['parameters'])
        save_keys[id] = sortObjectByPropertyName(save_keys[id])
        delete save_keys[id]['parameters']['id']
    }
    save_keys = sortObjectByPropertyName(save_keys)
    return JSON.stringify(save_keys, undefined, 4);
}

function read_runtime_conf(config) {
    var nodes = {};
    for (id in config) {
        var bot = config[id];
        nodes[id] = bot['parameters'];

        nodes[id]['id'] = id;
        nodes[id]['group'] = bot['group'];
        nodes[id]['name'] = bot['name'];
        nodes[id]['module'] = bot['module'];
        nodes[id]['description'] = bot['description'];
        if('enabled' in bot) {
            nodes[id]['enabled'] = bot['enabled'];
        } else {
            nodes[id]['enabled'] = true;
        }
    }

    return nodes;
}
