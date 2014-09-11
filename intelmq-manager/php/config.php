<?php
    
    $FILES = array(
        'bots' => '/etc/intelmq/BOTS',
        'runtime' => '/etc/intelmq/runtime.conf',
        'startup' => '/etc/intelmq/startup.conf',
        'pipeline' => '/etc/intelmq/pipeline.conf'
    );
        
    /* Uncomment this if you used the RedHat-based installation guide */
    $CONTROLLER = "scl enable python27 'intelmqctl %s >/tmp/output 2>/tmp/output.err'; cat /tmp/output";
    
    /* Uncomment this if you used the Debian-based installation guide */
    //$CONTROLLER = "intelmqctl %s";
    
    $BOT_CONFIGS_REJECT_REGEX = '/[^[:print:]\n\r\t]/';
    $BOT_ID_REJECT_REGEX = '/[^A-Za-z0-9.-]/';
?>
