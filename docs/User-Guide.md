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
