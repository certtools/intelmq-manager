function generate_pipeline_conf(edges) {
    var conf_string = '';
    var new_edges = {};
    
    for (index in edges) {
        var edge = edges[index];
        
        if (!new_edges[edge.from]) {
            new_edges[edge.from] = {
                'source-queue': [],
                'destination-queues': []
            }
        }
        
        if (!new_edges[edge.to]) {
            new_edges[edge.to] = {
                'source-queue': [],
                'destination-queues': []
            }
        }
        
        new_edges[edge.from]['destination-queues'].push(edge.to + '-queue');
        new_edges[edge.to]['source-queue'].push(edge.from + '-queue');
    }
    
    for (id in new_edges) {
        var edge = new_edges[id];
        
        if (edge['source-queue'].length > 0) {
            edge['source-queue'] = id + '-queue';
        } else {
            edge['source-queue'] = undefined;
        }
        
        if (edge['destination-queues'].length == 0) {
            edge['destination-queues'] = undefined;
        }
    }
    
    conf_string = JSON.stringify(new_edges, undefined, 4);
    
    return conf_string.replace(/\n/g, '\n<br>').replace(/ /g, "&nbsp;");
}

function read_pipeline_conf(config) {
    console.info("Starting function");
    var edges = [];
    var i = 0;
    
    console.info("Reading config: " + JSON.stringify(config))
    for (from in config) {
        if (config[from]['destination-queues'] != undefined) {
            console.dir(config[from]);
            for (index in config[from]['destination-queues']) {
                var edge_id = 'edge' + i++;
                var new_edge = {
                    'id': edge_id,
                    'from': from,
                    'to': config[from]['destination-queues'][index].replace(/-queue$/, "")
                };
                
                edges.push(new_edge);
            }
        }
    }
    
    console.info("Returning edges:");
    console.dir(edges);
    
    console.info("Getting tha fuck out");
    return edges;
}