<!--
SPDX-FileCopyrightText: 2020 IntelMQ Team

SPDX-License-Identifier: AGPL-3.0-or-later
-->

NEWS
====

See the changelog for a full list of changes.


2.3.0 (unreleased)
------------------


2.2.1 (2020-07-30)
------------------
This IntelMQ Manager version requires IntelMQ >= 2.2.1.

2.2.0 (2020-06-23)
------------------
This IntelMQ Manager version requires IntelMQ >= 2.2.0.

### Paths
The paths for configuration files are queried from the IntelMQ Core.
Thus, the environment variables `INTELMQ_ROOT_DIR` and `INTELMQ_PATHS_NO_OPT`/`INTELMQ_PATHS_OPT` are now respected.


2.1.1 (2020-04-27)
------------------

### Security
* **Never ever run intelmq-manager on a public webserver without SSL and proper authentication**.
* Bernhard Herzog (Intevation) discovered that the backend incorrectly handled messages given by user-input in the "send" functionality of the Inspect-tool of the Monitor component. An attacker with access to the IntelMQ Manager could possibly use this issue to execute arbitrary code with the privileges of the webserver (CVE-2020-11016).
* Use IntelMQ Manager only from a browser that can only access internal, trusted sites. (Because CSRF development is under way, see [#111](github.com/certtools/intelmq/issues/111)).

### Configuration
The environment variable name was corrected from `INTELMQ_MANGER_CONTROLLER_CMD` to `INTELMQ_MANGAER_CONTROLLER_CMD` you might need to adapt your configuration.
The old name will be available until version 3.0.


2.1.0 (2019-10-15)
------------------
The environment variable name was corrected from `INTELMQ_MANGER_CONTROLER_CMD` to `INTELMQ_MANGER_CONTROLLER_CMD` you might need to adapt your configuration.


2.0.0 (2019-05-22)
------------------

No changes are required by administrators.


1.1.0 (2018-11-12)
------------------

No changes are required by administrators.

1.0.1 (2018-09-24)
------------------

No changes are required by administrators.


1.0.0 (2018-04-23)
------------------

No changes are required by administrators.


0.3.1
-----

No changes are required by administrators.


0.3
---
* The IntelMQ Manager is now capable of saving the positions of bots.
  You need to create the file `/opt/intelmq/etc/manager/positions.conf` and
  allow the webserver process to write to it, e.g.:
  ```bash
  mkdir /opt/intelmq/etc/manager/
  touch /opt/intelmq/etc/manager/positions.conf
  chgrp www-data /opt/intelmq/etc/manager/positions.conf
  chmod g+w /opt/intelmq/etc/manager/positions.conf
  ```
