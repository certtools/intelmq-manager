var BOT_STATUS_DEFINITION = BOT_STATUS_DEFINITION || {};
var BOT_CLASS_DEFINITION = BOT_CLASS_DEFINITION || {};
var bot_status = bot_status || {};
var botnet_status = botnet_status || {};

$('#bot-table').dataTable({
    lengthMenu: [[5, 10, 25, -1], [5, 10, 25, "All"]],
    pageLength: -1,
    columns: [
        {"data": "bot_id"},
        {"data": "bot_status"},
        {"data": "actions"}
    ],
    createdRow: function (row, data) {
        $("td:eq(2)", row).append(generate_control_buttons(data["bot_id"], false, refresh_status));
    }
});

window.onresize = function () {
    $('#bot-table').dataTable().fnAdjustColumnSizing();
    $('#bot-table').dataTable().fnDraw();
};

var $bt = $('#bot-table');
$(function () {
    load_file(RUNTIME_FILE, (data) => {
        bot_definition = data;
    });

    $bt.dataTable().fnClearTable();

    // generate control buttons for every panel
    $("#botnet-panels [data-botnet-group]").each(function () {
        $(".panel-body .panel-div", $(this)).after(generate_control_buttons(false, $(this).attr("data-botnet-group"), refresh_status, true));
    });

    // fetch info from server
    $('#botnet-panels [data-botnet-group=botnet] [data-url=status]').click();

    //
    $bt.on("click", 'tr td:first-child', function (event) {
        return click_link(MONITOR_BOT_URL.format(event.target.innerText), event);
    });
});

function refresh_status() {
    // Refresh bot table
    let redraw_table = false;
    for (let bot_id in bot_status) {
        let class_ = BOT_CLASS_DEFINITION[bot_status[bot_id]];
        let status = bot_status[bot_id];
        if ((el = $("tr[data-bot-id={0}]".format(bot_id), $bt)).length) {
            // row exist, just update the status
            if (!el.hasClass(class_)) {// class of this bot changes
                for (let state of Object.values(BOT_CLASS_DEFINITION)) { // remove any other status-class
                    el.removeClass(state);
                }
                el.addClass(class_);
                $("td:eq(1)", el).text(status);
            }
        } else {
            bot_row = {
                'bot_id': bot_id,
                'bot_status': status,
                'actions': "",
                'DT_RowClass': class_,
                "DT_RowAttr": {"data-bot-id": bot_id}
            };
            $bt.dataTable().api().row.add(bot_row);
            redraw_table = true;
        }


    }
    if (redraw_table) {
        $bt.dataTable().fnAdjustColumnSizing();
        $bt.dataTable().fnDraw();
        $('#botnet-panels [data-botnet-group]').show(); // showed on the first run
    }


    // Refresh botnet panels
    var atLeastOneStopped = {};
    var atLeastOneRunning = {};
    for (let bot_id in bot_status) { // analyze all bots status
        if (bot_status[bot_id] === BOT_STATUS_DEFINITION.stopped) {
            atLeastOneStopped["botnet"] = atLeastOneStopped[GROUPNAME_TO_GROUP[bot_definition[bot_id].group]] = true;
        } else if (bot_status[bot_id] === BOT_STATUS_DEFINITION.running) {
            atLeastOneRunning["botnet"] = atLeastOneRunning[GROUPNAME_TO_GROUP[bot_definition[bot_id].group]] = true;
        }
    }
    get_group_status = function (stopped, running) {
        if (stopped && running) {
            return BOT_STATUS_DEFINITION.incomplete;
        } else if (stopped && !running) {
            return BOT_STATUS_DEFINITION.stopped;
        } else if (!stopped && running) {
            return BOT_STATUS_DEFINITION.running;
        } else {
            return BOT_STATUS_DEFINITION.stopped;
        }
    };
    // for each botnet panel
    $("#botnet-panels [data-botnet-group]").each(function () {
        let botnet = $(this).attr("data-botnet-group");
        botnet_status[botnet] = get_group_status(atLeastOneStopped[botnet], atLeastOneRunning[botnet]);
        $('[data-role=control-status]', this).trigger("update");

        // due to esthetics, fetch the status-info to the line above
        if (($el = $(".control-buttons [data-role=control-status]", $(this)).clone())) {
            if ($el.text()) {
                $(".panel-div", $(this)).html("Status: " + ($el[0].outerHTML || '<span data-role="botnet-status" class="bg-warning">Unknown</span>'));
            }
        }
    });
}