
var LEVEL_CLASS = {
    'DEBUG': 'success',
    'INFO': 'info',
    'WARNING': 'warning',
    'ERROR': 'danger',
    'CRITICAL': 'danger'
}

var RELOAD_EVERY = 2; /* 10 seconds */

var bot_logs = {};
var bot_queues = {};
var reload_data = setInterval(function () {
    load_bot_queues();
}, RELOAD_EVERY * 1000);


$('#log-table').dataTable({
        scrollY: window.innerHeight * 0.5,
        pageLength: 10,
        order: [0, 'asc'],
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
    
    var number_of_lines = 100;
    
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
        
    load_bot_queues();
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