function generate_pipeline_conf(edges) {
    var conf_string = '';
    var new_edges = {};
    
    for (index in edges) {
        var edge = edges[index];
        
        if (!new_edges[edge.from]) {
            new_edges[edge.from] = {
                'from': [],
                'to': []
            }
        }
        
        if (!new_edges[edge.to]) {
            new_edges[edge.to] = {
                'from': [],
                'to': []
            }
        }
        
        new_edges[edge.from].to.push(edge.to + '-queue');
        new_edges[edge.to].from.push(edge.from + '-queue');
    }
    
    for (id in new_edges) {
        var edge = new_edges[id];
        
        if (edge['from'].length > 0) {
            edge['from'] = id + '-queue';
        } else {
            edge['from'] = undefined;
        }
        
        if (edge['to'].length == 0) {
            edge['to'] = undefined;
        }
    }
    
    conf_string = JSON.stringify(new_edges, undefined, 4);
    
    return conf_string.replace(/\n/g, '\n<br>').replace(/ /g, "&nbsp;");
}

function read_pipeline_conf(config) {
    var edges = [];
    var i = 0;
    
    for (from in config) {
        for (index in config[from].to) {
               var edge_id = 'edge' + i++;
               var new_edge = {
                   'id': edge_id,
                   'from': from,
                   'to': config[from].to[index]
               };
               
               edges.push(new_edge);
        }
    }
    
    return edges;
}