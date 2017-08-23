NEWS
====

See the changelog for a full list of changes.

0.2.2 (unreleased)
------------------
* The IntelMQ Manager is now capable of saving the positions of bots.
  You need to create the file `/opt/intelmq/etc/manager/positions.conf` and
  allow the webserver process to write to it, e.g.:
  ```bash
  mkdir /opt/intelmq/etc/manager/
  touch /opt/intelmq/etc/manager/positions.conf
  chgrp www-data /opt/intelmq/etc/manager/positions.conf
  chmod g+w /opt/intelmq/etc/manager/positions.conf
  ```
