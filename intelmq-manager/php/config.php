<?php
    $backwardscompat = getenv("INTELMQ_MANGER_CONTROLLER_CMD");
    $controller = getenv("INTELMQ_MANAGER_CONTROLLER_CMD");
    if(!($c = $controller ? $controller : $backwardscompat)) {
        $c = "sudo -u intelmq /usr/local/bin/intelmqctl";
    }

    // to be displayed so that user can replicate
    $CONTROLLER_REPLICABLE ="sudo -u " . exec('whoami') . " " ; // seen when an error occurs
    $CONTROLLER_CMD = $CONTROLLER_REPLICABLE . $c; // seen in monitor

    $CONTROLLER_JSON = $c ." --type json %s";
    $CONTROLLER = $c . " %s";

    $BOT_CONFIGS_REJECT_REGEX = '/[^[:print:]\n\r\t]/';
    $BOT_ID_REJECT_REGEX = '/[^A-Za-z0-9.-]/';
    $VERSION = "2.2.0";

    $ALLOWED_PATH = "/opt/intelmq/var/lib/bots/"; // PHP is allowed to fetch the config files from the current location in order to display bot configurations.
    $FILESIZE_THRESHOLD = 2000; // config files under this size gets loaded automatically; otherwise a link is generated

    $FILES = array(
        'bots' 		=> '/opt/intelmq/etc/BOTS',
        'defaults' 	=> '/opt/intelmq/etc/defaults.conf',
        'harmonization' => '/opt/intelmq/etc/harmonization.conf',
        'pipeline' 	=> '/opt/intelmq/etc/pipeline.conf',
        'runtime' 	=> '/opt/intelmq/etc/runtime.conf',
        'system' 	=> '/opt/intelmq/etc/system.conf',
        'positions' => '/opt/intelmq/etc/manager/positions.conf',
    );
    # get paths from intelmqctl directly if it works
    $proc = proc_open($c . "--type json debug --get-paths", [
        1 => ['pipe','w'],
        2 => ['pipe','w'],
    ], $pipes);
    $paths_stdout = stream_get_contents($pipes[1]);
    fclose($pipes[1]);
    $paths_stderr = stream_get_contents($pipes[2]);
    fclose($pipes[2]);
    $paths_status = proc_close($proc);
    if ($paths_status == 0) {
        $paths_output = json_decode($paths_stdout);
        $FILES['bots'] = $output['BOTS_FILE'];
        $FILES['defaults'] = $output['DEFAULTS_CONF_FILE'];
        $FILES['harmonization'] = $output['HARMONIZATION_CONF_FILE'];
        $FILES['pipeline'] = $output['PIPELINE_CONF_FILE'];
        $FILES['runtime'] = $output['RUNTIME_CONF_FILE'];
        $FILES['system'] = $output['SYSTEM_CONF_FILE'];
        $FILES['positions'] = $output['CONFIG_DIR'] . "/manager/positions.conf";
    }
?>
