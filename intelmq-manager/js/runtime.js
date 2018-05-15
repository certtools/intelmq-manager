function generate_runtime_conf(nodes) {

    var tmp_nodes = nodes;

    sortObjectByPropertyName(tmp_nodes);
    for (let id in tmp_nodes) {
        delete tmp_nodes[id].id;
        if('parameters' in tmp_nodes[id]) {
            sortObjectByPropertyName(tmp_nodes[id].parameters);
        }
        sortObjectByPropertyName(tmp_nodes[id]);
    }

    return JSON.stringify(tmp_nodes, undefined, 4);
}

function read_runtime_conf(config) {
    var nodes = {};
    for (id in config) {
        var bot = config[id];
        nodes[id] = bot;
        nodes[id]['id'] = id;
        if('enabled' in bot) {
            nodes[id]['enabled'] = bot['enabled'];
        } else {
            nodes[id]['enabled'] = true;
        }
        if('run_mode' in bot) {
            nodes[id]['run_mode'] = bot['run_mode'];
        } else {
            nodes[id]['run_mode'] = 'continuous';
        }
    }

    return nodes;
}

function load_file(url, callback) {
    $.getJSON(url)
            .done(function (json) {
                callback(json);
            })
            .fail(function (jqxhr, textStatus, error) {
                var err = textStatus + ", " + error;
                show_error('Failed to obtain JSON: ' + url + ' with error: ' + err);
                callback({});
            });
}
