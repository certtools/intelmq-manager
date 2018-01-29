var BOT_CLASS_DEFINITION = {
    'starting': 'warning',
    'running': 'success',
    'stopping': 'warning',
    'stopped': 'danger',
    'reloading' : 'warning',
    'restarting' : 'warning',
    'incomplete' : 'warning'
}

var BOT_STATUS_DEFINITION = {
    'starting': 'starting',
    'running': 'running',
    'stopping': 'stopping',
    'stopped': 'stopped',
    'reloading' : 'reloading',
    'restarting' : 'restarting',
    'incomplete' : 'incomplete'
}

var bot_status = {};
var botnet_status = '';

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
    $('#bot-table').dataTable().fnAdjustColumnSizing();
    $('#bot-table').dataTable().fnDraw();
};

function update_bot_status() {
    var bot_table_element = document.getElementById('bot-table-body');
    
    $('#bot-table').dataTable().fnClearTable();
    
    for (bot_id in bot_status) {
        var bot_class = 'bg-danger';
        
        buttons_cell = '' +
            '<button type="submit" class="btn btn-default" title="Start" id="button-start-bot-' + bot_id + '"><span class="glyphicon glyphicon-play"></span></button>' +
            '<button type="submit" class="btn btn-default" title="Stop" id="button-stop-bot-' + bot_id + '"><span class="glyphicon glyphicon-stop"></span></button>' +
            '<button type="submit" class="btn btn-default" title="Reload" id="button-reload-bot-' + bot_id + '"><span class="glyphicon glyphicon-repeat"></span></button>' +
            '<button type="submit" class="btn btn-default" title="Restart" id="button-restart-bot-' + bot_id + '"><span class="glyphicon glyphicon-refresh"></span></button>';

        bot_row = {
            'bot_id': bot_id,
            'bot_status': bot_status[bot_id],
            'actions': buttons_cell,
            'DT_RowClass': BOT_CLASS_DEFINITION[bot_status[bot_id]]
        };
		
		$('#bot-table-body tr').click(function (event) {
			if($(event.target).closest('td').index() == 0) {
				window.location.href = "?page=monitor&bot_id=" + event.target.innerText;
			}
		});

        $('#bot-table').dataTable().fnAddData(bot_row);
        bot_action_func = function(action_function, message_index){
            action_function(message_index);
        }
        document.getElementById('button-start-bot-' + bot_id).addEventListener('click', function(start_bot, bot_id) {
                return function(){bot_action_func(start_bot, bot_id)}}(start_bot, bot_id))
        document.getElementById('button-stop-bot-' + bot_id).addEventListener('click', function(stop_bot, bot_id) {
                return function(){bot_action_func(stop_bot, bot_id)}}(stop_bot, bot_id))
        document.getElementById('button-reload-bot-' + bot_id).addEventListener('click', function(reload_bot, bot_id) {
                return function(){bot_action_func(reload_bot, bot_id)}}(reload_bot, bot_id))
        document.getElementById('button-restart-bot-' + bot_id).addEventListener('click', function(restart_bot, bot_id) {
                return function(){bot_action_func(restart_bot, bot_id)}}(restart_bot, bot_id))
    }
    
    update_botnet_status(botnet_status);
    
    $('#bot-table').dataTable().fnAdjustColumnSizing();
    $('#bot-table').dataTable().fnDraw();
    
}

function update_botnet_status(newStatus) {
    var botnet_status_element = document.getElementById('botnet-status');
    var botnet_buttons_element = document.getElementById('botnet-buttons');

    if((newStatus == BOT_STATUS_DEFINITION.stopped) || (newStatus == BOT_STATUS_DEFINITION.running) || 
        (newStatus == BOT_STATUS_DEFINITION.incomplete) || (botnet_status == '')) {
        var atLeastOneStopped = false;
        var atLeastOneRunning = false;
        for (bot_id in bot_status) {
            if (bot_status[bot_id].indexOf(BOT_STATUS_DEFINITION.stopped) == 0) {
                atLeastOneStopped = true;
            } else if (bot_status[bot_id].indexOf(BOT_STATUS_DEFINITION.running) == 0){
                atLeastOneRunning = true;
            }
        }

        if ((atLeastOneStopped == true) && (atLeastOneRunning == true)) {
            newStatus = BOT_STATUS_DEFINITION.incomplete;
        }
        else if ((atLeastOneStopped == true) && (atLeastOneRunning == false)) {
            newStatus = BOT_STATUS_DEFINITION.stopped;
        }
        else if ((atLeastOneStopped == false) && (atLeastOneRunning == true)) {
            newStatus = BOT_STATUS_DEFINITION.running;
        }
        else {
            newStatus = BOT_STATUS_DEFINITION.stopped;
        }
    }

    botnet_status = newStatus;

    botnet_status_element.setAttribute('class', 'bg-' + BOT_CLASS_DEFINITION[botnet_status]);
    botnet_status_element.innerHTML = botnet_status;
    
    botnet_buttons_element.innerHTML = '' +
        '<button type="submit" class="btn btn-default" title="Start" id="button-start-botnet"><span class="glyphicon glyphicon-play"></span></button>' + 
        '<button type="submit" class="btn btn-default" title="Stop" id="button-stop-botnet"><span class="glyphicon glyphicon-stop"></span></button>' + 
        '<button type="submit" class="btn btn-default" title="Reload" id="button-reload-botnet"><span class="glyphicon glyphicon-repeat"></span></button>' +
        '<button type="submit" class="btn btn-default" title="Restart" id="button-restart-botnet"><span class="glyphicon glyphicon-refresh"></span></button>';

    document.getElementById('button-start-botnet').addEventListener('click', start_botnet);
    document.getElementById('button-stop-botnet').addEventListener('click', stop_botnet);
    document.getElementById('button-reload-botnet').addEventListener('click', reload_botnet);
    document.getElementById('button-restart-botnet').addEventListener('click', restart_botnet);

    $('#botnet-status-panel-title').removeClass('waiting');
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
    bot_status[bot_id] = BOT_STATUS_DEFINITION.starting;
    update_bot_status();
    $.getJSON(MANAGEMENT_SCRIPT + '?scope=bot&action=start&id=' + bot_id)
        .done(function (status) {
            bot_status[bot_id] = status;
            update_bot_status();
        })
        .fail(function (err1, err2, errMessage) {
            show_error('Error starting bot: ' + errMessage);
            bot_status[bot_id] = BOT_CLASS_DEFINITION.stopped;
        });
}

function stop_bot(bot_id) {
    $('#botnet-status-panel-title').addClass('waiting');
    bot_status[bot_id] = BOT_STATUS_DEFINITION.stopping;
    update_bot_status();
    $.getJSON(MANAGEMENT_SCRIPT + '?scope=bot&action=stop&id=' + bot_id)
        .done(function (status) {
            bot_status[bot_id] = status;
            update_bot_status();
        })
        .fail(function (err1, err2, errMessage) {
            show_error('Error stopping bot: ' + errMessage);
        });
}

function reload_bot(bot_id) {
    $('#botnet-status-panel-title').addClass('waiting');
    bot_status[bot_id] = BOT_STATUS_DEFINITION.reloading;
    update_bot_status();
    $.getJSON(MANAGEMENT_SCRIPT + '?scope=bot&action=reload&id=' + bot_id)
        .done(function (status) {
            bot_status[bot_id] = status;
            update_bot_status();
        })
        .fail(function (err1, err2, errMessage) {
            show_error('Error reloading bot: ' + errMessage);
        });
}

function restart_bot(bot_id) {
    $('#botnet-status-panel-title').addClass('waiting');
    bot_status[bot_id] = BOT_STATUS_DEFINITION.restarting;
    update_bot_status();
    $.getJSON(MANAGEMENT_SCRIPT + '?scope=bot&action=restart&id=' + bot_id)
        .done(function (status) {
            bot_status[bot_id] = status[1];
            update_bot_status();
        })
        .fail(function (err1, err2, errMessage) {
            show_error('Error restarting bot: ' + errMessage);
        });
}

function start_botnet() {
    $('#botnet-status-panel-title').addClass('waiting');
    botnet_status = BOT_STATUS_DEFINITION.starting;
    update_bot_status();
    $.getJSON(MANAGEMENT_SCRIPT + '?scope=botnet&action=start')
        .done(function (status) {
            bot_status = status;
            botnet_status = ''; //will be re-evaluated in update_bot_status()
            update_bot_status();
        })
        .fail(function (err1, err2, err3) {
            show_error('Error starting botnet: ' + errMessage);
        });
}

function stop_botnet() {
    $('#botnet-status-panel-title').addClass('waiting');
    botnet_status = BOT_STATUS_DEFINITION.stopping;
    update_bot_status();
    $.getJSON(MANAGEMENT_SCRIPT + '?scope=botnet&action=stop')
        .done(function (status) {
            bot_status = status;
            botnet_status = ''; //will be re-evaluated in update_bot_status()
            update_bot_status();
        })
        .fail(function (err1, err2, err3) {
            show_error('Error stopping botnet: ' + errMessage);
        });    
}

function reload_botnet() {
    $('#botnet-status-panel-title').addClass('waiting');
    botnet_status = BOT_STATUS_DEFINITION.reloading;
    update_bot_status();
    $.getJSON(MANAGEMENT_SCRIPT + '?scope=botnet&action=reload')
        .done(function (status) {
            bot_status = status;
            botnet_status = ''; //will be re-evaluated in update_bot_status()
            update_bot_status();
        })
        .fail(function (err1, err2, err3) {
            show_error('Error reloading botnet: ' + errMessage);
        });    
}

function restart_botnet() {
    $('#botnet-status-panel-title').addClass('waiting');
    botnet_status = BOT_STATUS_DEFINITION.restarting;
    update_bot_status();
    $.getJSON(MANAGEMENT_SCRIPT + '?scope=botnet&action=restart')
        .done(function (status) {
            bot_status = status;
            botnet_status = ''; //will be re-evaluated in update_bot_status()
            update_bot_status();
        })
        .fail(function (err1, err2, err3) {
            show_error('Error restarting botnet: ' + errMessage);
        });    
}

get_botnet_status();
