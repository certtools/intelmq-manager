var CORE_FIELDS = 5;

var ACCEPTED_NEIGHBORS = {
    'Collector': ['Parser'],
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
    'Collector': '#FF0000',
    'Parser': '#00FF00',
    'Expert': '#0000FF',
    'Output': '#FFFF00'    
}

var LEVEL_CLASS = {
    'DEBUG': 'success',
    'INFO': 'info',
    'WARNING': 'warning',
    'ERROR': 'danger',
    'CRITICAL': 'danger'
}

var STARTUP_KEYS = ['group', 'name', 'module', 'description'];

var BOT_ID_REGEX = /^[0-9a-zA-Z-]+$/;

var ROOT = window.location.href.substring(0,window.location.href.lastIndexOf('/')+1);

var LOAD_CONFIG_SCRIPT = ROOT + "php/load_configs.php";
var MANAGEMENT_SCRIPT = ROOT + "php/controller.php"

var BOTS_FILE = LOAD_CONFIG_SCRIPT + "?file=bots";
var RUNTIME_FILE = LOAD_CONFIG_SCRIPT + "?file=runtime";
var STARTUP_FILE = LOAD_CONFIG_SCRIPT + "?file=startup";
var PIPELINE_FILE = LOAD_CONFIG_SCRIPT + "?file=pipeline";

var RELOAD_QUEUES_EVERY = 1; /* 2 seconds */
var RELOAD_LOGS_EVERY = 300; /* 300 seconds */
var LOAD_X_LOG_LINES = 30;

var MESSAGE_LENGTH = 200;