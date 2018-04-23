<?php

    $FILES = array(
        'bots' 		=> '/opt/intelmq/etc/BOTS',
        'defaults' 	=> '/opt/intelmq/etc/defaults.conf',
        'harmonization' => '/opt/intelmq/etc/harmonization.conf',
        'pipeline' 	=> '/opt/intelmq/etc/pipeline.conf',
        'runtime' 	=> '/opt/intelmq/etc/runtime.conf',
        'system' 	=> '/opt/intelmq/etc/system.conf',
        'positions' => '/opt/intelmq/etc/manager/positions.conf',
    );
    if(!($c = getenv("INTELMQ_MANGER_CONTROLER_CMD"))) {
        $c = "sudo -u intelmq /usr/local/bin/intelmqctl";
    }
    $CONTROLLER = $c." --type json %s";
    
    $BOT_CONFIGS_REJECT_REGEX = '/[^[:print:]\n\r\t]/';
    $BOT_ID_REJECT_REGEX = '/[^A-Za-z0-9.-]/';
    $VERSION = "1.0.2.alpha1";
?>
