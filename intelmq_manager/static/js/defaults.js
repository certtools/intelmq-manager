// SPDX-FileCopyrightText: 2020 IntelMQ Team <intelmq-team@cert.at>
//
// SPDX-License-Identifier: AGPL-3.0-or-later
'use strict';

function generate_defaults_conf(defaults) {
    return JSON.stringify(sortObjectByPropertyName(defaults), undefined, 4);
}

function read_defaults_conf(config) {
    let global = {};

    for (let key in config.global) {
        try {
            global[key] = JSON.parse(config.global[key]);
        } catch (err) {
            global[key] = config.global[key];
        }
    }

    return global;
}

function remove_defaults(nodes) {
    for (let id in nodes) {
        delete nodes[id].defaults;
    }

    return nodes;
}

function get_reverse_connections(dest_bot_id) {
    let out = [];

    let dest_bot = app.nodes[dest_bot_id];
    let reverse_allowed_neighbors = Object.entries(ACCEPTED_NEIGHBORS).filter(pair => pair[1].includes(dest_bot.group)).map(pair => pair[0]);

    for (let src_bot of Object.values(app.nodes)) {
        if (!reverse_allowed_neighbors.includes(src_bot.group))
            continue;

        for (let list of Object.values(src_bot.parameters.destination_queues)) {
            if (list.includes(`${dest_bot_id}-queue`)) {
                out.push(src_bot);
                break;
            }
        }
    }

    return out;
}

function to_edge_id(from, to, path) { // e.g HTTP-Collector|JSON-Parser-queue|_default
//    return [from, `${to}-queue`, path].map(escape).join('|');
    return [from, to.replace(/-queue$/, ''), path].map(escape).join('|');
}

function from_edge_id(edge_id) {
    let [from, to, path] = edge_id.split('|').map(unescape);
    return [from, `${to}-queue`, path];
}
