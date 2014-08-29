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

var STARTUP_KEYS = ['group', 'name', 'module', 'description'];

var BOT_ID_REGEX = /^[0-9a-zA-Z-]+$/;

var BOTS_FILE = "http://192.168.56.160/php/load_configs.php?file=bots";
var RUNTIME_FILE = "http://192.168.56.160/php/load_configs.php?file=runtime";
var STARTUP_FILE = "http://192.168.56.160/php/load_configs.php?file=startup";
var PIPELINE_FILE = "http://192.168.56.160/php/load_configs.php?file=pipeline";
