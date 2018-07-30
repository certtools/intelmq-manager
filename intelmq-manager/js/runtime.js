app = {}; // will be later redefined as a VisModel object or any other object (used in Configuration and Monitor tab)

function generate_runtime_conf(nodes) {

    var tmp_nodes = nodes;

    sortObjectByPropertyName(tmp_nodes);
    for (let id in tmp_nodes) {
        delete tmp_nodes[id].id;
        if ('parameters' in tmp_nodes[id]) {
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
        if ('enabled' in bot) {
            nodes[id]['enabled'] = bot['enabled'];
        } else {
            nodes[id]['enabled'] = true;
        }
        if ('run_mode' in bot) {
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


// Configuration files fetching
function load_configuration(callback = () => {}) {
    load_file(DEFAULTS_FILE, (config) => {
        app.defaults = read_defaults_conf(config);
        load_file(RUNTIME_FILE, (config) => {
            app.nodes = read_runtime_conf(config);
            load_file(PIPELINE_FILE, (config) => {
                    app.edges = read_pipeline_conf(config, app.nodes);
                    app.nodes = add_defaults_to_nodes(app.nodes, app.defaults);
                if (typeof read_positions_conf !== "undefined") { // skipped on Monitor tab
                    load_file(POSITIONS_FILE, (config) => {
                        app.positions = read_positions_conf(config);
                        draw();
                        resize();

                        callback();
                    });
                } else {
                    callback();
                }
            });
        });
    });
}