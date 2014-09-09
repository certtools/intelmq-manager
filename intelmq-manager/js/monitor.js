
var bot_logs = {};
var bot_queues = {};
var reload_queues = null;
var reload_logs = null;


$('#log-table').dataTable({
    lengthMenu: [[5, 10, 25, -1], [5, 10, 25, "All"]],
    pageLength: 5,
    order: [0, 'desc'],
    columns: [
        { "data": "date" },
        { "data": "bot_id" },
        { "data": "log_level" },
        { "data": "message" }
    ]
});

window.onresize = function () {
    redraw();
};

function redraw() {
    redraw_logs();
    redraw_queues();
}

function redraw_logs() {
    $('#log-table').dataTable().fnClearTable();
    
    for (index in bot_logs) {
        var log_row = bot_logs[index];
        
        log_row['DT_RowClass'] = LEVEL_CLASS[log_row['log_level']];
        
        $('#log-table').dataTable().fnAddData(log_row);
    }
    
    $('#log-table').dataTable().fnAdjustColumnSizing();
    $('#log-table').dataTable().fnDraw();
}

function redraw_queues() {
    var bot_id = document.getElementById('monitor-target').innerHTML;
    
    var source_queue_element = document.getElementById('source-queue');
    var destination_queues_element = document.getElementById('destination-queues');
    
    source_queue_element.innerHTML = '';
    destination_queues_element.innerHTML = '';
    
    var bot_info = bot_queues[bot_id];
    
    if (bot_info) {
        if (bot_info['source_queue']) {
            var source_queue = source_queue_element.insertRow();
            var cell0 = source_queue.insertCell(0);
            cell0.innerHTML = bot_info['source_queue'][0]
            
            var cell1 = source_queue.insertCell(1);
            cell1.innerHTML = bot_info['source_queue'][1]
        }
        
        for (index in bot_info['destination_queues']) {
            var destination_queue = destination_queues_element.insertRow();
            
            var cell0 = destination_queue.insertCell(0);
            cell0.innerHTML = bot_info['destination_queues'][index][0];
            
            var cell1 = destination_queue.insertCell(1);
            cell1.innerHTML = bot_info['destination_queues'][index][1];

        }
    }
}

function load_bot_log() {
    $('#logs-panel-title').addClass('waiting');
    
    var number_of_lines = LOAD_X_LOG_LINES;
    
    var bot_id = document.getElementById('monitor-target').innerHTML;
    var level = document.getElementById('log-level-indicator').value;
        
    $.getJSON(MANAGEMENT_SCRIPT + '?scope=log&id=' + bot_id + '&lines=' + number_of_lines + '&level=' + level)
        .done(function (data) {
            bot_logs = data;
            redraw_logs();
            $('#logs-panel-title').removeClass('waiting');
        })
        .fail(function () {
            alert('Error loading bot logs');
        });
}

function load_bot_queues() {
    $('#queues-panel-title').addClass('waiting');
    
    var bot_id = document.getElementById('monitor-target').innerHTML;
    
    $.getJSON(MANAGEMENT_SCRIPT + '?scope=queues')
        .done(function (data) {
            bot_queues = data;
            redraw_queues();
            $('#queues-panel-title').removeClass('waiting');
        })
        .fail(function () {
            alert('Error loading bot queues information');
        });    
}

function select_bot(bot_id) {    
    document.getElementById('monitor-target').innerHTML = bot_id;
    load_bot_log();
    load_bot_queues();
    
    if(reload_queues != null) {
        clearInterval(reload_queues);
    }
    
    if(reload_logs != null) {
        clearInterval(reload_logs);
    }
    
    reload_queues = setInterval(function () {
        load_bot_queues();
    }, RELOAD_QUEUES_EVERY * 1000);


    reload_logs = setInterval(function () {
        load_bot_logs();
    }, RELOAD_LOGS_EVERY * 1000);
}

$.getJSON(MANAGEMENT_SCRIPT + '?scope=botnet&action=status')
    .done(function (data) {
        var sidemenu = document.getElementById('side-menu');
        
        var bots_ids = Object.keys(data);
        bots_ids.sort();
        
        for (index in bots_ids) {
            var bot_id = bots_ids[index];
            var li_element = document.createElement('li');
            var link_element = document.createElement('a');
            
            link_element.innerHTML = bot_id;
            link_element.setAttribute('onclick', 'select_bot("' + bot_id + '")');
            
            li_element.appendChild(link_element);
            sidemenu.appendChild(li_element);
        }
    })
    .fail(function () {
        alert('Error loading botnet status');
    });
    
    // TODO: 