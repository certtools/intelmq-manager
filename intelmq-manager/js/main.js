var nodes = {};
var edges = {};
var bots = {};

var graph = null;
var graph_container = null;
var popup = null;
var span = null;
var table = null;

$(window).on('hashchange', function() {
  location.reload();
});

function resize() {
    // Resize body
    var body = document.getElementsByTagName('body')[0];
    body.style.height = window.innerHeight + "px";
    body.style.overflowX = "hidden";
    body.style.overflowY = "hidden";
    
    
    var graph_container = document.getElementById('graph-container');
    graph_container.style.height = (window.innerHeight - graph_container.offsetTop) + "px";
    graph_container.style.overflowX = "auto";
    graph_container.style.overflowY = "auto";
    
    if (graph != null && graph != undefined) {
        graph.redraw();
    }
    
    load_html_elements();
}

function load_html_elements() {
    // Load popup, span and table
    graph_container = document.getElementById('graph-container');
    popup = document.getElementById("graph-popUp");
    span = document.getElementById('graph-popUp-title');
    table = document.getElementById("graph-popUp-fields");
}

function load_file(url, callback) {
    $.getJSON(url)
        .done(function (json) {
            callback(json);
        })
        .fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            alert('Failed to obtain JSON: ' + err);
        });
}

function load_bots(config) {
    var available_bots = document.getElementById("side-menu")
    //available_bots.innerHTML = '';
    
    for(bot_group in config) {
        var group = config[bot_group];
        
        group_title = document.createElement('a');
        group_title.innerHTML = bot_group + '<span class="fa arrow"></span>';
        
        var new_element = group_title.cloneNode(true);
        
        bots_submenu = document.createElement('ul');
        bots_submenu.setAttribute('class', 'nav nav-second-level collapse');

        group_menu = document.createElement('li');
        group_menu.appendChild(new_element);
        group_menu.appendChild(bots_submenu);
        group_menu.style.borderBottomColor = GROUP_COLORS[bot_group];
        
        available_bots.appendChild(group_menu);
        
        for (bot_name in group) {
            var bot = group[bot_name];
            
            var bot_title = document.createElement('a');
            bot_title.setAttribute('data-toggle', 'tooltip');
            bot_title.setAttribute('data-placement', 'right');
            bot_title.setAttribute('title', bot['description']);
            bot_title.setAttribute('onclick', 'fill_bot(undefined, "' + bot_group + '", "' + bot_name + '")');
            bot_title.innerHTML = bot_name;
            
            var bot_submenu = document.createElement('li');
            bot_submenu.appendChild(bot_title);
            
            bots_submenu.appendChild(bot_submenu);
            
            if (bots[bot_group] === undefined) {
                bots[bot_group] = {};
            }
            
            bots[bot_group][bot_name] = {
                'name': bot_name,
                'group': bot_group,
                'module': bot['module'],
                'description': bot['description']
            }
            
            for (parameter in bot['parameters']) {
                var value = bot['parameters'][parameter];
                bots[bot_group][bot_name][parameter] = value;
            }
        }
    }
    
    $('#side-menu').metisMenu({'restart': true});
    
    load_file(RUNTIME_FILE, load_runtime);
}

function load_runtime(config) {
    nodes = read_runtime_conf(config);
        
    load_file(STARTUP_FILE, load_startup);
}

function load_startup(config) {
    nodes = read_startup_conf(config, nodes);   
    
    load_file(PIPELINE_FILE, load_pipeline);
}

function load_pipeline(config) {
    edges = read_pipeline_conf(config, nodes);
        
    draw();
    resize();
}

function save_data_on_files() {
    if(!confirm("By clicking 'OK' you are replacing the configuration in your files by the one represented by the graph on this page. Do you agree?")) {
        return;
    }
    
    var alert_error = function (file, jqxhr, textStatus, error) {
        alert('There was an error saving ' + file + ':\nStatus: ' + textStatus + '\nError: ' + error);
    }

    $.post('./php/save.php?file=runtime', generate_runtime_conf(nodes))
        .fail(function (jqxhr, textStatus, error) {
            alert_error('runtime', jqxhr, textStatus, error);
        });
        
    $.post('./php/save.php?file=startup', generate_startup_conf(nodes))
        .fail(function (jqxhr, textStatus, error) {
            alert_error('startup', jqxhr, textStatus, error);
        });
        
    $.post('./php/save.php?file=pipeline', generate_pipeline_conf(edges))
        .fail(function (jqxhr, textStatus, error) {
            alert_error('pipeline', jqxhr, textStatus, error);
        });
}

function convert_edges(edges) {
    var new_edges = [];
    
    for (index in edges) {
        var new_edge = {};
        new_edge.id = edges[index]['id'];
        new_edge.from = edges[index]['from'];
        new_edge.to = edges[index]['to'];
        
        new_edges.push(new_edge);
    }
    
    return new_edges;
}

function convert_nodes(nodes) {
    var new_nodes = [];
    
    for (index in nodes) {
        var new_node = {};
        new_node.id = nodes[index]['id'];
        new_node.label = nodes[index]['id'];
        new_node.group = nodes[index]['group'];
        new_node.title = JSON.stringify(nodes[index], undefined, 2).replace(/\n/g, '\n<br>').replace(/ /g, "&nbsp;");
        
        new_nodes.push(new_node);
    }
    
    return new_nodes;
}

function fill_bot(id, group, name) {
    var bot = {};
    table.innerHTML = '';
    
    if (id === undefined) {
        bot = bots[group][name];
        
        var new_row = table.insertRow(-1);
        var cell1 = new_row.insertCell(0);
        var cell2 = new_row.insertCell(1);
        
        cell1.setAttribute('class', 'node-key');
        cell2.setAttribute('class', 'node-value');
        
        cell1.innerHTML = 'id';
        var element = document.createElement("input");
        element.setAttribute('type', 'text');
        element.setAttribute('id', 'node-id');
        
        name = bot['name'].replace(/\ /g,'-')
        group = bot['group'].replace(/\ /g,'-')
        default_id = name + "-" + group
        
        element.setAttribute('value', default_id.toLowerCase());
        cell2.appendChild(element);
    }
    else {
        bot = nodes[id];
        var element = document.createElement("input");
        element.setAttribute('type', 'hidden');
        element.setAttribute('id', 'old-id-from-node');
        element.setAttribute('value', id);
        popup.appendChild(element);
    }
    
    for (key in bot) {
        var startup = false;
        for (index in STARTUP_KEYS) {
            if (key == STARTUP_KEYS[index]) {
                startup = true;
            }
        }
        
        element = document.getElementById("node-" + key)
        
        if (!element) {
            new_row = table.insertRow(-1);
            cell1 = new_row.insertCell(0);
            cell2 = new_row.insertCell(1);
            
            cell1.setAttribute('class', 'node-key');
            cell2.setAttribute('class', 'node-value');
            
            cell1.innerHTML = key;
            element = document.createElement("input");
            element.setAttribute('type', 'text');
            
            if (startup) {
                element.setAttribute('disabled', 'true');
            }
            
            element.setAttribute('id', 'node-' + key);
            cell2.appendChild(element);
        }
        
        element.setAttribute('value', bot[key]);    
    }
    
    popup.setAttribute('class', "with-bot");
}

function saveData(data,callback) {
    var idInput = document.getElementById('node-id');
    var groupInput = document.getElementById('node-group');
    var oldIdInput = document.getElementById('old-id-from-node');
    
    if (idInput == undefined && groupInput == undefined) {
        return;
    }
    
    if (oldIdInput != undefined) {
        if (idInput.value != oldIdInput.value) {
            if(!confirm("When you edit an ID what you are doing in fact is to create a clone of the current bot. You will have to delete the old one manually. Proceed with the operation?")) {
                return;
            }
        }
    }
    
    data.id = idInput.value;
    data.group = groupInput.value;
    //data.level = GROUP_LEVELS[data.group];
    
    if (!BOT_ID_REGEX.test(data.id)) {
        alert("Bot ID's can only be composed of numbers, letters and hiphens");
        return;
    }
    
    node = {};
    
    var inputs = document.getElementsByTagName("input");
    for(var i = 0; i < inputs.length; i++) {
        if(inputs[i].id.indexOf('node-') == 0) {
            var key = inputs[i].id.replace('node-', '');
            node[key] = inputs[i].value;
        }
    }
    
    data.label = node['id'];
    
    data.title = JSON.stringify(node, undefined, 2).replace(/\n/g, '\n<br>').replace(/ /g, "&nbsp;");
    
    nodes[data.id] = node;

    clearPopUp();
    callback(data);
}

function create_form(title, data, callback){
    span.innerHTML = title;
    
    var saveButton = document.getElementById('graph-popUp-save');
    var cancelButton = document.getElementById('graph-popUp-cancel');
    saveButton.onclick = saveData.bind(this,data,callback);
    cancelButton.onclick = clearPopUp.bind();
    
    table.innerHTML="<p>Please select one of the bots on the left</p>";
    popup.style.display = 'block';
    popup.setAttribute('class', "without-bot");
}

function clearPopUp() {
    var saveButton = document.getElementById('graph-popUp-save');
    var cancelButton = document.getElementById('graph-popUp-cancel');
    saveButton.onclick = null;
    cancelButton.onclick = null;

    popup.style.display = 'none';
    span.innerHTML = "";

    for (i = table.rows.length-1; i >= 0; i--) { 
        var position = table.rows[i].rowIndex;
        
        if (position >= CORE_FIELDS) {
            table.deleteRow(position);
        } else {
            table.rows[i].setAttribute('value', '');
        }
    }
    
    popup.setAttribute('class', "without-bot");
}

function draw() {
    load_html_elements();
    
    var data = {};
    
    if (window.location.hash == '#load') {
        data = {
            nodes: convert_nodes(nodes),
            edges: convert_edges(edges)
        };
    }

    var options = {
        physics: {
            barnesHut: {
                enabled: false
            }, 
            repulsion: {
                nodeDistance: 200,
                springLength: 200
            }
        },
        tooltip: {
            fontFace: 'arial',
        },
        nodes: {
            fontFace: 'arial'
        },
        edges: {
            fontFace: 'arial',
            length: 500,
            width: 3,
            style: 'arrow',
            arrowScaleFactor: 0.5
        },
        groups: {
            Collector: {
//                shape: 'circle',
                shape: 'box',
                color: GROUP_COLORS['Collector'],
            },
            Parser: {
//                shape: 'ellipse',
                shape: 'box',
                color: GROUP_COLORS['Parser']
            },
            Expert: {
                shape: 'box',
                color: GROUP_COLORS['Expert'],
                fontColor: "#FFFFFF"
            },
            Output: {
//                shape: 'database',
                shape: 'box',
                color: GROUP_COLORS['Output']
            }
        },
        stabilize: false,
        dataManipulation: {
            enabled: true,
            initiallyVisible: true
        },
        navigation: true,
        onAdd: function(data,callback) {
            create_form("Add Node", data, callback);            
        },
        onEdit: function(data,callback) {
            create_form("Edit Node", data, callback);
            fill_bot(data.id, undefined, undefined);
        },
        onConnect: function(data,callback) {
            if (data.from == data.to) {
                alert('This action would cause an infinite loop');
                return;
            }
            
            for (index in edges) {
                if (edges[index].from == data.from && edges[index].to == data.to) {
                    alert('There is already a link between those bots');
                    return;
                }
            }
            
            var neighbors = ACCEPTED_NEIGHBORS[nodes[data.from].group];
            var available_neighbor = false;
            for (index in neighbors) {
                if (nodes[data.to].group == neighbors[index]) {
                    callback(data);
                    available_neighbor = true;
                }
            }
            
            if (!available_neighbor) {
                if (neighbors.length == 0) {
                    alert("Node type " + nodes[data.from].group + " can't connect to other nodes");
                } else {
                    alert('Node type ' + nodes[data.from].group + ' can only connect to nodes of types: ' + neighbors.join());
                }
                return;
            }

            
            if (edges[data.id] === undefined) {
                edges[data.id] = {};
            }
            
            edges[data.id]={'from': data.from, 'to': data.to};
        },
        onDelete: function(data,callback) {
            callback(data);
            
            for (index in data.edges) {
                delete edges[data.edges[index]];
            }
            
            for (index in data.nodes) {
                delete nodes[data.nodes[index]];
            }
        }
    };
    
    graph = new vis.Graph(graph_container, data, options);
}

/*
 * Application entry point
 */

// Dynamically load available bots
load_file(BOTS_FILE, load_bots);

// Dynamically adapt to fit screen
window.onresize = resize; 

