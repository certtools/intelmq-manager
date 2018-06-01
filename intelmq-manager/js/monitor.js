
var ALL_BOTS = 'All Bots';

var bot_logs = {};
var bot_queues = {};
var reload_queues = null;
var reload_logs = null;


$('#log-table').dataTable({
    lengthMenu: [[5, 10, 25, -1], [5, 10, 25, "All"]],
    pageLength: 10,
    order: [0, 'desc'],
    autoWidth: false,
    columns: [
        { "data": "date" },
        { "data": "bot_id" },
        { "data": "log_level" },
        { "data": "message" },
        { "data": "actions" }
    ]
});

window.onresize = function () {
    redraw();
};

$(document).ready(function () {
    var bot_id = getUrlParameter('bot_id');
    if (typeof(bot_id) !== 'undefined') {
        window.history.replaceState(null, null, '?page=monitor');
        select_bot(bot_id);
    }
})

function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
}

function redraw() {
    redraw_logs();
    redraw_queues();
}

function redraw_logs() {
    $('#log-table').dataTable().fnClearTable();

    if  (bot_logs == {}) {
        $('#log-table').dataTable().fnAdjustColumnSizing();
        $('#log-table').dataTable().fnDraw();
        return;
    }

    for (index in bot_logs) {
        var log_row = $.extend(true, {}, bot_logs[index]);
        var has_button = false;

        if (log_row['extended_message']) {
            buttons_cell = '' +
                '<button type="submit" class="btn btn-default btn-xs" data-toggle="modal" data-target="#extended-message-modal" id="button-extended-message-' + index + '"><span class="glyphicon glyphicon-plus"></span></button>';
            has_button = true;
            log_row['actions'] = buttons_cell;
        } else if (log_row['message'].length > MESSAGE_LENGTH) {
            log_row['message'] = log_row['message'].slice(0, MESSAGE_LENGTH) + '<strong>...</strong>';
            buttons_cell = '' +
                '<button type="submit" class="btn btn-default btn-xs" data-toggle="modal" data-target="#extended-message-modal" id="button-extended-message-' + index + '"><span class="glyphicon glyphicon-plus"></span></button>';
            has_button = true;
            log_row['actions'] = buttons_cell;
        } else {
            log_row['actions'] = '';
        }


        log_row['DT_RowClass'] = LEVEL_CLASS[log_row['log_level']];


        $('#log-table').dataTable().fnAddData(log_row);
        if (has_button) {
            extended_message_func = function(message_index){
                show_extended_message(message_index);
            }
            document.getElementById('button-extended-message-' + index).addEventListener('click', function(index) {
                return function(){extended_message_func(index)}}(index))
        }
    }

    $('#log-table').dataTable().fnAdjustColumnSizing();
    $('#log-table').dataTable().fnDraw();
}

function redraw_queues() {
    var bot_id = document.getElementById('monitor-target').innerHTML;

    var source_queue_element = document.getElementById('source-queue');
    var internal_queue_element = document.getElementById('internal-queue');
    var destination_queues_element = document.getElementById('destination-queues');

    source_queue_element.innerHTML = '';
    internal_queue_element.innerHTML = '';
    destination_queues_element.innerHTML = '';

    var bot_info = {};
    if (bot_id == ALL_BOTS) {
        bot_info['source_queues'] = {};
        bot_info['destination_queues'] = {};

        for (index in bot_queues) {
            var source_queue = bot_queues[index]['source_queue'];
            var destination_queues = bot_queues[index]['destination_queues'];
            var internal_queue = bot_queues[index]['internal_queue'];
            var parentName = index;

            if (source_queue) {
                bot_info['destination_queues'][source_queue[0]] = source_queue;
                bot_info['destination_queues'][source_queue[0]]['parent'] = parentName;
            }

            if (internal_queue !== undefined) {
              var queue_name = index + '-queue-internal';
              bot_info['destination_queues'][queue_name] = [queue_name, internal_queue];
              bot_info['destination_queues'][queue_name]['parent'] = parentName;
            }
        }
    } else {
        var bot_info = bot_queues[bot_id];
    }


    if (bot_info) {
        if (bot_info['source_queue']) {
            var source_queue = source_queue_element.insertRow();
            var cell0 = source_queue.insertCell(0);
            cell0.innerHTML = bot_info['source_queue'][0];

            var cell1 = source_queue.insertCell(1);
            cell1.innerHTML = bot_info['source_queue'][1];

            buttons_cell = source_queue.insertCell(2);
            buttons_cell.appendChild(generateClearQueueButton(bot_info['source_queue'][0]));
        }

        if (bot_info['internal_queue'] !== undefined) {
          var internal_queue = internal_queue_element.insertRow();
          var cell0 = internal_queue.insertCell(0);
          cell0.innerHTML = 'internal-queue';

          var cell1 = internal_queue.insertCell(1);
          cell1.innerHTML = bot_info['internal_queue'];

          buttons_cell = internal_queue.insertCell(2);
          buttons_cell.appendChild(generateClearQueueButton(bot_id + '-queue-internal'));
        }

        var dst_queues = [];
        for (index in bot_info['destination_queues']) {
            dst_queues.push(bot_info['destination_queues'][index]);
        }

        dst_queues.sort();

        for (index in dst_queues) {
            var destination_queue = destination_queues_element.insertRow();

            var cell0 = destination_queue.insertCell(0);
            cell0.innerHTML = dst_queues[index][0];
            cell0.addEventListener("click", function (event) {
                var selectedBot = dst_queues[$(event.target).closest('tr').index()]["parent"];
                window.location.href = "?page=monitor&bot_id=" + selectedBot;
            });

            var cell1 = destination_queue.insertCell(1);
            cell1.innerHTML = dst_queues[index][1];

            buttons_cell = destination_queue.insertCell(2);
            buttons_cell.appendChild(generateClearQueueButton(dst_queues[index][0]));
        }
    }
}

function generateClearQueueButton(queue_id) {
    var spanHolder = document.createElement('span');
    spanHolder.className = 'fa fa-trash-o';

    var clearQueueButton = document.createElement('button');
    clearQueueButton.queue = queue_id;
    clearQueueButton.type = 'submit';
    clearQueueButton.class = 'btn btn-default';
    clearQueueButton.title = 'Clear';
    clearQueueButton.appendChild(spanHolder);
    clearQueueButton.addEventListener("click", function (event) {
        clearQueue(this.queue);
    });

    return clearQueueButton;
}

function clearQueue(queue_id) {
    console.log(queue_id);
    $.getJSON(MANAGEMENT_SCRIPT + '?scope=clear&id=' + queue_id)
        .done(function (data) {
            redraw_queues();
            console.log(data);
            $('#queues-panel-title').removeClass('waiting');
        })
        .fail(function (err1, err2, errMessage) {
            show_error('Error clearing queue ' + queue_id + ' : ' + errMessage);
        });
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
        .fail(function (err1, err2, errMessage) {
            bot_logs = {};
            redraw_logs();
            $('#logs-panel-title').removeClass('waiting');
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
        .fail(function (err1, err2, errMessage) {
            show_error('Error loading bot queues information: ' + errMessage);
        });
}

function select_bot(bot_id) {
    if(reload_queues != null) {
        clearInterval(reload_queues);
    }

    if(reload_logs != null) {
        clearInterval(reload_logs);
    }

    document.getElementById('monitor-target').innerHTML = bot_id;
    load_bot_queues();

    reload_queues = setInterval(function () {
        load_bot_queues();
    }, RELOAD_QUEUES_EVERY * 1000);

    if(bot_id != ALL_BOTS) {
        $("#logs-panel").css('display', 'block');
        $("#source-queue-table-div").css('display', 'block');
        $("#internal-queue-table-div").css('display', 'block');
        $("#destination-queues-table").removeClass('highlightHovering');
        $("#destination-queues-table-div").removeClass('col-md-12');
        $("#destination-queues-table-div").addClass('col-md-4');
        $("#destination-queue-header").html("Destination Queue");

        load_bot_log();
        reload_logs = setInterval(function () {
            load_bot_log();
        }, RELOAD_LOGS_EVERY * 1000);
    } else {
        $("#logs-panel").css('display', 'none');
        $("#source-queue-table-div").css('display', 'none');
        $("#internal-queue-table-div").css('display', 'none');
        $("#destination-queues-table").addClass('highlightHovering');
        $("#destination-queues-table-div").removeClass('col-md-4');
        $("#destination-queues-table-div").addClass('col-md-12');
        $("#destination-queue-header").html("Queue");
    }
}

function show_extended_message(index) {
    var modal_body = document.getElementById('modal-body');

    var message = bot_logs[index]['message'];

    if (bot_logs[index]['extended_message']) {
        message += '<br>\n' +
                    bot_logs[index]['extended_message'].replace(/\n/g, '<br>\n').replace(/ /g, '&nbsp;');
    }

    modal_body.innerHTML = message;
}

$.getJSON(MANAGEMENT_SCRIPT + '?scope=botnet&action=status')
    .done(function (data) {
        var sidemenu = document.getElementById('side-menu');

        select_bot_func = function(bot_id) {
            select_bot(bot_id);
            return false;
        }

        var li_element = document.createElement('li');
        var link_element = document.createElement('a');
        link_element.innerHTML = ALL_BOTS;
        link_element.setAttribute('href', '#');
        link_element.addEventListener('click', function(ALL_BOTS) {
                return function(){select_bot_func(ALL_BOTS)}}(ALL_BOTS))

        li_element.appendChild(link_element);
        sidemenu.appendChild(li_element);

        var bots_ids = Object.keys(data);
        bots_ids.sort();

        for (index in bots_ids) {
            var bot_id = bots_ids[index];
            li_element = document.createElement('li');
            link_element = document.createElement('a');

            link_element.innerHTML = bot_id;
            link_element.setAttribute('href', '#');
            link_element.addEventListener('click', function(bot_id) {
                return function(){select_bot_func(bot_id)}}(bot_id))

            li_element.appendChild(link_element);
            sidemenu.appendChild(li_element);
        }
    })
    .fail(function (err1, err2, errMessage) {
        show_error('Error loading botnet status: ' + errMessage);
    });

select_bot(ALL_BOTS);

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('log-level-indicator').addEventListener('change', load_bot_log);
})
