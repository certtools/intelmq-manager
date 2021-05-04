// SPDX-FileCopyrightText: 2020 IntelMQ Team <intelmq-team@cert.at>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

function generate_defaults_conf(defaults) {
    defaults = sortObjectByPropertyName(defaults);
    return JSON.stringify(defaults, undefined, 4);
}

function read_defaults_conf(config) {
    global = {};

    for (key in config['global']) {
        try {
            global[key] = JSON.parse(config['global'][key]);
        } catch (err) {
            global[key] = config['global'][key];
        }
    }

    return global
}

function remove_defaults(nodes) {
    for (id in nodes) {
        delete nodes[id].defaults;
    }

    return nodes;
}
