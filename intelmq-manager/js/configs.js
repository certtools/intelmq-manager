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
var disabledKeys = ['group', 'name', 'module'];
var $manipulation, $saveButton; // jQuery of Vis control panel; elements reseted with network

var $EDIT_DEFAULT_BUTTON = $("#editDefaults");
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
        handleDrop(event);
    });
    app.network_container.addEventListener('dragover', function (event) {
        allowDrop(event);
    });
    popup = document.getElementById("network-popUp");
    span = document.getElementById('network-popUp-title');
    table = document.getElementById("network-popUp-fields");
}


function load_bots(config) {
    // Build side menu
    console.log(config);
    for (let bot_group of Object.keys(config).reverse()) {
        let $bot_group = $("#templates > ul.side-menu > li").clone().prependTo("#side-menu").css("border-bottom-color", GROUP_COLORS[bot_group][0]);
        $bot_group.find("> a").prepend(bot_group);
        let group = config[bot_group];
        for (let bot_name in group) {
            let bot = group[bot_name];
            let $bot = $bot_group.find("ul > li:first").clone().appendTo($("ul", $bot_group))
                .attr("title", bot['description'])
                .attr("data-name", bot_name)
                .attr("data-group", bot_group)
                .click(() => {
                    if ($('#network-popUp').is(':visible')) {
                        // just creating a new bot
                        fill_bot(undefined, bot_group, bot_name);
                        return false;
                    }

                    // cycling amongst the bot instances
                    if (!$bot.data("cycled")) {
                        $bot.data("cycled", []);
                    }
                    let found = null;
                    for (let bot_node of Object.values(app.nodes)) {
                        if (bot_node.module === bot["module"]) {
                            if ($.inArray(bot_node.id, $bot.data("cycled")) !== -1) {
                                continue;
                            } else {
                                $bot.data("cycled").push(bot_node.id);
                                found = bot_node.id;
                                break;
                            }
                        }
                    }
                    // not found or all bots cycled
                    if (!found && $bot.data("cycled").length) {
                        found = $bot.data("cycled")[0];
                        $bot.data("cycled", [found]); // reset cycling
                    }
                    if (found) {
                        fitNode(found);
                    } else {
                        show_error("No instance of the {0} found. Drag the label to the plan to create one.".format(bot_name));
                    }
                    return false;
                })
                .on('dragstart', (event) => { // drag to create a new bot instance
                    app.network.addNodeMode();
                    draggedElement = {
                        bot_name: bot_name,
                        bot_group: bot_group
                    };
                    // necessary for firefox
                    event.originalEvent.dataTransfer.setData('text/plain', null);
                })
                .find("a").prepend(bot_name);


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
                'run_mode': 'continuous'
            };

            for (let parameter in bot['parameters']) {
                var value = bot['parameters'][parameter];
                app.bots[bot_group][bot_name]['parameters'][parameter] = value;
            }
        }
        $bot_group.find("ul li").first().remove();// get rid of the HTML template
    }

    $('#side-menu').metisMenu({'restart': true});
    $EDIT_DEFAULT_BUTTON.click(function () {
        create_form('Edit Defaults', $(this).attr("id"), undefined);
        fill_editDefault(app.defaults);
    });

    if (getUrlParameter("configuration") !== "new") {
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

    let reloadable = 0;
    let alert_error = (file, jqxhr, textStatus, error) => {
        show_error('There was an error saving ' + file + ':\nStatus: ' + textStatus + '\nError: ' + error);
    };
    let saveSucceeded = (response) => {
        if (++reloadable === 4) {

        }
        if (response === 'success') {
            return true;
        } else {
            alert(response);
            return false;
        }
    }

    Promise.all([
        $.post('./php/save.php?file=runtime', generate_runtime_conf(app.nodes))
            .done(saveSucceeded)
            .fail(() => {
                alert_error('runtime', ...arguments)
            }),
        $.post('./php/save.php?file=pipeline', generate_pipeline_conf(app.edges))
            .done(saveSucceeded)
            .fail(() => {
                alert_error('pipeline', ...arguments)
            }),
        $.post('./php/save.php?file=positions', generate_positions_conf())
            .done(saveSucceeded)
            .fail(() => {
                alert_error('positions', ...arguments)
            }),
        $.post('./php/save.php?file=defaults', generate_defaults_conf(app.defaults))
            .done(saveSucceeded)
            .fail(() => {
                alert_error('defaults', ...arguments)
            }),])
        .then(function () {
            // all files were correctly saved

            app.nodes = add_defaults_to_nodes(app.nodes, app.defaults);
            $saveButton.unblinking();
        });
}


// Prepare data from configuration files to be used in Vis

function convert_edges(edges) {
    let new_edges = [];
    let roundness = {};
    for (let index in edges) {
        let new_edge = {};
        new_edge.id = edges[index]['id'];
        new_edge.from = edges[index]['from'];
        new_edge.to = edges[index]['to'];
        new_edge.label = edges[index]['path'];

        // if there is multiple edges between nodes we have to distinguish them manually, see https://github.com/almende/vis/issues/1957
        let hash = new_edge.from + new_edge.to;
        if (hash in roundness) {
            roundness[hash] += 0.3;
        } else {
            roundness[hash] = 0;
        }
        if (roundness[hash]) {
            new_edge.smooth = {type: "curvedCCW", "roundness": roundness[hash]};
        }

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
            $(addButtonCell).append($("#templates > .new-key-btn").clone().click(addNewKey));
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

    if (section == 'generic' && disabledKeys.includes(key) === true) {
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
    if (value !== null && typeof value === "object") {
        value = JSON.stringify(value);
    }
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
    let $el = $("#templates .modal-add-new-key").clone();
    popupModal("Add key", $el, () => {
        var current_index = $('#' + BORDER_TYPES.RUNTIME).index();
        var $key = $el.find("[name=newKeyInput]");
        var val = $el.find("[name=newValueInput]").val();

        if (!PARAM_KEY_REGEX.test($key.val())) {
            show_error("Parameter names can only be composed of numbers, letters, hiphens and underscores");
            $key.focus();
            return false;
        } else {
            // inserts new value and focus the field
            insertKeyValue($key.val(), val, BORDER_TYPES.RUNTIME, true, current_index + 1);
            // a bootstrap guru or somebody might want to rewrite this line without setTimeout
            setTimeout(() => {
                $('#network-popUp .new-key-btn').closest("tr").next("tr").find("input").focus()
            }, 300);
        }
    });
}

$(document).keydown(function (event) {
    if (event.keyCode === 27) {
        if (($el = $("body > .modal:not([data-hiding])")).length) {
            // close the most recent modal
            $el.last().attr("data-hiding", true).modal('hide');
            setTimeout(() => {
                $("body > .modal[data-hiding]").first().remove();
            }, 300);
        } else if ($('#network-popUp').is(':visible')) {
            $('#network-popUp-cancel').click();
        }
    }
    if (event.keyCode === 13 && $('#network-popUp').is(':visible') && $('#network-popUp :focus').length) {
        // till network popup is not unified with the popupModal function that can handle Enter by default,
        // let's make it possible to hit "Ok" by Enter as in any standard form
        $('#network-popUp-ok').click();
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


/**
 * Popups a custom modal window containing the given body.
 * @example popupModal("Title", $input, () => {$input.val();})
 */
function popupModal(title, body, callback) {
    $el = $("#templates > .modal").clone().appendTo("body");
    $(".modal-title", $el).html(title);
    $(".modal-body", $el).html(body);
    $el.modal({"keyboard": false}).on('shown.bs.modal', function () {
        if (($ee = $('input,textarea,button', $(".modal-body", this)).first())) {
            $ee.focus();
        }
    });
    return $el.on('submit', 'form', function () {
        if (callback() !== false) {
            $(this).closest(".modal").modal('hide');
        }
        return false;
    });
}

function create_form(title, data, callback) {
    span.innerHTML = title;

    var okButton = document.getElementById('network-popUp-ok');
    var cancelButton = document.getElementById('network-popUp-cancel');

    if (data === $EDIT_DEFAULT_BUTTON.attr("id")) {
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

    if (getUrlParameter("configuration") === "new") {
        app.nodes = {};
        app.edges = {};
    }
    initNetwork();
    if (window.location.hash) {
        let node = window.location.hash.substr(1);
        setTimeout(() => { // doesnt work immediately, I don't know why. Maybe a js guru would bind to visjs onready if that exists or sth.
            try {
                fitNode(node);
            } catch (e) {
                show_error("Bot instance {0} not found in the current configuration.".format(node));
            }
        }, 100);


    }
}

function fitNode(nodeId) {
    app.network.fit({"nodes": [nodeId]});
    app.network.selectNodes([nodeId], true);
    app.network.manipulation.showManipulatorToolbar();
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
    app.network.options.locales.en.del = "Delete";

    // 'Live' button (by default on when botnet is not too big) and 'Physics' button
    // initially stopped
    let reload_queues = (new Interval(load_live_info, RELOAD_QUEUES_EVERY * 1000, true)).stop();
    app.network.setOptions({physics: false});

    //
    // add custom button to the side menu
    //

    $("#templates .network-right-menu").clone().insertAfter($manipulation);
    $nc = $("#network-container");
    $(".vis-live-toggle", $nc).click(function () {
        $(this).toggleClass("running", !reload_queues.running);
        reload_queues.toggle(!reload_queues.running);
    }).click();
    let physics_running = true;
    $(".vis-physics-toggle", $nc).click(function () {
        $(this).toggleClass("running");
        app.network.setOptions({physics: (physics_running = !physics_running)});
    });

    // 'Save Configuration' button blinks and lists all the bots that should be reloaded after successful save.
    $saveButton = $("#vis-save", $nc);
    $saveButton.children().on('click', function (event) {
        save_data_on_files();
    });
    $saveButton.data("reloadables", []);
    $saveButton.blinkOnce = function() {
        $(this).addClass('blinking-once');
        setTimeout(() => {
            $(this).removeClass('blinking-once')
        }, 2000);
    }
    $saveButton.blinking = function (bot_id = null) {
        $(this).addClass('vis-save-blinking')
        if (bot_id) {
            $(this).data("reloadables").push(bot_id);
        }
    };
    $saveButton.unblinking = function () {
        $(this).removeClass('vis-save-blinking');
        let promises = [];
        let bots = $.unique($(this).data("reloadables"));
        for (let bot_id of bots) {
            let url = `${MANAGEMENT_SCRIPT}?scope=bot&action=reload&id=${bot_id}`;
            promises.push($.getJSON(url));
        }
        if (promises.length) {
            Promise.all(promises).then(() => {
                show_error("Reloaded bots: " + bots.join(", "));
                bots.length = 0;
            });
        }
    };

    let allow_blinking_once = false; // Save Configuration button will not blink when a button is clicked now automatically
    // list of button callbacks in form ["button/settings name"] => function called when clicked receives true/false according to the clicked state
    let callbacks = [["live", (val) => {
        reload_queues[val ? "start" : "stop"]();
    }], ["physics", (val) => {
        app.network.setOptions({physics: val});
    }]];
    for (let [name, fn] of callbacks) {
        let $el = $(`.vis-${name}-toggle`, $nc).click(function () {
            // button click will callback and blinks Save Configuration button few times
            fn(settings[name] = !settings[name]);
            $(this).toggleClass("running", settings[name]);

            if (allow_blinking_once) {
                $saveButton.blinkOnce();
            }
        });
        // initially turn on/off buttons according to the server-stored settings
        settings[name] = !settings[name];
        $el.click();
    }
    allow_blinking_once = true;

    // 'Clear Configuration' button
    $("#vis-clear").children().on('click', function (event) {
        window.location.assign('?page=configs&configuration=new');
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
        $EDIT_DEFAULT_BUTTON.prop('disabled', false);

        // enable tooltip (if disabled earler)
        app.network.interactionHandler.options.tooltipDelay = 1000;

        // clicking on 'Add Bot', 'Add Queues' etc buttons disables 'Edit defaults' button
        var fn = function () {
            $EDIT_DEFAULT_BUTTON.prop('disabled', true);
        };
        $(".vis-add", $manipulation).on("pointerdown", fn);
        if (($el = $(".vis-edit", $manipulation)).length) { // 'Edit Bot' button is visible only when there is a bot selected
            $el.on("pointerdown", fn);
        }
        $(".vis-connect", $manipulation).on("pointerdown", function () {
            app.network.interactionHandler.options.tooltipDelay = 999999; // tooltip are disabled as well
            fn();
            ;
        });

        // 'Monitor' and 'Duplicate' buttons appear when there is a single node selected
        let nodes = app.network.getSelectedNodes();
        if (nodes.length === 1) { // a bot is focused
            var bot = nodes[0];
            $("#templates .network-node-menu").clone().appendTo($manipulation);
            $(".monitor-button", $manipulation).click((event) => {
                return click_link(MONITOR_BOT_URL.format(bot), event);
            }).find("a").attr("href", MONITOR_BOT_URL.format(bot));
            $(".duplicate-button", $manipulation).click(() => {
                duplicateNode(app, bot);
            }).insertBefore($(".vis-add").hide());

            // insert start/stop buttons
            $(".monitor-button", $manipulation).before(generate_control_buttons(bot, false, refresh_color, true));
        } else if ((edges = app.network.getSelectedEdges()).length === 1) {
            $("#templates .network-edge-menu").clone().appendTo($manipulation);
            $(".vis-edit", $manipulation).click(() => {
                editPath(app, edges[0]);
            }).insertBefore($(".vis-delete"));
        }
        // refresh shortcuts
        // (it is so hard to click on the 'Add Node' button we rather register click event)
        $(".vis-add .vis-label", $manipulation).attr("data-accesskey", "t").click(function () {
            // We use 't' for 'Add bot' and 'Duplicate' because that's a common letter.
            app.network.addNodeMode();
        });
        $(".vis-connect .vis-label", $manipulation).attr("data-accesskey", "q").click(function () {
            app.network.addEdgeMode();
        })
        $(".vis-delete .vis-label", $manipulation).attr("data-accesskey", "d").click(function () {
            app.network.deleteSelected();
        });
        $(".vis-edit .vis-label", $manipulation).attr("data-accesskey", "e").click(function () {
            app.network.editNode();
        });
        accesskeyfie();
    };
    // redraw immediately so that even the first click on the network is aware of that new monkeypatched function
    app.network.manipulation.showManipulatorToolbar();

    // double click action trigger editation
    app.network.on("doubleClick", (active) => {
        if (active.nodes.length === 1) {
            let ev = document.createEvent('MouseEvent');// vis-js button need to be clicked this hard way
            ev.initEvent("pointerdown", true, true);
            $(".vis-edit", $manipulation).get()[0].dispatchEvent(ev);
        }
        if (active.edges.length === 1) {
            $(".vis-edit", $manipulation).click();
        }
    });
    /* right button ready for any feature request:
     app.network.on("oncontext", (active)=>{
     let nodeId = app.network.getNodeAt(active.pointer.DOM);
     // what this should do? :)
     });
     */

}

// INTELMQ

/*
 * Application entry point
 */

// Dynamically load available bots
load_file(BOTS_FILE, load_bots);

// Dynamically adapt to fit screen
window.onresize = resize;

/**
 * This function fetches the current info and updates bot nodes on the graph
 */
function refresh_color(bot) {
    if (bot_status_previous[bot] !== bot_status[bot]) { // status changed since last time

        // we use light colour if we expect bot will be running
        // (when reloading from stopped state bot will not be running)
        let col = GROUP_COLORS[app.nodes[bot].group][([
            BOT_STATUS_DEFINITION.running,
            BOT_STATUS_DEFINITION.starting,
            BOT_STATUS_DEFINITION.restarting,
            bot_status_previous[bot] === BOT_STATUS_DEFINITION.running ? BOT_STATUS_DEFINITION.reloading : 0
        ].indexOf(bot_status[bot]) > -1) ? 0 : 1];

        // change bot color if needed
        if (app.network_data.nodes.get([bot])[0].color !== col) {
            app.network_data.nodes.update({"id": bot, "color": col});
        }

        // we dash the border if the status has to be changed (not running or stopping) or is faulty (error, incomplete)
        if ([BOT_STATUS_DEFINITION.running, BOT_STATUS_DEFINITION.stopped].indexOf(bot_status[bot]) === -1) {
            app.network_data.nodes.update({"id": bot, shapeProperties: {borderDashes: [5, 5]}})
        } else if ([BOT_STATUS_DEFINITION.running, BOT_STATUS_DEFINITION.stopped, undefined].indexOf(bot_status_previous[bot]) === -1) {
            // we remove dash border since bot has been in a dash-border state and is no more
            // (that means that bot wasn't either in a running, stopped or initially undefined state)
            app.network_data.nodes.update({"id": bot, shapeProperties: {"borderDashes": false}});
        }

        bot_status_previous[bot] = bot_status[bot];
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
                    // Assume an empty internal queue if no data is given (The AMQP pipeline does not have/need internal queues)
                    let c = bot_queues[bot]['source_queue'][1] + (bot_queues[bot]['internal_queue'] || 0);
                    let label = (c > 0) ? "{0}\n{1}✉".format(bot, c) : bot;
                    if ((appbot = app.network_data.nodes.get(bot)) === null) {
                        show_error("Non-existent bot {0} in pipelines.".format(bot));
                    } else if (label !== appbot.label) {
                        // update queue count on bot label
                        app.network_data.nodes.update({"id": bot, "label": label});
                    }
                } else {
                    // https://github.com/certtools/intelmq-manager/issues/158
                    app.network_data.nodes.update({"id": bot, "label": bot});
                }
            }
            for (let bot in bot_status) {
                // bots that are not running are grim coloured
                refresh_color(bot);
            }
        })
        .fail(ajax_fail_callback('Error loading bot queues information'))
        .always(() => {
            $(".navbar").removeClass('waiting');
            this.blocking = false;
        });
}
