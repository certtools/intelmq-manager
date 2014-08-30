var BOT_CLASS = {
    'starting': 'warning',
    'running': 'success',
    'stopping': 'danger',
    'stopped': 'danger'
}

var bot_status = {};

$('#bot-table').dataTable({
        scrollY: window.innerHeight * 0.5,
        pageLength: 10
    });

window.onresize = function () {
    $('#bot-table').dataTable().draw();
};

function update_bot_status() {
    var botnet_status = 'stopped';
    var full_run = true;
    
    var botnet_status_element = document.getElementById('botnet-status');
    var botnet_buttons_element = document.getElementById('botnet-buttons');
    var bot_table_element = document.getElementById('bot-table-body');
    
    bot_table_element.innerHTML = '';
    
    for (bot_id in bot_status) {
        var bot_class = 'bg-danger';
        if (bot_status[bot_id].indexOf('stop') != -1) {
            full_run = false;
        } else {
            botnet_status = 'running';
        }
        
        var table_row = bot_table_element.insertRow(-1);
        var bot_id_cell = table_row.insertCell(0);
        var status_cell = table_row.insertCell(1);
        var buttons_cell = table_row.insertCell(2);
        
        bot_id_cell.innerHTML = bot_id;
        status_cell.innerHTML = bot_status[bot_id];
        table_row.setAttribute('class', BOT_CLASS[bot_status[bot_id]]);
        
        buttons_cell.innerHTML = '' +
            '<button type="submit" class="btn btn-default" onclick="start_bot(\'' + bot_id + '\')"><span class="glyphicon glyphicon-play"></span></button>' + 
            '<button type="submit" class="btn btn-default" onclick="stop_bot(\'' + bot_id + '\')"><span class="glyphicon glyphicon-stop"></span></button>';
    }
    
    botnet_status_element.setAttribute('class', 'bg-' + BOT_CLASS[botnet_status]);
    botnet_status_element.innerHTML = botnet_status;
    
    botnet_buttons_element.innerHTML = '' +
        '<button type="submit" class="btn btn-default" onclick="start_botnet()"><span class="glyphicon glyphicon-play"></span></button>' + 
        '<button type="submit" class="btn btn-default" onclick="stop_botnet()"><span class="glyphicon glyphicon-stop"></span></button>';
    
    $('#bot-table').dataTable().draw();
}

$.getJSON(MANAGEMENT_SCRIPT + '?scope=botnet&action=status')
    .done(function (data) {
        bot_status = data;
        update_bot_status();
    })
    .fail(function () {
        alert('Error loading botnet status');
    });
    
    
function start_bot(bot_id) {
    $.getJSON(MANAGEMENT_SCRIPT + '?scope=bot&action=start&id=' + bot_id)
        .done(function (status) {
            bot_status[bot_id] = status;
            update_bot_status();
        })
        .fail(function () {
            alert('Error starting bot');
        });
}

function stop_bot(bot_id) {
    $.getJSON(MANAGEMENT_SCRIPT + '?scope=bot&action=stop&id=' + bot_id)
        .done(function (status) {
            bot_status[bot_id] = status;
            update_bot_status();
        })
        .fail(function () {
            alert('Error stopping bot');
        });
}

function start_botnet() {
    $.getJSON(MANAGEMENT_SCRIPT + '?scope=botnet&action=start')
        .done(function (status) {
            bot_status = status;
            update_bot_status();
        })
        .fail(function () {
            alert('Error starting botnet bot');
        });
}

function stop_botnet() {
    $.getJSON(MANAGEMENT_SCRIPT + '?scope=botnet&action=stop')
        .done(function (status) {
            bot_status = status;
            update_bot_status();
        })
        .fail(function () {
            alert('Error stopping botnet bot');
        });    
}