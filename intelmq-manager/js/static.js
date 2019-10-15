var CORE_FIELDS = 5;

var ACCEPTED_NEIGHBORS = {
    'Collector': ['Parser', 'Expert', 'Output'],
    'Parser': ['Expert', 'Output'],
    'Expert': ['Parser', 'Expert', 'Output'],
    'Output': []
}
var CAUTIOUS_NEIGHBORS = {
    'Collector': ['Expert'],
    'Expert': ['Parser']
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

var RELOAD_QUEUES_EVERY = 1; /* 1 seconds */
var RELOAD_LOGS_EVERY = 3; /* 3 seconds */
var RELOAD_STATE_EVERY = 3; /* 3 seconds */
var LOAD_X_LOG_LINES = 30;

var MESSAGE_LENGTH = 200;

var MONITOR_BOT_URL = "?page=monitor&bot_id={0}";

var page_is_exiting = false;

var settings = {
    physics: null, // by default, physics is on depending on bot count
    live: true, // by default on
};

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
let lw_tips = new Set();
$(function () {
    let $lw = $("#log-window");
    let closeFn = function () {
        $lw.hide();
        $(".contents", $lw).html("");
        lw_tips.clear(); // no tips displayed
        return false;
    };

    $lw
        .on("click", function () { // clicking enlarges but not shrinks so that we may copy the text
            if (!$(this).hasClass("extended")) {
                $(this).toggleClass("extended");

                //$(".alert", this).prependTo($(this));

                $(document).on('keydown.close-log-window', function (event) {
                    if (event.key == "Escape") {
                        $(document).off('keydown.close-log-window');
                        $lw.removeClass("extended");
                    }
                });
            }
        });
    $("#log-window [role=close]").click(closeFn);
});

function show_error(string) {
    let d = new Date();
    let time = new Date().toLocaleTimeString().replace(/:\d+ /, ' ');
    let $lwc = $("#log-window .contents");
    let $el = $("<p><span>{0}</span> <span></span> <span>{1}</span></p>".format(time, string));
    var found = false;
    $("p", $lwc).each(function () {
        if ($("span:eq(2)", $(this)).text() === $("span:eq(2)", $el).text()) {
            // we've seen this message before
            found = true;
            // put it in front of the other errors
            // only if the error window is not expanded (so that it does not shuffle when the user read the details)
            if (!$(this).closest("#log-window").hasClass("extended")) {
                $(this).prependTo($lwc);
            }
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
        $("#log-window").show().find(".contents").prepend($el);
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

        let command = "", tip = "", report = "";
        try {
            let data = JSON.parse(jqXHR.responseText);
            report = data.message.replace(/(?:\r\n|\r|\n)/g, '<br>');
            command = " <span class='command'>{0}</span>".format(data.command);
            if (data.tip && !lw_tips.has(data.tip)) {
                // display the tip if not yet displayed on the screen
                lw_tips.add(data.tip);
                tip = " <div class='alert alert-info'>TIP: {0}</div>".format(data.tip);
            }
            if (message === "Internal Server Error") {
                message = ""; // this is expected since we generated this in PHP when an error was spot, ignore
            }
        } catch (e) {
            report = jqXHR.responseText;
        }
        if (report) {
            // include full report but truncate the length to 2000 chars
            // (since '.' is not matching newline characters, we're using '[\s\S]' so that even multiline string is shortened)
            report = " <b>{0}</b>".format(report.replace(/^(.{2000})[\s\S]+/, "$1..."));
        }
        show_error("{0}:{1}{2}{3} {4}".format(str, report, command, tip, message));
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
     *      You may want to include `.always(() => {this.blocking = false;})` after the AJAX call. (In 'this' should be instance of the Interval object.)
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
        this.stop();
        this.running = true;
        this.instance = setTimeout(this._delayed, this._delay);
        return this;
    }

    stop() {
        clearTimeout(this.instance);
        this.running = false;
        return this;
    }

    /**
     * Launch callback function now, reset and start the interval.
     * @return {Interval}
     */
    call_now() {
        this.stop();
        this._delayed();
        this.start();
        return this;
    }

    /**
     * Start if stopped or vice versa.
     * @param start If defined, true to be started or vice versa.
     */
    toggle(start = null) {
        if (start === null) {
            this.toggle(!this.running);
        } else if (start) {
            this.start();
        } else {
            this.stop();
        }
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
    'error': 'danger',
    'disabled': 'ligth',
    'unknown': 'warning'
};
var BOT_STATUS_DEFINITION = {
    'starting': 'starting',
    'running': 'running',
    'stopping': 'stopping',
    'stopped': 'stopped',
    'reloading': 'reloading',
    'restarting': 'restarting',
    'incomplete': 'incomplete',
    'error': 'error',
    'unknown': 'unknown'
};

var botnet_status = {}; // {group | true (for whole botnet) : BOT_STATUS_DEFINITION}
var bot_status = {}; // {bot-id : BOT_STATUS_DEFINITION}
var bot_status_previous = {}; // we need a shallow copy of bot_status, it's too slow to ask `app` every time
var bot_definition = {};// {bot-id : runtime information (group, ...)}; only management.js uses this in time

$(document).on("click", ".control-buttons button", function () {
    let bot = $(this).parent().attr("data-bot-id");
    let botnet = $(this).parent().attr("data-botnet-group");
    let callback_fn = $(this).parent().data("callback_fn");
    let url;
    if (bot) {
        bot_status[bot] = $(this).attr("data-status-definition");
        url = '{0}?scope=bot&action={1}&id={2}'.format(MANAGEMENT_SCRIPT, $(this).attr("data-url"), bot);
    } else {
        botnet_status[botnet] = $(this).attr("data-status-definition");
        url = '{0}?scope=botnet&action={1}&group={2}'.format(MANAGEMENT_SCRIPT, $(this).attr("data-url"), botnet);
        for (let bot_d of Object.values(bot_definition)) {
            if (bot_d.groupname === botnet) {
                bot_status[bot_d.bot_id] = $(this).attr("data-status-definition");
            }
        }

    }
    callback_fn.call(this, bot || botnet, 0);
    $(this).siblings("[data-role=control-status]").trigger("update");

    $.getJSON(url)
        .done(function (data) {
            if (bot) { // only restarting action returns an array of two values, the latter is important; otherwise, this is a string
                bot_status[bot] = Array.isArray(data) ? data.slice(-1)[0] : data;
            } else { // we received a {bot => status} object
                Object.assign(bot_status, data); // merge to current list
            }
        })
        .fail(function () {
            ajax_fail_callback('Error {0} bot{1}'.format(bot_status[bot] || botnet_status[botnet], (!bot ? "net" : ""))).apply(null, arguments);
            bot_status[bot] = BOT_STATUS_DEFINITION.error;
        }).always(() => {
        $(this).siblings("[data-role=control-status]").trigger("update");
        callback_fn.call(this, bot || botnet, 1);
    });
});

/**
 * Public method to include control buttons to DOM.
 * @param {string|null} bot id
 * @param {string|null} botnet Manipulate the whole botnet or a group. Possible values: "botnet", "collectors", "parsers", ... Parameter bot_id should be null.
 * @param {bool} status_info If true, dynamic word containing current status is inserted.
 * @param {fn} Fn (this = button clicked, bot-id|botnet, finished = 0|1)
 *              Launched when a button is clicked (finished 0) and callback after AJAX completed (finished 1).
 * @returns {$jQuery}
 */
function generate_control_buttons(bot = null, botnet = null, callback_fn = null, status_info = false) {
    let $el = $("#common-templates .control-buttons").clone()
        .data("callback_fn", callback_fn || (() => {
        }));
    if (bot) {
        $el.attr("data-bot-id", bot);
        $el.attr("data-botnet-group", bot in bot_definition ? bot_definition[bot].groupname : null); // specify group (ignore in Monitor, not needed and might not be ready)
    } else {
        $el.attr("data-botnet-group", botnet);
    }
    if (status_info) {
        $("<span/>", {"data-role": "control-status"}).bind("update", function () {
            let bot = $(this).closest(".control-buttons").attr("data-bot-id");
            let botnet = $(this).closest(".control-buttons").attr("data-botnet-group");
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

/**
 * Accesskeyfie
 * Turns visible [data-accesskey] to elements with accesskey and shows the accesskey with an underscore if possible.
 */
function accesskeyfie() {
    let seen = new Set();
    $("[data-accesskey]").attr("accesskey", ""); // reset all accesskeys. In Chrome, there might be only one accesskey 'e' on page.
    $("[data-accesskey]:visible").each(function () {
        let key = $(this).attr("data-accesskey");
        if (seen.has(key)) {
            return false; // already defined at current page state
        }
        seen.add(key);
        $(this).attr("accesskey", key);
        // add underscore to the accesskeyed letter if possible (can work badly with elements having nested DOM children)
        let t1 = $(this).text()
        let t2 = t1.replace(new RegExp(key, "i"), (match) => `<u>${match}</u>`)
        if (t1 != t2) {
            $(this).html(t2);
        }
    });
}