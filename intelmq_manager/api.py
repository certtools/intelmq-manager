import os
import string
import pathlib
import typing
from datetime import datetime, timedelta

import hug  # type: ignore

import intelmq_manager.runctl as runctl
import intelmq_manager.files as files


Levels = hug.types.OneOf(["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL",
                          "ALL"])
Actions = hug.types.OneOf(["start", "stop", "restart", "reload", "status"])
Groups = hug.types.OneOf(["collectors", "parsers", "experts", "outputs",
                          "botnet"])
BotCmds = hug.types.OneOf(["get", "pop", "send", "process"])
Bool = hug.types.Mapping({"true": True, "false": False})


ID_CHARS = set(string.ascii_letters + string.digits + "-")
@hug.type(extend=hug.types.Text)
def ID(value):
    if not set(value) < ID_CHARS:
        raise ValueError("Invalid character in {!r}".format(value))
    return value


def get_runner():
    return runctl.RunIntelMQCtl(["sudo", "-u", "intelmq",
                                 "/usr/local/bin/intelmqctl"])

@hug.get("/botnet")
@typing.no_type_check
def botnet(action: Actions, group: Groups = None):
    return get_runner().botnet(action, group)


@hug.get("/bot")
@typing.no_type_check
def bot(action: Actions, id: ID):
    return get_runner().bot(action, id)


@hug.get("/getlog")
@typing.no_type_check
def getlog(id: ID, lines: int, level: Levels = "DEBUG"):
    return get_runner().log(id, lines, level)


@hug.get("/queues")
def queues():
    return get_runner().list("queues")


@hug.get("/queues-and-status")
def queues_and_status():
    return get_runner().list("queues-and-status")


@hug.get("/version")
def version():
    return get_runner().version()


@hug.get("/check")
def check():
    return get_runner().check()


@hug.get("/clear")
@typing.no_type_check
def clear(id: ID):
    return get_runner().clear(id)


@hug.post("/run")
@typing.no_type_check
def run(bot: str, cmd: BotCmds, show: Bool = False, dry: Bool = False,
        msg: str = ""):
    return get_runner().run(bot, cmd, show, dry, msg)


@hug.get("/debug")
def debug():
    return get_runner().debug()


@hug.get("/config")
def config(response, file: str, fetch: bool=False):
    result = files.load_file_or_directory(file, fetch)
    if result is None:
        return ["Unknown resource"]

    content_type, contents = result
    response.content_type = content_type
    return contents
