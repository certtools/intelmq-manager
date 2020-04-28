import os
import string
import pathlib
import typing
from datetime import datetime, timedelta

import hug  # type: ignore

import intelmq_manager.runctl as runctl
import intelmq_manager.files as files
import intelmq_manager.pages as pages
import intelmq_manager.config


Levels = hug.types.OneOf(["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL",
                          "ALL"])
Actions = hug.types.OneOf(["start", "stop", "restart", "reload", "status"])
Groups = hug.types.OneOf(["collectors", "parsers", "experts", "outputs",
                          "botnet"])
BotCmds = hug.types.OneOf(["get", "pop", "send", "process"])
Bool = hug.types.Mapping({"true": True, "false": False})
Pages = hug.types.OneOf(["configs", "management", "monitor", "check", "about",
                         "index"])


ID_CHARS = set(string.ascii_letters + string.digits + "-")
@hug.type(extend=hug.types.Text)
def ID(value):
    if not set(value) < ID_CHARS:
        raise ValueError("Invalid character in {!r}".format(value))
    return value


api_config : intelmq_manager.config.Config = intelmq_manager.config.Config()

runner : runctl.RunIntelMQCtl = runctl.RunIntelMQCtl(api_config.intelmq_ctl_cmd)


def load_api_config(filename : str) -> None:
    global api_config, runner
    api_config = intelmq_manager.config.load_config(filename)
    runner = runctl.RunIntelMQCtl(api_config.intelmq_ctl_cmd)


@hug.get("/botnet")
@typing.no_type_check
def botnet(action: Actions, group: Groups = None):
    return runner.botnet(action, group)


@hug.get("/bot")
@typing.no_type_check
def bot(action: Actions, id: ID):
    return runner.bot(action, id)


@hug.get("/getlog")
@typing.no_type_check
def getlog(id: ID, lines: int, level: Levels = "DEBUG"):
    return runner.log(id, lines, level)


@hug.get("/queues")
def queues():
    return runner.list("queues")


@hug.get("/queues-and-status")
def queues_and_status():
    return runner.list("queues-and-status")


@hug.get("/version")
def version():
    return runner.version()


@hug.get("/check")
def check():
    return runner.check()


@hug.get("/clear")
@typing.no_type_check
def clear(id: ID):
    return runner.clear(id)


@hug.post("/run")
@typing.no_type_check
def run(bot: str, cmd: BotCmds, show: Bool = False, dry: Bool = False,
        msg: str = ""):
    return runner.run(bot, cmd, show, dry, msg)


@hug.get("/debug")
def debug():
    return runner.debug()


@hug.get("/config")
def config(response, file: str, fetch: bool=False):
    result = files.load_file_or_directory(file, fetch)
    if result is None:
        return ["Unknown resource"]

    content_type, contents = result
    response.content_type = content_type
    return contents

@hug.post("/save", parse_body=True,
          inputs={"application/x-www-form-urlencoded": hug.input_format.text})
def save(body, file: str):
    try:
        files.save_file(file, body)
        return "success"
    except files.SaveFileException as e:
        return str(e)


@hug.get("/page", output=hug.output_format.html)
@typing.no_type_check
def page(response, page: Pages = "index"):
    return pages.render_page(page, api_config)
