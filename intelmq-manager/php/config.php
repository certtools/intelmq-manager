<?php
    
    $FILES = array(
        'bots' => '/etc/intelmq/BOTS',
        'runtime' => '/etc/intelmq/runtime.conf',
        'startup' => '/etc/intelmq/startup.conf',
        'pipeline' => '/etc/intelmq/pipeline.conf'
    );
        
    /* Uncomment this if you used the RedHat-based installation guide */
    $CONTROLLER = "scl enable python27 'intelmqctl %s'"
    
    /* Uncomment this if you used the Debian-based installation guide */
    //$CONTROLLER = "intelmqctl %s"
    
?>
