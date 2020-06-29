var app = app || {};

function generate_positions_conf() {
    var new_positions = app.network.getPositions();
    new_positions = sortObjectByPropertyName(new_positions);

    new_positions["settings"] = settings;
    return JSON.stringify(new_positions, undefined, 4);
}

function read_positions_conf(config) {
    if("settings" in config) { // reload settings
        settings = config["settings"];
        if (settings.physics === null) {
            settings.physics = Object.keys(app.nodes).length < 40; // disable physics by default when there are more then 40 bots
        }
        delete config["settings"];
    }
    return config;
}

function getNodeData(data) {
    var networkNodes = [];

    data.forEach(function (elem, index, array) {
        networkNodes.push({id: elem.id, label: elem.id, x: elem.x, y: elem.y});
    });

    return networkNodes;
}

