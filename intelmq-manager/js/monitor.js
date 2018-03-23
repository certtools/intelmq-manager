
var ALL_BOTS = 'All Bots';
var bot_logs = {};
var bot_queues = {};
var reload_queues = null;
var reload_logs = null;

$dq = $("#destination-queues");
$('#log-table').dataTable({
    lengthMenu: [[5, 10, 25, -1], [5, 10, 25, "All"]],
    pageLength: 10,
    order: [0, 'desc'],
    autoWidth: false,
    columns: [
        {"data": "date"},
        {"data": "bot_id"},
        {"data": "log_level"},
        {"data": "message"},
        {"data": "actions"}
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

    if (bot_logs == {}) {
        $('#log-table').dataTable().fnAdjustColumnSizing();
        $('#log-table').dataTable().fnDraw();
        return;
    }

    for (let index in bot_logs) {
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
            extended_message_func = function (message_index) {
                show_extended_message(message_index);
            }
            document.getElementById('button-extended-message-' + index).addEventListener('click', function (index) {
                return function () {
                    extended_message_func(index)
                }
            }(index))
        }
    }

    $('#log-table').dataTable().fnAdjustColumnSizing();
    $('#log-table').dataTable().fnDraw();
}

var queue_overview = {}; // one-time queue overview to allow traversing
function redraw_queues() {
    var bot_id = document.getElementById('monitor-target').innerHTML;

    var source_queue_element = document.getElementById('source-queue');
    var internal_queue_element = document.getElementById('internal-queue');
    //var destination_queues_element = document.getElementById('destination-queues');

    source_queue_element.innerHTML = '';
    internal_queue_element.innerHTML = '';
    //destination_queues_element.innerHTML = '';

    var bot_info = {};
    if (bot_id === ALL_BOTS || !queue_overview.length) {
        bot_info['source_queues'] = {};
        bot_info['destination_queues'] = {};

        for (let bot in bot_queues) {
            var source_queue = bot_queues[bot]['source_queue'];
            var destination_queues = bot_queues[bot]['destination_queues'];
            var internal_queue = bot_queues[bot]['internal_queue'];
            var parentName = bot;

            if (source_queue) {
                bot_info['destination_queues'][source_queue[0]] = source_queue;
                bot_info['destination_queues'][source_queue[0]]['parent'] = parentName;
            }

            if (internal_queue !== undefined) {
                var queue_name = bot + '-queue-internal';
                bot_info['destination_queues'][queue_name] = [queue_name, internal_queue];
                bot_info['destination_queues'][queue_name]['parent'] = parentName;
            }
        }
        if (!queue_overview.length) {
            // we build queue_overview only once; on bot detail, we spare this block
            queue_overview = bot_info;
        }
    }
    if (bot_id !== ALL_BOTS) {
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
        for (let bot in bot_info['destination_queues']) {
            dst_queues.push(bot_info['destination_queues'][bot]);
        }

        dst_queues.sort();
        for (let bot in dst_queues) {

            let queue = dst_queues[bot][0];
            let count = dst_queues[bot][1];

            if ($("tr:eq({0}) td:eq(0)".format(bot), $dq).text() === queue) {
                // row exist, just update the count
                $("tr:eq({0}) td:eq(1)".format(bot), $dq).text(count);
            } else {
                // for some reason, dst_queues from server changed from the table
                // let's find the table row
                o = $("tr td:first-child", $dq).filter(function () {
                    return $(this).text() === queue;
                });
                if (o.length) { // successfully found
                    o.next().text(count);
                } else { // not present in the table
                    // make unknown queue a new row
                    $tr = $("<tr/>").data("bot-id", queue_overview['destination_queues'][queue]["parent"]).appendTo($dq);
                    $("<td/>").appendTo($tr).text(queue).click(function () {
                        let selectBot = $(this).closest("tr").data("bot-id");
                        console.log("selectBot", selectBot);
                        if (selectBot) {
                            select_bot(selectBot, true);
                        }
                    });
                    $("<td/>").appendTo($tr).text(count);
                    $("<td/>").appendTo($tr).html(generateClearQueueButton(queue)); // regenerate thrash button
                }
            }

            /* old code redrawing the table all the time:
             var destination_queue = destination_queues_element.insertRow();

             var cell0 = destination_queue.insertCell(0);
             cell0.innerHTML = queue;
             cell0.addEventListener("click", function (event) {
             var selectedBot = dst_queues[$(event.target).closest('tr').index()]["parent"];
             //window.location.href = MONITOR_BOT_URL.format(selectedBot);
             select_bot(selectedBot);
             });

             var cell1 = destination_queue.insertCell(1);
             cell1.innerHTML = dst_queues[index][1];

             buttons_cell = destination_queue.insertCell(2);
             buttons_cell.appendChild(generateClearQueueButton(queue));*/
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
            .fail(ajax_fail_callback('Error clearing queue ' + queue_id + ":"));
}

function load_bot_log() {
    var that = this;
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
            })
            .always(function () {
                that.blocking = false;
            });
}

function load_bot_queues() {
    var that = this;
    $('#queues-panel-title').addClass('waiting');

    var bot_id = document.getElementById('monitor-target').innerHTML;

    $.getJSON(MANAGEMENT_SCRIPT + '?scope=queues')
            .done(function (data) {
                bot_queues = data;
                redraw_queues();
                $('#queues-panel-title').removeClass('waiting');
            })
            .fail(ajax_fail_callback('Error loading bot queues information:'))
            .always(function () {
                that.blocking = false;
            });
}

function select_bot(bot_id, history_push = false) {
    if (history_push) {
        window.history.pushState(null, null, MONITOR_BOT_URL.format(bot_id));
    }

    $("tr", $dq).remove(); // make destination table rebuild itself

    if (reload_queues != null) {
        clearInterval(reload_queues);
    }

    if (reload_logs != null) {
        clearInterval(reload_logs);
    }

    document.getElementById('monitor-target').innerHTML = bot_id;
    load_bot_queues();

    reload_queues = new Interval(load_bot_queues, RELOAD_QUEUES_EVERY * 1000, true);

    $("#destination-queues-table").addClass('highlightHovering');
    if (bot_id != ALL_BOTS) {
        $("#logs-panel").css('display', 'block');
        $("#source-queue-table-div").css('display', 'block');
        $("#internal-queue-table-div").css('display', 'block');
        //$("#destination-queues-table").removeClass('highlightHovering');
        $("#destination-queues-table-div").removeClass('col-md-12');
        $("#destination-queues-table-div").addClass('col-md-4');
        $("#destination-queue-header").html("Destination Queue");

        load_bot_log();
        reload_logs = new Interval(load_bot_log, RELOAD_LOGS_EVERY * 1000, true);

    } else {
        $("#logs-panel").css('display', 'none');
        $("#source-queue-table-div").css('display', 'none');
        $("#internal-queue-table-div").css('display', 'none');
        //$("#destination-queues-table").addClass('highlightHovering');
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

            select_bot_func = function (bot_id) {
                return function (event) {
                    event.preventDefault();
                    select_bot(bot_id, true);
                    return false;
                };
            };

            // Insert link for special item 'All Bots'
            var li_element = document.createElement('li');
            var link_element = document.createElement('a');
            link_element.innerHTML = ALL_BOTS;
            link_element.setAttribute('href', "#" + MONITOR_BOT_URL.format(bot_id));
            link_element.addEventListener('click', select_bot_func(ALL_BOTS));

            li_element.appendChild(link_element);
            sidemenu.appendChild(li_element);

            // Insert link for every bot
            var bots_ids = Object.keys(data);
            bots_ids.sort();

            for (let index in bots_ids) {
                var bot_id = bots_ids[index];
                li_element = document.createElement('li');
                link_element = document.createElement('a');

                link_element.innerHTML = bot_id;
                link_element.setAttribute('href', "#" + MONITOR_BOT_URL.format(bot_id)); //XX don't know what is that good for, seem have no impact to funcionality
                link_element.addEventListener('click', select_bot_func(bot_id));

                li_element.appendChild(link_element);
                sidemenu.appendChild(li_element);
            }
        })
        .fail(ajax_fail_callback('Error loading botnet status:'));



$(document).ready(popState);
window.addEventListener("popstate", popState);
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('log-level-indicator').addEventListener('change', load_bot_log);

    // XXXX JE TO SAFE? zkus tam dát ;
    // nejake slashes ve zpravach
    // escapeshellcmd?

    // Inspect panel functionality
    $insp = $("#inspect-panel");
    $("button[data-role=clear]", $insp).click(function () {
        $("#message-playground").val("");
        $("#run-log").attr("rows", 3).val("");
    });
    $("button[data-role=get]", $insp).click(function () {
        run_command("message get", "get");
    });
    $("button[data-role=pop]", $insp).click(function () {
        run_command("message pop", "pop");
    });
    $("button[data-role=send]", $insp).click(function () {
        run_command("message send", "send", $("#message-playground").val());
    });
    $("button[data-role=process]", $insp).click(function () {
        let msg = $("[data-role=inject]", $insp).prop("checked") ? $("#message-playground").val() : "";
        let dry = $("[data-role=dry]", $insp).prop("checked");
        run_command("process" + (dry ? " --dryrun" : "") + (msg ? " --msg" : ""), "process", msg, dry);
    });
});

/**
 * For purpose of better learning curve, we build intelmq command here at client
 * (however we won't upload it on server, we prefer have a whitelisted set of commands due to security
 * @param {string} bot
 * @param {string} cmd
 * @param {type} msg
 * @param {type} dry
 * @returns {undefined}
 */
function run_command(display_cmd, cmd, msg = "", dry = false) {
    var bot = getUrlParameter('bot_id');
    $("#command-show").show().html("intelmqctl run {0} {1} {2}".format(bot, display_cmd, msg ? "'" + msg + "'" : ""));//XX dry are not syntax-correct
    $("#run-log").val("loading...");
    $.ajax({
        //dataType: "json",
        method: "post",
        data: {"msg": msg},
        url: MANAGEMENT_SCRIPT + '?scope=run&bot={0}&cmd={1}&dry={2}'.format(bot, cmd, dry),
        timeout: 1000,
        //data: data,
    }).done(function (data) {
        // Parses the received data to message part and to log-only part
        let logs = "";
        let msg = "";
        let logging = true;
        for (let line of data.split("\n")) {
            if (line === "{") {
                logging = false;
            }
            if (logging) {
                logs += line + "\n";
            } else {
                msg += line + "\n";
            }
        }
        if (msg) { // we won't rewrite an old message if nothing came
            $("#message-playground").attr("rows", 18).val(msg);
        }
        $("#run-log").attr("rows", 22).val(logs);
        //$('#queues-panel-title').removeClass('waiting');
    }).fail(function (jqXHR, textStatus) {
        if (textStatus === "timeout") {
            show_error("Message timeout, maybe bot has nothing in the queue?");
            return;
        }
        ajax_fail_callback('Error getting message:').apply(null, arguments);
    });
}


/**
 * Select correct bot when browsing in history or coming from an external link etc.
 */
function popState() {
    $("#run-log").val("");
    var bot_id = getUrlParameter('bot_id');
    if (typeof (bot_id) !== 'undefined') {
        //window.history.replaceState(null, null, MONITOR_BOT_URL.format(bot_id));
        select_bot(bot_id);
    } else {
        select_bot(ALL_BOTS);
    }
}


// general functions

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
