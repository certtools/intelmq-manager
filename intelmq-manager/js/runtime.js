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
    bot_definition = config;
    let nodes = {};
    for (let bot_id in config) {
        bot_definition[bot_id].groupname = GROUPNAME_TO_GROUP[bot_definition[bot_id].group]; // translate ex: `Parser` to `parsers`
        let bot = config[bot_id];
        nodes[bot_id] = bot;
        nodes[bot_id]['bot_id'] = bot_id;
        if ('enabled' in bot) {
            nodes[bot_id]['enabled'] = bot['enabled'];
        } else {
            nodes[bot_id]['enabled'] = true;
        }
        if ('run_mode' in bot) {
            nodes[bot_id]['run_mode'] = bot['run_mode'];
        } else {
            nodes[bot_id]['run_mode'] = 'continuous';
        }
    }

    return nodes;
}

function load_file(url, callback) {
    $.getJSON(url)
            .done(function (json) {
                try {
                    callback(json);
                }
                catch(e) {
                    // don't bother to display error, I think the problem will be clearly seen with the resource itself, not within the processing
                    show_error('Failed to load config file properly <a class="command" href="{0}">{1}</a>.'.format(url, url));
                }
            })
            .fail(function (jqxhr, textStatus, error) {
                var err = textStatus + ", " + error;
                show_error('Get an error <b>{0}</b> when trying to obtain config file properly <a class="command" href="{1}">{2}</a>.'.format(err, url, url));
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