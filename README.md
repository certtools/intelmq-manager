![IntelMQ](http://s28.postimg.org/r2av18a3x/Logo_Intel_MQ.png)

**IntelMQ Manager** is a graphical interface to manage configurations for the [IntelMQ](https://github.com/certtools/intelmq) framework.
A IntelMQ configuration is a set of config files which describe which bots and processing steps should be run in which order. It is similar to describing the dataflow in [dataflow oriented](https://en.wikipedia.org/wiki/Dataflow_programming) languages.
**IntelMQ Manager** is therefore a intuitive tool to allow non-programmers to specify the data flow in IntelMQ.

## How to Install

See [INSTALL](https://github.com/certtools/intelmq-manager/blob/master/docs/INSTALL.md).

## Screenshots

#### Pipeline
This interface lets you visually configure the whole IntelMQ pipeline and the parameters of every single bot.
You will be able to see the pipeline in a graph-like visualisation similar to the following screenshot (click to enlarge):

![Main Interface](docs/screenshots/configuration_load.png?raw=true "Main Interface")

#### Bots Configuration
When you add a node or edit one you'll be presented with a form with the available parameters for a bot. There you can easily change the parameters as show in the screenshot:

![Parameter editing](docs/screenshots/edit_node.png?raw=true "Parameter editing")

After editing the bots' configuration and pipeline, simply click "Save Configuration" to automatically write the changes to the correct files.  The configurations are now ready to be deployed.


## Licence

This software is licensed under [GNU Affero General Public License version 3](https://github.com/certtools/intelmq-manager/blob/master/LICENSE)
