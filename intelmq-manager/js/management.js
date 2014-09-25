var BOT_CLASS = {
    'starting': 'warning',
    'running': 'success',
    'stopping': 'danger',
    'stopped': 'danger'
}

var bot_status = {};

$('#bot-table').dataTable({
        lengthMenu: [[5, 10, 25, -1], [5, 10, 25, "All"]],
        pageLength: -1,
        columns: [
            { "data": "bot_id" },
            { "data": "bot_status" },
            { "data": "actions" }
        ]
    });

window.onresize = function () {
    $('#log-table').dataTable().fnAdjustColumnSizing();
    $('#bot-table').dataTable().fnDraw();
};

function update_bot_status() {
    var botnet_status = 'stopped';
    var full_run = true;
    
    var botnet_status_element = document.getElementById('botnet-status');
    var botnet_buttons_element = document.getElementById('botnet-buttons');
    var bot_table_element = document.getElementById('bot-table-body');
    
    $('#bot-table').dataTable().fnClearTable();
    
    for (bot_id in bot_status) {
        var bot_class = 'bg-danger';
        if (bot_status[bot_id].indexOf('stop') != -1) {
            full_run = false;
        } else {
            botnet_status = 'running';
        }
        
        buttons_cell = '' +
            '<button type="submit" class="btn btn-default" onclick="start_bot(\'' + bot_id + '\')"><span class="glyphicon glyphicon-play"></span></button>' + 
            '<button type="submit" class="btn btn-default" onclick="stop_bot(\'' + bot_id + '\')"><span class="glyphicon glyphicon-stop"></span></button>';

        bot_row = {
            'bot_id': bot_id,
            'bot_status': bot_status[bot_id],
            'actions': buttons_cell,
            'DT_RowClass': BOT_CLASS[bot_status[bot_id]]
        };

        $('#bot-table').dataTable().fnAddData(bot_row);
    }
    
    botnet_status_element.setAttribute('class', 'bg-' + BOT_CLASS[botnet_status]);
    botnet_status_element.innerHTML = botnet_status;
    
    botnet_buttons_element.innerHTML = '' +
        '<button type="submit" class="btn btn-default" onclick="start_botnet()"><span class="glyphicon glyphicon-play"></span></button>' + 
        '<button type="submit" class="btn btn-default" onclick="stop_botnet()"><span class="glyphicon glyphicon-stop"></span></button>';
    
    $('#botnet-status-panel-title').removeClass('waiting');
    
    $('#log-table').dataTable().fnAdjustColumnSizing();
    $('#bot-table').dataTable().fnDraw();
    
}

function get_botnet_status() {
    $('#botnet-status-panel-title').addClass('waiting');
    $.getJSON(MANAGEMENT_SCRIPT + '?scope=botnet&action=status')
        .done(function (data) {
            bot_status = data;
            update_bot_status();
        })
        .fail(function (err1, err2, errMessage) {
            show_error('Error loading botnet status: ' + errMessage);
        });
}
    
    
function start_bot(bot_id) {
    $('#botnet-status-panel-title').addClass('waiting');
    $.getJSON(MANAGEMENT_SCRIPT + '?scope=bot&action=start&id=' + bot_id)
        .done(function (status) {
            bot_status[bot_id] = status;
            update_bot_status();
        })
        .fail(function (err1, err2, errMessage) {
            show_error('Error starting bot: ' + errMessage);
        });
}

function stop_bot(bot_id) {
    $('#botnet-status-panel-title').addClass('waiting');
    $.getJSON(MANAGEMENT_SCRIPT + '?scope=bot&action=stop&id=' + bot_id)
        .done(function (status) {
            bot_status[bot_id] = status;
            update_bot_status();
        })
        .fail(function (err1, err2, errMessage) {
            show_error('Error stopping bot: ' + errMessage);
        });
}

function start_botnet() {
    $('#botnet-status-panel-title').addClass('waiting');
    $.getJSON(MANAGEMENT_SCRIPT + '?scope=botnet&action=start')
        .done(function (status) {
            bot_status = status;
            update_bot_status();
        })
        .fail(function (err1, err2, err3) {
            show_error('Error starting botnet: ' + errMessage);
        });
}

function stop_botnet() {
    $('#botnet-status-panel-title').addClass('waiting');
    $.getJSON(MANAGEMENT_SCRIPT + '?scope=botnet&action=stop')
        .done(function (status) {
            bot_status = status;
            update_bot_status();
        })
        .fail(function (err1, err2, err3) {
            show_error('Error stopping botnet: ' + errMessage);
        });    
}

get_botnet_status();