<!--
SPDX-FileCopyrightText: 2020 IntelMQ Team

SPDX-License-Identifier: AGPL-3.0-or-later
-->

## Keyboard Shortcuts

Any underscored letter denotes access key shortcut. The needed shortcut-keyboard is different per Browser:
* Firefox: <kbd>Alt + Shift + letter</kbd>
* Chrome & Chromium: <kbd>Alt + letter</kbd>

## Configuration Paths

The IntelMQ Manager queries the configuration file paths and directory names from `intelmqctl` and therefore any global environment variables (if set) are effective in the Manager too.
The interface for this query is `intelmqctl debug --get-paths`, the result is also shown in the `/about.html` page of your IntelMQ Manager installation.

For more information on the ability to adapt paths, have a look at the [User Guide of IntelMQ itself](https://github.com/certtools/intelmq/blob/master/docs/User-Guide.md#opt-and-lsb-paths).

## Configuration page

### Named queues / paths

With the IntelMQ Manager you can set the name of certain paths by double-clicking on the line which connects two bots:
![enter path](screenshots/configuration-path-form.png)
The name is then displayed along the edge:
![shown path name](screenshots/configuration-path-set.png)
