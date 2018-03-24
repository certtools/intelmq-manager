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
}

var GROUP_COLORS = {
    'Collector': '#ff6666',
    'Parser': '#66ff66',
    'Expert': '#66a3ff',
    'Output': '#ffff66'
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

var ROOT = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);

var LOAD_CONFIG_SCRIPT = ROOT + "php/load_configs.php";
var MANAGEMENT_SCRIPT = ROOT + "php/controller.php"

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
    $("#log-window")
            .dblclick(function () {
                $(this).hide();
                $(this).html("");
            }).click(function () {
        $(this).toggleClass("extended");
    });
});
function show_error(string) {
    let d = new Date();
    let time = new Date().toLocaleTimeString().replace(/:\d+ /, ' ');
    $lw = $("#log-window");
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
        $("#log-window").show().prepend($el);
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
        show_error("{0}: <b>{1}</b> {2}".format(str, jqXHR.responseText.replace(/^(.{200}).+/, "$1..."), message));
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
     *      You may wont to include
     *      `var that = this;` before AJAX calling and `.always(function () {that.blocking = false;})` after
     *
     *      (Note that we preferred that.blocking setter over method unblock() because interval function
     *      can be called from other sources than this class, non-existent method would pose a problem.)
     * @returns {Interval}
     */
    constructor(fn, delay, ajax_wait) {
        this.fn = fn;
        this.delay = this._delay = delay;
        this._blocking = ajax_wait ? false : null;
        this._delayed = function () {
            if (!this._blocking) {
                if (this._blocking !== null) {
                    this._blocking = true;
                    this.time1 = +new Date();
                }
                this.fn.call(this);
            } else {
                console.log("BLONGIN!");
            }
            if (this._blocking === null) {
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
        setTimeout(this.instance);
        this.running = false;
        return this;

    }

    get blocking() {
        return this._blocking;
    }

    set blocking(b) {
        this._blocking = b;
        if (b === false) {
            let rtt = +new Date() - this.time1;
            if (rtt > this._delay / 3) {
                if (this._delay < this.delay * 10) {
                    this._delay += 100;
                }
            } else if (rtt < this._delay / 4 && this._delay >= this.delay) {
                this._delay -= 100;
            }
            this.start();
        }
    }
}