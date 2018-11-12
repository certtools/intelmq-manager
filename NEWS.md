NEWS
====

See the changelog for a full list of changes.

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
