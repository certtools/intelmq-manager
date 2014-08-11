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
    
    conf_string = JSON.stringify(new_edges, undefined, 4);
    
    return '<p>' + conf_string.replace(/\n/g, '</p>\n<p>').replace(/ /g, "&nbsp;") + '</p>';
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