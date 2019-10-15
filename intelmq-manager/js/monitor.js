
var ALL_BOTS = 'All Bots';
var bot_logs = {};
var bot_queues = {};
var path_names = {};
var reload_queues = null;
var reload_logs = null;
var app = app || {};
var buffered_bot = null;
load_configuration(() => {
    // refresh parameters panel when ready
    if (buffered_bot) {
        refresh_configuration_info(buffered_bot);
    }
});



var $dq = $("#destination-queues");
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

$(document).keydown(function (event) {
    if ($("#message-playground").is(":focus")) {
        if ($("[data-role=inject]").attr("data-checked") === "") {
            // when entered a char for first time ever, mark the "inject message" checkbox
            $("[data-role=inject]").prop("checked", true).attr("data-checked", true);
        }
        if (event.ctrlKey && event.keyCode === 13) {
            // ctrl+enter submits
            $("button[data-role=process]").click();
        }
    }
});

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
    var bot_id = getUrlParameter('bot_id') || ALL_BOTS;

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
                $("tr:eq({0}) td:eq(2)".format(bot), $dq).text(count);
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
                        if (selectBot) {
                            select_bot(selectBot, true);
                        }
                    });
                    $("<td/>").appendTo($tr).text("");
                    $("<td/>").appendTo($tr).text(count);
                    $("<td/>").appendTo($tr).html(generateClearQueueButton(queue)); // regenerate thrash button
                }
                refresh_path_names();
            }
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
    $.getJSON(MANAGEMENT_SCRIPT + '?scope=clear&id=' + queue_id)
            .done(function (data) {
                redraw_queues();
                $('#queues-panel-title').removeClass('waiting');
            })
            .fail(ajax_fail_callback('Error clearing queue ' + queue_id));
}

function load_bot_log() {
    $('#logs-panel-title').addClass('waiting');

    let number_of_lines = LOAD_X_LOG_LINES;

    let bot_id = getUrlParameter('bot_id') || ALL_BOTS;
    let level = document.getElementById('log-level-indicator').value;
    if(bot_id === ALL_BOTS) {
         return;
     }
    
    $.getJSON(MANAGEMENT_SCRIPT + '?scope=log&id=' + bot_id + '&lines=' + number_of_lines + '&level=' + level)
            .done(function (data) {
                if(JSON.stringify(data) != JSON.stringify(bot_logs)) { // redraw only if content changed
                    bot_logs = data;
                    redraw_logs();
                }
            })
            .fail(ajax_fail_callback('Error loading bot log information'))
            .always(() => {
                $('#logs-panel-title').removeClass('waiting');
                this.blocking = false;
            });
}

function load_bot_queues() {
    $('#queues-panel-title').addClass('waiting');
    $.getJSON(MANAGEMENT_SCRIPT + '?scope=queues')
            .done(function (data) {
                bot_queues = data;
                redraw_queues();
                $('#queues-panel-title').removeClass('waiting');
            })
            .fail(ajax_fail_callback('Error loading bot queues information'))
            .always(() => {
                this.blocking = false;
            });
}

function select_bot(bot_id, history_push = false) {
    if (history_push) {
        window.history.pushState(null, null, MONITOR_BOT_URL.format(bot_id));
    }

    $("tr", $dq).remove(); // make destination table rebuild itself

    if (reload_queues) {
        reload_queues.stop();
    }

    if (reload_logs) {
        reload_logs.stop();
    }

    $('#monitor-target').html(bot_id);

    load_bot_queues();

    reload_queues = new Interval(load_bot_queues, RELOAD_QUEUES_EVERY * 1000, true);

    $("#destination-queues-table").addClass('highlightHovering');
    if (bot_id !== ALL_BOTS) {
        $("#logs-panel, #inspect-panel, #parameters-panel").css('display', 'block');
        $("#source-queue-table-div").css('display', 'block');
        $("#internal-queue-table-div").css('display', 'block');
        //$("#destination-queues-table").removeClass('highlightHovering');
        $("#destination-queues-table-div").removeClass().addClass('col-md-4'); // however, will be reset in refresh_path_names
        $("#destination-queue-header").html("Destination Queues");

        load_bot_log();
        reload_logs = new Interval(load_bot_log, RELOAD_LOGS_EVERY * 1000, true);

        // control buttons in inspect panel
        $("#inspect-panel .panel-heading .control-buttons").remove();
        $("#inspect-panel .panel-heading").prepend(generate_control_buttons(bot_id, false, load_bot_log, true));

        // connect to configuration panel
        $('#monitor-target').append(' <a title="show in configuration" href="?page=configs#{0}"><img src="./images/config.png" width="24" height="24" /></a>'.format(bot_id));

    } else {
        $("#logs-panel, #inspect-panel, #parameters-panel").css('display', 'none');
        $("#source-queue-table-div").css('display', 'none');
        $("#internal-queue-table-div").css('display', 'none');
        //$("#destination-queues-table").addClass('highlightHovering');
        $("#destination-queues-table-div").removeClass().addClass('col-md-12');
        $("#destination-queue-header").html("Queue");
    }
    // refresh additional information
    refresh_configuration_info(bot_id);
}

function refresh_path_names() {
    if ($.isEmptyObject(path_names)) {
        // expand the columns
        //$dq.parent().find("col:eq(1)").css("visibility", "collapse");
        $dq.parent().find("col:eq(1)").css("display", "none");
        $("td:nth-child(2), th:nth-child(2)", $dq.parent()).css("display", "none");

        $dq.parent().find("th:eq(0)").removeClass().addClass("width-80");
        $dq.parent().find("th:eq(1)").removeClass();
        if ($("#destination-queues-table-div").hasClass('col-md-12')) {
            // in full width display of all bots, there is no need of another hassling
            return;
        }
        $("#destination-queues-table-div").removeClass("col-md-5").addClass("col-md-4");
        $("#internal-queue-table-div").removeClass("col-md-3").addClass("col-md-4");
        return;
    }

    // fold the columns to make more space on the line due to the Path column
    //$dq.parent().find("col:eq(1)").css("visibility", "inherit");
    //$dq.parent().find("col:eq(1)").css("display", "inherit");
    $("td:nth-child(2), th:nth-child(2)", $dq.parent()).css("display", "revert");


    $dq.parent().find("th:eq(0)").removeClass().addClass("width-60");
    $dq.parent().find("th:eq(1)").addClass("width-20");
    $("#destination-queues-table-div").removeClass("col-md-4").addClass("col-md-5");
    $("#internal-queue-table-div").removeClass("col-md-4").addClass("col-md-3");

    $("tr td:first-child", $dq).each(function () {
        let path = path_names[$(this).text()] || null;
        let $el = $(this).next("td");
        $el.html(path || "_default");
        if (!path) {
            $el.css({"color": "gray", "font-style": "italic"});
        }
    });
}

/**
 * Refresh information dependent on the loaded config files: parameters panel + named queues
 * Only when configuration has already been loaded.
 * @param {type} bot_id
 * @returns {undefined}
 */
function refresh_configuration_info(bot_id) {
    if (!app.nodes || !app.edges) {
        // we're not yet ready, buffer the bot for later
        buffered_bot = bot_id;
        return;
    }

    // search for named queue paths
    path_names = {};
    for (let edge of Object.values(app.edges)) {
        if (edge.from === bot_id && edge.path) {
            path_names[edge.to + "-queue"] = edge.path;
        }
    }
    refresh_path_names();

    // refresh parameters panel
    let $panel = $("#parameters-panel .panel-body");
    $panel.text("");
    if (!app.nodes[bot_id] || !app.nodes[bot_id].parameters) {
        $panel.text("Failed to fetch the information.");
        return;
    }
    var params = app.nodes[bot_id].parameters;
    for (let key in params) {
        let param = params[key];
        if (param !== null && typeof value === "object") { // display json/list instead of "[Object object]"
            param = JSON.stringify(param);
        }
        $el = $(`<li><b>${key}</b>: ${param}</li>`);
        if (param && param.indexOf && param.indexOf(ALLOWED_PATH) === 0) {
            let url = LOAD_CONFIG_SCRIPT + "?file=" + param;
            $.getJSON(url, (data) => {
                let html = "";
                if (data.directory) {
                    html += "<h3>Directory {0}</h3>".format(data.directory);
                }

                for (let file in data.files) {
                    let size = data.files[file].size ? "<a data-role=fetchlink href='{0}?fetch=1&file={1}'>fetch {2} B</a>".format(LOAD_CONFIG_SCRIPT, data.files[file].path, data.files[file].size) : "";
                    html += "<h4>File {0}</h4>{1}".format(file, size);
                    if (data.files[file].contents) {
                        html += "<pre>" + data.files[file].contents + "</pre>";
                    }
                }
                $("<div/>", {html: html}).appendTo($el);
            });
        }
        $el.appendTo($panel);
    }
    if (!Object.keys(params).length) {
        $panel.html("No parameters.");
    }
}
$("#parameters-panel").on("click", "a[data-role=fetchlink]", function () {
    $.get($(this).attr("href"), (data) => {
        $(this).after("<pre>" + data + "</pre>").remove();
    });
    return false;
});

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
            link_element.setAttribute('href', "#" + MONITOR_BOT_URL.format(ALL_BOTS));
            link_element.addEventListener('click', select_bot_func(ALL_BOTS));

            li_element.appendChild(link_element);
            sidemenu.appendChild(li_element);

            // Insert link for every bot
            bot_status = data;
            $(".control-buttons [data-role=control-status]").trigger("update");
            var bots_ids = Object.keys(data);
            bots_ids.sort();

            for (let index in bots_ids) {
                var bot_id = bots_ids[index];
                li_element = document.createElement('li');
                link_element = document.createElement('a');

                link_element.innerHTML = bot_id;
                link_element.setAttribute('href', "#" + MONITOR_BOT_URL.format(bot_id));
                link_element.addEventListener('click', select_bot_func(bot_id));

                li_element.appendChild(link_element);
                sidemenu.appendChild(li_element);
            }
        })
        .fail(ajax_fail_callback('Error loading botnet status'));



$(document).ready(popState);
window.addEventListener("popstate", popState);
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('log-level-indicator').addEventListener('change', load_bot_log);

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
        let msg;
        if ($("[data-role=inject]", $insp).prop("checked")) {
            if (!$("#message-playground").val()) {
                show_error("Can't inject message from above – you didn't write any message");
                $("#message-playground").focus();
                return false;
            }
            msg = $("#message-playground").val();
        }
        let dry = $("[data-role=dry]", $insp).prop("checked");
        let show = $("[data-role=show-sent]", $insp).prop("checked");
        run_command("process" + (show ? " --show-sent" : "") + (dry ? " --dryrun" : "") + (msg ? " --msg" : ""), "process", msg, dry, show);
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
function run_command(display_cmd, cmd, msg = "", dry = false, show = false) {
    var bot_id = getUrlParameter('bot_id') || ALL_BOTS;
    $("#command-show").show().html("{0} run {1} {2} {3}".format(CONTROLLER_CMD, bot_id, display_cmd, msg ? "'" + msg.replace("'", "'\\''") + "'" : ""));//XX dry are not syntax-correct
    $("#run-log").val("loading...");
    $('#inspect-panel-title').addClass('waiting');
    let call = $.ajax({
        method: "post",
        data: {"msg": msg},
        url: MANAGEMENT_SCRIPT + '?scope=run&bot={0}&cmd={1}&dry={2}&show={3}'.format(bot_id, cmd, dry, show),
    }).done(function (data) {
        // Parses the received data to message part and to log-only part
        let logs = [];
        let msg = [];
        let logging = logs;
        for (let line of data.split("\n")) {
            if (logging === logs) {
                if (line === "{") {
                    logging = msg;
                }
            } else {
                if (line === "}") {
                    msg.push(line);
                    logging = logs;
                    continue;
                }
            }

            logging.push(line); //write either to logs or msgs
        }
        if (msg.length) { // we won't rewrite an old message if nothing came
            $("#message-playground").attr("rows", msg.length).val(msg.join("\n"));
        }
        $("#run-log").attr("rows", logs.length).val(logs.join("\n"));
    }).fail(ajax_fail_callback('Error getting message'))
            .always(() => {
                $('#inspect-panel-title').removeClass('waiting');
                $("#run-log").data("call", null);
            });

    // informate user if there is a lag
    $("#run-log").data("call", call);
    setTimeout(() => {
        if ($("#run-log").data("call") === call) {
            $("#run-log").val("loading... or timeouting...");
        }
    }, 3000);
}


/**
 * Select correct bot when browsing in history or coming from an external link etc.
 */
function popState() {
    $("#run-log").val("");
    var bot_id = getUrlParameter('bot_id') || ALL_BOTS;
    if (typeof (bot_id) !== 'undefined') {
        //window.history.replaceState(null, null, MONITOR_BOT_URL.format(bot_id));
        select_bot(bot_id);
    } else {
        select_bot(ALL_BOTS);
    }
}
