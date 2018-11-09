var CORE_FIELDS = 5;

var ACCEPTED_NEIGHBORS = {
    'Collector': ['Parser', 'Output'],
    'Parser': ['Expert', 'Output'],
    'Expert': ['Expert', 'Output'],
    'Output': []
}

var GROUP_LEVELS = {
    'Collector': 0,
    'Parser': 1,
    'Expert': 2,
    'Output': 3
};
var GROUPNAME_TO_GROUP = {
    'Collector': "collectors",
    'Parser': "parsers",
    'Expert': "experts",
    'Output': "outputs"
};

/**
 * 1st value is default color of running bot, latter of a stopped bot
 */
var GROUP_COLORS = {
    'Collector': ['#ff6666', '#cc6666'],
    'Parser': ['#66ff66', '#66cc66'],
    'Expert': ['#66a3ff', '#66a3aa'],
    'Output': ['#ffff66', '#cccc66']
}

var LEVEL_CLASS = {
    'DEBUG': 'success',
    'INFO': 'info',
    'WARNING': 'warning',
    'ERROR': 'danger',
    'CRITICAL': 'danger'
}

var STARTUP_KEYS = ['group', 'name', 'module', 'description', 'enabled', 'run_mode'];

var BOT_ID_REGEX = /^[0-9a-zA-Z.-]+$/;
var PARAM_KEY_REGEX = /^[0-9a-zA-Z._-]+$/;

var ROOT = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);

var LOAD_CONFIG_SCRIPT = ROOT + "php/load_configs.php";
var MANAGEMENT_SCRIPT = ROOT + "php/controller.php";

var BOTS_FILE = LOAD_CONFIG_SCRIPT + "?file=bots";
var DEFAULTS_FILE = LOAD_CONFIG_SCRIPT + "?file=defaults";
var HARMONIZATION_FILE = LOAD_CONFIG_SCRIPT + "?file=harmonization";
var PIPELINE_FILE = LOAD_CONFIG_SCRIPT + "?file=pipeline";
var RUNTIME_FILE = LOAD_CONFIG_SCRIPT + "?file=runtime";
var SYSTEM_FILE = LOAD_CONFIG_SCRIPT + "?file=system";
var POSITIONS_FILE = LOAD_CONFIG_SCRIPT + "?file=positions";

var RELOAD_QUEUES_EVERY = 1; /* 2 seconds */
var RELOAD_LOGS_EVERY = 300; /* 300 seconds */
var LOAD_X_LOG_LINES = 30;

var MESSAGE_LENGTH = 200;

var MONITOR_BOT_URL = "?page=monitor&bot_id={0}";

var page_is_exiting = false;

$(window).on('unload', function () {
    page_is_exiting = true;
});


function sortObjectByPropertyName(obj) {
    return Object.keys(obj).sort().reduce((c, d) => (c[d] = obj[d], c), {});
}

// String formatting function usage "string {0}".format("1") => "string 1"
if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] !== 'undefined'
                    ? args[number]
                    : match
                    ;
        });
    };
}

/*
 * error reporting
 */
$(function () {
    var closeFn = function () {
        $("#log-window").hide();
        $("#log-window .contents").html("");
    };

    $("#log-window")
            .dblclick(closeFn).click(function () {
        $(this).toggleClass("extended");
    });
    $("#log-window [role=close]").click(closeFn);
});
function show_error(string) {
    let d = new Date();
    let time = new Date().toLocaleTimeString().replace(/:\d+ /, ' ');
    $lw = $("#log-window .contents");
    $el = $("<p><span>{0}</span> <span></span> <span>{1}</span></p>".format(time, string));
    var found = false;
    $("p", $lw).each(function () {
        if ($("span:eq(2)", $(this)).text() === $("span:eq(2)", $el).text()) {
            // we've seen this message before
            found = true;
            // put it in front of the other errors
            $(this).prependTo($lw);
            //blink
            $("span:eq(0)", $(this)).text(time).stop().animate({opacity: 0.1}, 100, function () {
                $(this).animate({opacity: 1}, 100);
            });
            // increment 'seen' counter
            let counter = parseInt($("span:eq(1)", $(this)).text()) || 1;
            $("span:eq(1)", $(this)).text(counter + 1 + "×");
            return false;
        }
    });
    if (!found) {
        $("#log-window").show().removeClass("extended").find(".contents").prepend($el);
    }
    /*if(!page_is_exiting) {
     alert(string);
     }*/
}


function ajax_fail_callback(str) {
    return function (jqXHR, textStatus, message) {
        if (textStatus === "timeout") {
            // this is just a timeout, no other info needed
            show_error(str + " timeout");
            return;
        }
        if (jqXHR.status === 0) { // page refreshed before ajax finished
            return;
        }
        // include full report but truncate the length to 200 chars
        // (since '.' is not matching newline characters, we're using '[\s\S]' so that even multiline string is shortened)
        show_error("{0}: <b>{1}</b> {2}".format(str, jqXHR.responseText.replace(/^(.{200})[\s\S]+/, "$1..."), message));
    };
}


/**
 * Handy interval class, waiting till AJAX request finishes (won't flood server if there is a lag).
 */
class Interval {
    /**
     *  Class for managing intervals.
     *  Auto-delaying/boosting depending on server lag.
     *  Faking intervals by timeouts.
     *
     * @param {type} fn
     * @param {type} delay
     * @param {bool} blocking If true, the fn is an AJAX call. The fn will not be called again unless it calls `this.blocking = false` when AJAX is finished.
     *      You may wont to include `.always(() => {this.blocking = false;})` after the AJAX call. (In 'this' should be instance of the Interval object.)
     *
     *      (Note that we preferred that.blocking setter over method unblock() because interval function
     *      can be called from other sources than this class (ex: at first run) and a non-existent method would pose a problem.)
     * @returns {Interval}
     */
    constructor(fn, delay, ajax_wait) {
        this.fn = fn;
        this.delay = this._delay = delay;
        this._delayed = function () {
            this.time1 = +new Date();
            this.fn.call(this);
            if (ajax_wait !== true && this.running) {
                this.start();
            }
        }.bind(this);
        this.start();
    }
    start() {
        this.running = true;
        this.instance = setTimeout(this._delayed, this._delay);
        return this;
    }
    stop() {
        clearTimeout(this.instance);
        this.running = false;
        return this;
    }

    set blocking(b) {
        if (b === false) {
            let rtt = +new Date() - this.time1;
            if (rtt > this._delay / 3) {
                if (this._delay < this.delay * 10) {
                    this._delay += 100;
                }
            } else if (rtt < this._delay / 4 && this._delay >= this.delay) {
                this._delay -= 100;
            }
            if (this.running) {
                this.start();
            }
        }
    }
}

/**
 * JS-click on a link that supports Ctrl+clicking for opening in a new tab.
 * @param {string} url
 * @returns {Boolean} False so that js-handled click is not followed further by the browser.
 */
function click_link(url, event) {
    if (event && event.ctrlKey) { // we want open a new tab
        var win = window.open(url, '_blank');
        if (win) {
            win.focus();
        } else { // popups disabled
            window.location = url;
        }
    } else {
        window.location = url;
    }
    return false;
}


/**
 * Control buttons to start/stop/... a bot, group or whole botnet
 */
var BOT_CLASS_DEFINITION = {
    'starting': 'warning',
    'running': 'success',
    'stopping': 'warning',
    'stopped': 'danger',
    'reloading': 'warning',
    'restarting': 'warning',
    'incomplete': 'warning',
    'error': 'danger'
};
var BOT_STATUS_DEFINITION = {
    'starting': 'starting',
    'running': 'running',
    'stopping': 'stopping',
    'stopped': 'stopped',
    'reloading': 'reloading',
    'restarting': 'restarting',
    'incomplete': 'incomplete',
    'error': 'error'
};

var botnet_status = {}; // {group | true (for whole botnet) : BOT_STATUS_DEFINITION}
var bot_status = {}; // {bot-id : BOT_STATUS_DEFINITION}
var bot_status_previous = {};
var bot_definition = {};// {bot-id : runtime information (group, ...)}; only management.js uses this in time

$(document).on("click", ".control-buttons button", function () {
    let bot = $(this).parent().attr("data-bot-id");
    let botnet = $(this).parent().attr("data-botnet");
    let callback_button = $(this).parent().data("callback-button");
    $('#botnet-panels [data-botnet-group=botnet] h4').addClass('waiting'); // XXX panel
    $(this).closest(".panel").find("h4").addClass("waiting");
    let url;
    if (bot) {
        bot_status[bot] = $(this).attr("data-status-definition");
        url = '{0}?scope=bot&action={1}&id={2}'.format(MANAGEMENT_SCRIPT, $(this).attr("data-url"), bot);
    } else {
        botnet_status[botnet] = $(this).attr("data-status-definition");
        url = '{0}?scope=botnet&action={1}&group={2}'.format(MANAGEMENT_SCRIPT, $(this).attr("data-url"), botnet);
    }
    callback_button();
    $(this).siblings("[data-role=control-status]").trigger("update");

    $.getJSON(url)
            .done((data) => {
                if (bot) {
                    // only restarting action returns an array of two values, the latter is important; otherwise, this is a string
                    bot_status[bot] = Array.isArray(data) ? data.slice(-1)[0] : data;
                } else {
                    // we received a {bot => status} object
                    Object.assign(bot_status, data); // merge to current list
                }
            })
            .fail(function () {
                ajax_fail_callback('Error {0} bot{1}'.format(bot_status[bot] || botnet_status[botnet], (!bot ? "net" : ""))).apply(null, arguments);
                bot_status[bot] = BOT_STATUS_DEFINITION.error;
            }).always(() => {
        $(this).siblings("[data-role=control-status]").trigger("update");
        $('#botnet-panels [data-botnet-group=botnet] h4').removeClass('waiting');
        $(this).closest(".panel").find("h4").removeClass("waiting");
        callback_button(bot);
    });
});
/**
 * Public method to include control buttons to DOM.
 * @param {string} bot id
 * @param {string} botnet Manipulate the whole botnet or a group. Possible values: "botnet", "collectors", "parsers", ... Parameter bot_id should be null.
 * @param {fn} This function is called when a (start or other) button gets clicked AND when launched ajax gets completed. Receives bot-id parameter.
 * @param {bool} status_info If true, dynamic word containing current status is inserted.
 * @returns {$jQuery}
 */
function generate_control_buttons(bot, botnet = null, callback_button = null, status_info = false) {
    $el = $("#common-templates .control-buttons").clone().data("callback-button", callback_button || (() => {
    }));
    if (bot) {
        $el.attr("data-bot-id", bot);
        $el.attr("data-botnet", "botnet");
    } else {
        $el.attr("data-botnet", botnet);
    }
    if (status_info) {
        $("<span/>", {"data-role": "control-status"}).bind("update", function () {
            let bot = $(this).closest(".control-buttons").attr("data-bot-id");
            let botnet = $(this).closest(".control-buttons").attr("data-botnet");
            let status = bot ? bot_status[bot] : botnet_status[botnet];
            $(this).text(status).removeClass().addClass("bg-{0}".format(BOT_CLASS_DEFINITION[status]));
        }).prependTo($el).trigger("update");
    }
    return $el;
}

/**
 * Reads the parameter from URL
 */
function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)), sURLVariables = sPageURL.split('&'), sParameterName, i;
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
}