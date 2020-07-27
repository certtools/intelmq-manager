# User-Guide

## Keyboard Shortcuts

Any underscored letter denotes access key shortcut. The needed shortcut-keyboard is different per Browser:
* Firefox: <kbd>Alt + Shift + letter</kbd>
* Chrome & Chromium: <kbd>Alt + letter</kbd>

## Environment variable `INTELMQ_MANAGER_CONTROLLER_CMD`

Using the environment variable `INTELMQ_MANAGER_CONTROLLER_CMD` a custom command for the management tool can be specified. For example in Apache:

```
SetEnv INTELMQ_MANAGER_CONTROLLER_CMD "sudo -u intelmq /usr/bin/intelmqctl"
```

## Paths

The IntelMQ Manager queries the configuration file paths and directory names from `intelmqctl` and therefore any global environment variables (if set) are effective in the Manager too. The interface for this query is `intelmqctl debug --get-paths`, the result is also shown in the `?page=about` page of your IntelMQ Manager installation.

For more information on the ability to adapt paths, have a look at the [User Guide of IntelMQ itself](https://github.com/certtools/intelmq/blob/master/docs/User-Guide.md#opt-and-lsb-paths).
