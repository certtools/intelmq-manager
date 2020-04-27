NEWS
====

See the changelog for a full list of changes.

2.1.1 (unreleased)
------------------
The environment variable name was corrected from `INTELMQ_MANGER_CONTROLLER_CMD` to `INTELMQ_MANGAER_CONTROLLER_CMD` you might need to adapt your configuration.
The old name will be available until version 3.0.

Use IntelMQ Manager only from a browser that can only access internal, trusted sites. (Because CSRF development is under way, see [#111](github.com/certtools/intelmq/issues/111)).

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
