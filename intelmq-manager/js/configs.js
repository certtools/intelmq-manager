var NETWORK_OPTIONS = NETWORK_OPTIONS || {};
class VisModel {
    constructor() {


        this.defaults = {};
        this.nodes = {};
        this.edges = {};
        this.bots = {};

        this.network = null;
        this.network_container = null;
        this.network_data = {}; // we may update existing info in the network on the fly
        this.bot_before_altering = null;

        this.positions = null;
        this.options = NETWORK_OPTIONS;
    }
}
var app = new VisModel();

var popup = null;
var span = null;
var table = null;
var modal = null;
var disabledKeys = ['group', 'name', 'module'];
var $manipulation, $saveButton; // jQuery of Vis control panel; elements reseted with network

var EDIT_DEFAULT_BUTTON_ID = 'editDefaults';
var BORDER_TYPE_CLASSES = {
    'DEFAULT': 'info',
    'GENERIC': 'success',
    'RUNTIME': 'warning',
}
var BORDER_TYPES = {
    'DEFAULT': 'default',
    'GENERIC': 'generic',
    'RUNTIME': 'runtime',
    'OTHERS': 'default',
}

var draggedElement = null;

$(window).on('hashchange', function () {
    location.reload();
});

$(window).on('unload', function () {
    return "If you have not saved your work you'll loose the changes you have made. Do you want to continue?";
});

function resize() {
    // Resize body
    var network_container = document.getElementById('network-container');
    network_container.style.height = (window.innerHeight - network_container.offsetTop) + "px";
    network_container.style.overflowX = "auto";
    network_container.style.overflowY = "auto";

    if (app.network !== null && app.network !== undefined) {
        app.network.redraw();
    }

    load_html_elements();
}

function load_html_elements() {
    // Load popup, span and table
    app.network_container = document.getElementById('network-container');
    app.network_container.addEventListener('drop', function (event) {
        handleDrop(event)
    });
    app.network_container.addEventListener('dragover', function (event) {
        allowDrop(event)
    });
    popup = document.getElementById("network-popUp");
    span = document.getElementById('network-popUp-title');
    table = document.getElementById("network-popUp-fields");
    modal = document.getElementById('addNewKeyModal');
}


function load_bots(config) {
    var available_bots = document.getElementById("side-menu");
    for (let bot_group in config) {
        var group = config[bot_group];

        group_title = document.createElement('a');
        group_title.innerHTML = bot_group + '<span class="fa arrow"></span>';

        var new_element = group_title.cloneNode(true);

        bots_submenu = document.createElement('ul');
        bots_submenu.setAttribute('class', 'nav nav-second-level collapse');

        group_menu = document.createElement('li');
        group_menu.appendChild(new_element);
        group_menu.appendChild(bots_submenu);
        group_menu.style.borderBottomColor = GROUP_COLORS[bot_group][0];

        available_bots.appendChild(group_menu);
        fill_bot_func = function (bot_group, bot_name) {
            fill_bot(undefined, bot_group, bot_name);
        }

        for (let bot_name in group) {
            var bot = group[bot_name];

            var bot_title = document.createElement('a');
            bot_title.setAttribute('data-toggle', 'tooltip');
            bot_title.setAttribute('data-placement', 'right');
            bot_title.setAttribute('title', bot['description']);
            bot_title.addEventListener('click', function (bot_group, bot_name) {
                return function () {
                    fill_bot_func(bot_group, bot_name)
                }
            }(bot_group, bot_name))
            bot_title.innerHTML = bot_name;

            var bot_submenu = document.createElement('li');
            bot_submenu.appendChild(bot_title);
            bot_submenu.setAttribute('draggable', 'true');
            bot_submenu.addEventListener('dragstart', handleDragStart, false);
            bot_submenu.id = bot_name + '@' + bot_group;

            bots_submenu.appendChild(bot_submenu);

            if (app.bots[bot_group] === undefined) {
                app.bots[bot_group] = {};
            }

            app.bots[bot_group][bot_name] = {
                'name': bot_name,
                'group': bot_group,
                'module': bot['module'],
                'description': bot['description'],
                'enabled': true,
                'parameters': bot['parameters'],
                'run_mode': 'continuous',
            }

            for (let parameter in bot['parameters']) {
                var value = bot['parameters'][parameter];
                app.bots[bot_group][bot_name]['parameters'][parameter] = value;
            }
        }
    }

    $('#side-menu').metisMenu({'restart': true});

    btnEditDefault = document.createElement('button');
    btnEditDefault.setAttribute('class', 'btn btn-warning');
    btnEditDefault.innerHTML = 'Edit Defaults';
    btnEditDefault.style.textAlign = 'center';
    btnEditDefault.id = EDIT_DEFAULT_BUTTON_ID;
    btnEditDefault.addEventListener('click', function () {
        create_form('Edit Defaults', EDIT_DEFAULT_BUTTON_ID, undefined);
        fill_editDefault(app.defaults);
    });
    buttonContainer = document.createElement('li');
    buttonContainer.appendChild(btnEditDefault);
    buttonContainer.setAttribute('id', 'customListItem');

    available_bots.appendChild(buttonContainer);

    if (window.location.hash !== '#new') {
        load_configuration();
    } else {
        draw();
        resize();
        $saveButton.blinking();
    }
}

function fill_editDefault(data) {
    table.innerHTML = '';

    for (let key in data) {
        insertKeyValue(key, data[key], 'defaultConfig', false);
    }
    // to enable scroll bar
    popup.setAttribute('class', "with-bot");
}

function handleDragStart(event) {
    app.network.addNodeMode();
    var elementID = event.currentTarget.id.split('@');

    draggedElement = {
        bot_name: elementID[0],
        bot_group: elementID[1]
    };

    // necessary for firefox
    event.dataTransfer.setData('text/plain', null);
}

function handleDrop(event) {

    // --- necessary for firefox
    if (event.preventDefault) {
        event.preventDefault();
    }
    if (event.stopPropagation) {
        event.stopPropagation();
    }
    // ---

    var domPointer = app.network.interactionHandler.getPointer({x: event.clientX, y: event.clientY});
    var canvasPointer = app.network.manipulation.canvas.DOMtoCanvas(domPointer);

    var clickData = {
        pointer: {
            canvas: {
                x: canvasPointer.x,
                y: canvasPointer.y
            }
        }
    };

    app.network.manipulation.temporaryEventFunctions[0].boundFunction(clickData);

    fill_bot(undefined, draggedElement.bot_group, draggedElement.bot_name);
}

function allowDrop(event) {
    event.preventDefault();
}


// Configuration files manipulation

function save_data_on_files() {
    if (!confirm("By clicking 'OK' you are replacing the configuration in your files by the one represented by the network on this page. Do you agree?")) {
        return;
    }

    app.nodes = remove_defaults(app.nodes);

    var alert_error = function (file, jqxhr, textStatus, error) {
        show_error('There was an error saving ' + file + ':\nStatus: ' + textStatus + '\nError: ' + error);
    };

    $.post('./php/save.php?file=runtime', generate_runtime_conf(app.nodes))
            .done(function (data) {
                saveSucceeded(data);
            })
            .fail(function (jqxhr, textStatus, error) {
                alert_error('runtime', jqxhr, textStatus, error);
            });

    $.post('./php/save.php?file=pipeline', generate_pipeline_conf(app.edges))
            .done(function (data) {
                saveSucceeded(data);
            })
            .fail(function (jqxhr, textStatus, error) {
                alert_error('pipeline', jqxhr, textStatus, error);
            });

    $.post('./php/save.php?file=positions', generate_positions_conf())
            .done(function (data) {
                saveSucceeded(data);
            })
            .fail(function (jqxhr, textStatus, error) {
                alert_error('positions', jqxhr, textStatus, error);
            });

    $.post('./php/save.php?file=defaults', generate_defaults_conf(app.defaults))
            .done(function (data) {
                saveSucceeded(data);
            })
            .fail(function (jqxhr, textStatus, error) {
                alert_error('defaults', jqxhr, textStatus, error);
            });

    app.nodes = add_defaults_to_nodes(app.nodes, app.defaults);
    $saveButton.unblinking();
}

function saveSucceeded(response) {
    if (response === 'success') {
        return true;
    } else {
        alert(response);
        return false;
    }
}

// Prepare data from configuration files to be used in Vis

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

function convert_nodes(nodes, includePositions) {
    var new_nodes = [];

    for (index in nodes) {
        var new_node = {};
        new_node.id = nodes[index]['id'];
        new_node.label = nodes[index]['id'];
        new_node.group = nodes[index]['group'];
        new_node.title = JSON.stringify(nodes[index], undefined, 2).replace(/\n/g, '\n<br>').replace(/ /g, "&nbsp;");

        if (includePositions === true) {
            try {
                new_node.x = app.positions[index].x;
                new_node.y = app.positions[index].y;
            } catch (err) {
                console.error('positions in file are ignored:', err);
                show_error('Saved positions are not valid or not complete. The configuration has possibly been modified outside of the IntelMQ-Manager.');
                includePositions = false;
            }
        }

        new_nodes.push(new_node);
    }

    return new_nodes;
}

function fill_bot(id, group, name) {
    var bot = {};
    table.innerHTML = '';

    if (id === undefined) {
        bot = app.bots[group][name];

        name = bot['name'].replace(/\ /g, '-').replace(/[^A-Za-z0-9-]/g, '');
        group = bot['group'].replace(/\ /g, '-');
        default_id = name + "-" + group;
        bot['id'] = default_id;
        bot['defaults'] = {};

        for (key in app.defaults) {
            if (key in bot.parameters) {
                continue;
            } else {
                bot['defaults'][key] = app.defaults[key];
            }
        }
    } else {
        bot = app.nodes[id];
    }

    app.bot_before_altering = bot;

    insertKeyValue('id', bot['id'], 'id', false);
    insertBorder(BORDER_TYPES.GENERIC);
    for (let key in bot) {
        if (STARTUP_KEYS.includes(key)) {
            insertKeyValue(key, bot[key], BORDER_TYPES.GENERIC, false);
        }
    }
    insertBorder(BORDER_TYPES.RUNTIME);
    for (let key in bot.parameters) {
        insertKeyValue(key, bot.parameters[key], BORDER_TYPES.RUNTIME, true);
    }
    insertBorder(BORDER_TYPES.DEFAULT);
    for (let key in bot.defaults) {
        insertKeyValue(key, bot.defaults[key], BORDER_TYPES.DEFAULT, false);
    }

    popup.setAttribute('class', "with-bot");
}

function insertBorder(border_type) {
    var new_row = table.insertRow(-1);
    var sectionCell1 = new_row.insertCell(0);
    var sectionCell2 = new_row.insertCell(1);
    var addButtonCell = new_row.insertCell(2);

    sectionCell1.setAttribute('id', 'border');
    sectionCell2.setAttribute('id', 'border');
    sectionCell1.innerHTML = border_type;
    sectionCell2.innerHTML = border_type;

    switch (border_type) {
        case BORDER_TYPES.GENERIC:
            new_row.setAttribute('class', BORDER_TYPE_CLASSES.GENERIC);
            break;
        case BORDER_TYPES.RUNTIME:
            new_row.setAttribute('class', BORDER_TYPE_CLASSES.RUNTIME);
            var addButton = document.createElement('button');
            var addButtonSpan = document.createElement('span');
            addButtonSpan.setAttribute('class', 'glyphicon glyphicon-plus-sign');
            addButton.setAttribute('class', 'btn btn-warning');
            addButton.setAttribute('title', 'add new key');
            addButton.addEventListener('click', showModal);
            addButton.appendChild(addButtonSpan);
            addButtonCell.appendChild(addButton);
            new_row.setAttribute('id', border_type);
            break;
        case BORDER_TYPES.DEFAULT:
            new_row.setAttribute('class', BORDER_TYPE_CLASSES.DEFAULT);
            break;
        default:
            new_row.setAttribute('class', BORDER_TYPE_CLASSES.OTHERS);
    }
}

function insertKeyValue(key, value, section, allowXButtons, insertAt) {

    var new_row = null;

    if (insertAt === undefined) {
        new_row = table.insertRow(-1);
    } else {
        new_row = table.insertRow(insertAt);
    }

    var keyCell = new_row.insertCell(0);
    var valueCell = new_row.insertCell(1);
    var xButtonCell = new_row.insertCell(2);
    var valueInput = document.createElement("input");

    keyCell.setAttribute('class', 'node-key');
    keyCell.setAttribute('id', section)
    valueCell.setAttribute('class', 'node-value');
    valueInput.setAttribute('type', 'text');
    valueInput.setAttribute('id', key);

    if (disabledKeys.includes(key) === true) {
        valueInput.setAttribute('disabled', "true");
    }

    parameter_func = function (action_function, argument) {
        action_function(argument);
    }

    if (allowXButtons === true) {
        var xButton = document.createElement('button');
        var xButtonSpan = document.createElement('span');
        if (key in app.defaults) {
            xButtonSpan.setAttribute('class', 'glyphicon glyphicon-refresh');
            xButton.setAttribute('class', 'btn btn-default');
            xButton.setAttribute('title', 'reset to default');
            xButton.addEventListener('click', function (resetToDefault, key) {
                return function () {
                    parameter_func(resetToDefault, key)
                }
            }(resetToDefault, key))
        } else {
            xButtonSpan.setAttribute('class', 'glyphicon glyphicon-remove-circle');
            xButton.setAttribute('class', 'btn btn-danger');
            xButton.setAttribute('title', 'delete parameter');
            xButton.addEventListener('click', function (deleteParameter, key) {
                return function () {
                    parameter_func(deleteParameter, key)
                }
            }(deleteParameter, key))
        }

        xButton.appendChild(xButtonSpan);
        xButtonCell.appendChild(xButton);
    }

    valueCell.appendChild(valueInput);

    keyCell.innerHTML = key;
    valueInput.setAttribute('value', value);
}

function resetToDefault(input_id) {
    $('#' + input_id)[0].value = app.defaults[input_id];
}

function deleteParameter(input_id) {
    var current_index = $('#' + input_id).closest('tr').index();
    table.deleteRow(current_index);
}

function addNewKey() {
    var current_index = $('#' + BORDER_TYPES.RUNTIME).index();
    var newKeyInput = document.getElementById('newKeyInput');
    var newValueInput = document.getElementById('newValueInput');

    if (!PARAM_KEY_REGEX.test(newKeyInput.value)) {
        show_error("Parameter names can only be composed of numbers, letters, hiphens and underscores");
        $('#newKeyInput').focus();
    } else {
        hideModal();
        insertKeyValue(newKeyInput.value, newValueInput.value, BORDER_TYPES.RUNTIME, true, current_index + 1);
        newKeyInput.value = '';
        newValueInput.value = '';
    }
}

function showModal() {
    modal.style.display = "block";
    $('#newKeyInput').focus();
}

function hideModal() {
    modal.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

$(document).keydown(function (event) {
    if (event.keyCode == 27) {
        if ($('#addNewKeyModal').is(':visible')) {
            hideModal();
        } else if ($('#network-popUp').is(':visible')) {
            $('#network-popUp-cancel').click();
        }
    }
});

$('#newKeyInput').keyup(function (event) {
    // 'enter' key
    if (event.keyCode == 13) {
        $('#addNewKeyModal-ok').click();
    }
});

$('#newValueInput').keyup(function (event) {
    // 'enter' key
    if (event.keyCode == 13) {
        $('#addNewKeyModal-ok').click();
    }
});

function saveDefaults_tmp(data, callback) {
    app.defaults = {};
    saveFormData();
    $saveButton.blinking();
    clearPopUp(data, callback);
}

function saveFormData() {
    for (var i = 0; i < table.rows.length; i++) {
        var keyCell = table.rows[i].cells[0];
        var valueCell = table.rows[i].cells[1];
        var valueInput = valueCell.getElementsByTagName('input')[0];

        if (valueInput === undefined)
            continue;

        var key = keyCell.innerText;
        var value = null;

        try {
            value = JSON.parse(valueInput.value);
        } catch (err) {
            value = valueInput.value;
        }

        switch (keyCell.id) {
            case 'id':
                node[key] = value;
                break;
            case 'generic':
                node[key] = value;
                break;
            case 'runtime':
                node['parameters'][key] = value;
                break;
            case 'border':
                break;
            case 'defaultConfig':
                app.defaults[key] = value;
                break;
            default:
                node['defaults'][key] = value;
        }
    }
}

function saveData(data, callback) {
    node = {};
    node['parameters'] = {};
    node['defaults'] = {};

    saveFormData();

    // check inputs beeing valid
    if (node.id == '' && node.group == '') {
        show_error('fields id and group must not be empty!');
        return;
    }

    if (node.id != app.bot_before_altering.id) {
        if (!confirm("When you edit an ID what you are doing in fact is to create a clone of the current bot. You will have to delete the old one manually. Proceed with the operation?")) {
            return;
        }
    }

    if (!BOT_ID_REGEX.test(node.id)) {
        show_error("Bot ID's can only be composed of numbers, letters and hiphens");
        return;
    }


    // switch paremters and defaults
    for (let key in node) {
        if (key === 'parameters') {
            for (parameterKey in node.parameters) {
                if (node.parameters[parameterKey] !== app.bot_before_altering.parameters[parameterKey]) {
                    if (parameterKey in app.defaults) {
                        if (node.parameters[parameterKey] === app.defaults[parameterKey]) {
                            swapToDefaults(node, parameterKey);
                        }
                    }
                }
            }
        } else if (key === 'defaults') {
            for (defaultsKey in node.defaults) {
                if (node.defaults[defaultsKey] !== app.defaults[defaultsKey]) {
                    swapToParameters(node, defaultsKey);
                }
            }
        }
    }

    data.id = node.id;
    data.label = node.id
    data.group = node.group;
    data.level = GROUP_LEVELS[data.group];
    data.title = JSON.stringify(node, undefined, 2).replace(/\n/g, '\n<br>').replace(/ /g, "&nbsp;");

    app.nodes[node.id] = node;

    $saveButton.blinking();
    clearPopUp(data, callback);
}

function swapToParameters(node, key) {
    node.parameters[key] = node.defaults[key];
    delete node.defaults[key];
}

function swapToDefaults(node, key) {
    node.defaults[key] = node.parameters[key];
    delete node.parameters[key];
}

function create_form(title, data, callback) {
    span.innerHTML = title;

    var okButton = document.getElementById('network-popUp-ok');
    var cancelButton = document.getElementById('network-popUp-cancel');

    if (data === EDIT_DEFAULT_BUTTON_ID) {
        okButton.onclick = saveDefaults_tmp.bind(this, data, callback);
    } else {
        okButton.onclick = saveData.bind(this, data, callback);
    }

    cancelButton.onclick = clearPopUp.bind(this, data, callback);

    table.innerHTML = "<p>Please select one of the bots on the left</p>";
    popup.style.display = 'block';
    popup.setAttribute('class', "without-bot");
}

function clearPopUp(data, callback) {
    var okButton = document.getElementById('network-popUp-ok');
    var cancelButton = document.getElementById('network-popUp-cancel');
    okButton.onclick = null;
    cancelButton.onclick = null;

    popup.style.display = 'none';
    span.innerHTML = "";

    for (i = table.rows.length - 1; i >= 0; i--) {
        var position = table.rows[i].rowIndex;

        if (position >= CORE_FIELDS) {
            table.deleteRow(position);
        } else {
            table.rows[i].setAttribute('value', '');
        }
    }

    popup.setAttribute('class', "without-bot");
    if ((callback !== undefined) && (data['label'] != 'new')) {
        callback(data);
    }
}

function redrawNetwork() {
    app.options.layout.randomSeed = Math.round(Math.random() * 1000000);
    app.network.destroy();
    app.network = null;
    initNetwork(false);
    $saveButton.blinking();
}

function draw() {
    load_html_elements();

    if (window.location.hash !== '#load') {
        app.nodes = {};
        app.edges = {};
    }
    initNetwork();
}

function initNetwork(includePositions = true) {
    app.network_data = {
        nodes: new vis.DataSet(convert_nodes(app.nodes, includePositions)),
        edges: new vis.DataSet(convert_edges(app.edges))
    };

    app.network = new vis.Network(app.network_container, app.network_data, app.options);
    $manipulation = $(".vis-manipulation");

    // rename some menu buttons (because we couldn't do that earlier)
    app.network.options.locales.en.addNode = "Add Bot";
    app.network.options.locales.en.addEdge = "Add Queue";
    app.network.options.locales.en.editNode = "Edit Bot";
    app.network.options.locales.en.editEdge = "Edit queue path";
    app.network.options.locales.en.del = "Delete";

    //
    // add custom button to the side menu
    //

    // 'Live' button (by default on)
    var reload_queues = (new Interval(load_live_info, RELOAD_QUEUES_EVERY * 1000, true)).stop();
    $("#templates .network-right-menu").clone().insertAfter($manipulation);
    $nc = $("#network-container");
    $(".vis-live-toggle", $nc).click(function () {
        if (reload_queues.running) {
            $(this).removeClass("running");
            reload_queues.stop();
        } else {
            $(this).addClass("running");
            reload_queues.start();
        }
    }).click();

    // 'Save Configuration' button can blink
    $saveButton = $("#vis-save", $nc);
    $saveButton.children().on('click', function (event) {
        save_data_on_files();
    });
    $saveButton.blinking = function () {
        $(this).addClass('vis-save-blinking');
    };
    $saveButton.unblinking = function () {
        $(this).removeClass('vis-save-blinking');
    };

    // 'Clear Configuration' button
    $("#vis-clear").children().on('click', function (event) {
        window.location.assign('#new');
    });

    // 'Redraw Botnet' button
    $("#vis-redraw").children().on('click', function (event) {
        redrawNetwork();
    });

    //
    // add custom menu buttons
    // (done by extending self the visjs function, responsible for menu creation
    // so that we are sure our buttons are persistent when vis menu changes)
    //
    app.network.manipulation._showManipulatorToolbar = app.network.manipulation.showManipulatorToolbar;
    app.network.manipulation.showManipulatorToolbar = function () {
        // call the parent function that builds the default menu
        app.network.manipulation._showManipulatorToolbar.call(this);

        // enable 'Edit defaults' button
        $('#' + EDIT_DEFAULT_BUTTON_ID).prop('disabled', false);

        // enable tooltip (if disabled earler)
        app.network.interactionHandler.options.tooltipDelay = 1000;

        // clicking on 'Add Bot', 'Add Queues' etc buttons disables 'Edit defaults' button
        var fn = function () {
            $('#' + EDIT_DEFAULT_BUTTON_ID).prop('disabled', true);
        };

        Hammer($(".vis-add", $manipulation).get()[0]).on("tap", fn);
        if ((el = $(".vis-edit", $manipulation).get()[0])) {
            // 'Edit Bot' button is visible only when there is a bot selected
            Hammer(el).on("tap", fn);
        }
        Hammer($(".vis-connect", $manipulation).get()[0]).on("tap", function () {
            app.network.interactionHandler.options.tooltipDelay = 999999; // tooltip are disabled as well
            fn();
            ;
        });

        // 'Monitor' and 'Duplicate' buttons appear when there is a single node selected
        let nodes = app.network.getSelectedNodes();
        if (nodes.length === 1) { // a bot is focused
            var bot = nodes[0];
            $("#templates .network-added-menu").clone().appendTo($manipulation);
            $(".monitor-button", $manipulation).click((event) => {
                return click_link(MONITOR_BOT_URL.format(bot), event);
            }).find("a").attr("href", MONITOR_BOT_URL.format(bot));
            $(".duplicate-button", $manipulation).click(() => {
                duplicateNode(app, bot);
            }).insertBefore($(".vis-add").hide());

            // insert start/stop buttons
            $(".monitor-button", $manipulation).before(generate_control_buttons(bot, false, refresh_color, true));
        }
    };
    // redraw immediately so that even the first click on the network is aware of that new monkeypatched function
    app.network.manipulation.showManipulatorToolbar();
}

// INTELMQ

/*
 * Application entry point
 */

// Dynamically load available bots
load_file(BOTS_FILE, load_bots);

// Dynamically adapt to fit screen
window.onresize = resize;

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('addNewKeyModal-cancel').addEventListener('click', hideModal);
    document.getElementById('addNewKeyModal-ok').addEventListener('click', addNewKey);
});



/**
 * This function fetches the current info and updates bot nodes on the graph
 */
function refresh_color(bot) {
    if (bot_status_previous[bot] !== bot_status[bot]) {
        let col = GROUP_COLORS[app.nodes[bot].group][(bot_status[bot] === "running") ? 0 : 1];
        if (app.network_data.nodes.get([bot])[0].color !== col) {
            app.network_data.nodes.update({"id": bot, "color": col});
        }
    }
}
function load_live_info() {
    $(".navbar").addClass('waiting');
    return $.getJSON(MANAGEMENT_SCRIPT + '?scope=queues-and-status')
            .done(function (data) {
                [bot_queues, bot_status] = data;
                for (let bot in bot_queues) {

                    if ("source_queue" in bot_queues[bot]) {
                        // we skip bots without source queue (collectors)
                        let c = bot_queues[bot]['source_queue'][1] + bot_queues[bot]['internal_queue'];
                        let label = (c > 0) ? "{0}\n{1}✉".format(bot, c) : bot;
                        if (label !== app.network_data.nodes.get(bot).label) {
                            // update queue count on bot label
                            app.network_data.nodes.update({"id": bot, "label": label});
                        }
                    }

                }
                for (let bot in bot_status) {
                    // bots that are not running are grim coloured
                    refresh_color(bot);
                }
                bot_status_previous = $.extend({}, bot_status); // we need a shallow copy of a state, it's too slow to ask `app` every time
            })
            .fail(ajax_fail_callback('Error loading bot queues information'))
            .always(() => {
                $(".navbar").removeClass('waiting');
                this.blocking = false;
            });
}
