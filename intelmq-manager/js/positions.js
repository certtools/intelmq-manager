function generate_positions_conf() {
    var new_positions = network.getPositions();
    new_positions = sortObjectByPropertyName(new_positions);

    return JSON.stringify(new_positions, undefined, 4);
}

function read_positions_conf(config) {
    return config;
}

function getNodeData(data) {
    var networkNodes = [];

    data.forEach(function(elem, index, array) {
        networkNodes.push({id: elem.id, label: elem.id, x: elem.x, y: elem.y});
    });

    return networkNodes;
}

