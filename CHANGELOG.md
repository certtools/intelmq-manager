CHANGELOG
=========

0.4.0 (unreleased)
------------------
### Backend
* Set content type correctly for JSON data in configuration loading (#112)

### Configuration
* Fixed handling of special parameter `run_mode` (#150)
* Intelmqctl controller may be set via an env variable `INTELMQ_MANGER_CONTROLER_CMD`

### Documentation
* Note on header Content-Security-Policy (#113)
* Note on security considerations in Readme to avoid misunderstandings
* Remove compatibility warning from README

### Third-party libraries
* reverted update jQuery to 3.2.1
* reverted update metisMenu to 2.7.0

### Licenses
* Licenses of used and included software is now inventarized and properly declared in LICENSES/ (#134)

0.3.1 (2017-09-26)
------------------
### Configuration
* Fixed validation on files before saving them, this has rejected valid data

0.3 (2017-09-25)
----------------
* Partly support for CentOS/RHEL 7 (#55, #103)
* Note on security considerations in Readme to avoid misunderstandings
* Show versions of intelmq and intelmq manager on about page
* Update vis.js to current version
* update jQuery to 3.2.1
* update metisMenu to 2.7.0

### Configuration
* interface for defaults.conf (#45)
* drag&drop (#105, #41)
* fix #96
* save buttons starts blinking after changes (#41)
* Allow redrawing of botnet on demand
* Save/load position of bots in/from /opt/intelmq/etc/manager/positions.conf
  File needs to be writeable
* parameters from defaults are shown for new bots (#107)
* parameters are grouped by type: generic, runtime, defaults
* better feedback on errors with backend (#69, #99)
* pressing ESC in forms equals to pressing the cancel button
* Edit node window is now much bigger
* pressing enter in 'add key' window equals to pressing ok button

### Management
* Reload and restart have been added as actions on bots and the whole botnet (#114)
* A click on the bot name opens the monitor page of the bot

### Monitor
* clearing queues is possible in general and specific view for all queues (#54)

### Backend
* Fix regex checks on bot ids and log line number in controller, they have not been effective
* fix overflow in extended message box (#49)

0.2.1 (2017-06-20)
------------------
* Fix syntax error in pipeline.js preventing loading of configuration page

0.2.0 (2017-06-20)
------------------
* first release
