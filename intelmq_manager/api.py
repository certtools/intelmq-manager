"""HTTP-API backend of IntelMQ-Manager

SPDX-FileCopyrightText: 2020 Intevation GmbH <https://intevation.de>
SPDX-License-Identifier: AGPL-3.0-or-later

Funding: of initial version by SUNET
Author(s):
  * Bernhard Herzog <bernhard.herzog@intevation.de>

This module implements the HTTP part of the API backend of
IntelMQ-Manager. The logic itself is in the files and pages
modules.
"""

import sys
import os
import string
import typing
import getpass

import hug  # type: ignore

from intelmq.bin import intelmqctl
import pkg_resources
import json
from .version import __version__

import intelmq_manager.files as files
import intelmq_manager.pages as pages
import intelmq_manager.config
import intelmq_manager.session as session


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


api_config: intelmq_manager.config.Config = intelmq_manager.config.Config()

file_access: files.FileAccess = files.FileAccess(api_config)


session_store = None


def initialize_api(filename: typing.Optional[str] = None) -> None:
    """Initialize the API, optionally loading a configuration file.

    If a filename is given, this function updates the configuration in
    the module global variable api_config by loading a new configuration
    and assigning it to the variable.

    Then, regardless of whether a filename was given, it calls the
    update_from_runctl method of the file_access object so that it uses
    the files that IntelMQ actually uses.

    Note: Because of that last step this function should always be
    called when the server process starts even when no configuration
    needs to be read from a file.
    """
    global api_config, session_store, imqc

    imqc = intelmqctl.IntelMQController(return_type="json")

    if filename is not None:
        api_config = intelmq_manager.config.load_config(filename)

    session_file = api_config.session_store
    if session_file is not None:
        session_store = session.SessionStore(str(session_file),
                                             api_config.session_duration)


def cache_get(*args, **kw):
    """Route to use instead of hug.get that sets cache headers in the response.
    """
    return hug.get(*args, **kw).cache(max_age=3)


def verify_token(token):
    if session_store is not None:
        return session_store.verify_token(token)
    else:
        return None

hug_token_authentication = hug.authentication.token(verify_token)

def token_authentication(*args, **kw):
    if session_store is not None:
        return hug_token_authentication(*args, **kw)
    else:
        return True


@hug.get("/api/botnet", requires=token_authentication)
@typing.no_type_check
def botnet(action: Actions, group: Groups = None):
    if group == 'botnet':
        group = None
    if action == 'status':
        retval, botnet_status = imqc.botnet_status(group = group)
    if action == 'start':
        retval, botnet_status = imqc.botnet_start(group = group)
    if action == 'stop':
        retval, botnet_status = imqc.botnet_stop(group = group)
    if action == 'restart':
        retval, botnet_status = imqc.botnet_restart(group = group)
    if action == 'reload':
        retval, botnet_status = imqc.botnet_reload(group = group)
    return botnet_status


@hug.get("/api/bot", requires=token_authentication)
@typing.no_type_check
def bot(action: Actions, id: ID):
    if action == 'status':
        retval, botnet_status = imqc.bot_status(id)
    if action == 'start':
        retval, botnet_status = imqc.bot_start(id)
    if action == 'stop':
        retval, botnet_status = imqc.bot_stop(id)
    if action == 'restart':
        retval, botnet_status = imqc.bot_restart(id)
    if action == 'reload':
        retval, botnet_status = imqc.bot_reload(id)
    return botnet_status


@cache_get("/api/getlog", requires=token_authentication)
@typing.no_type_check
def getlog(id: ID, lines: int, level: Levels = "DEBUG"):
    if level == "ALL":
        level = "DEBUG"
    retval, logs = imqc.read_bot_log(id, level, lines)
    return logs


@cache_get("/api/queues", requires=token_authentication)
def queues():
    retval, queues = imqc.list_queues()
    return queues


@cache_get("/api/queues-and-status", requires=token_authentication)
def queues_and_status():
    retval, queues = imqc.list("queues-and-status")
    return queues


@hug.get("/api/version", requires=token_authentication)
def version(request):
    intelmq_version = pkg_resources.get_distribution("intelmq").version
    return {"intelmq": intelmq_version,
            "intelmq-manager": __version__,
            }


@hug.get("/api/check", requires=token_authentication)
def check():
    retval, status = imqc.check()
    return status


@hug.get("/api/clear", requires=token_authentication)
@typing.no_type_check
def clear(id: ID):
    retval, status = imqc.clear(id)
    return status


@hug.post("/api/run", requires=token_authentication)
@typing.no_type_check
def run(bot: str, cmd: BotCmds, show: Bool = False, dry: Bool = False,
        msg: str = ""):
    run_subcommand = "message"
    if cmd == "process":
        run_subcommand = "process"
        cmd = None

    retval, output = imqc.bot_process_manager.bot_run(bot_id=bot, run_subcommand=run_subcommand, message_action_kind=cmd, dryrun=dry, msg=msg, show_sent=show)
    return output


@hug.get("/api/debug", requires=token_authentication)
def debug():
    retval, output = imqc.debug()
    return output


@hug.get("/api/config", requires=token_authentication)
def config(response, file: str, fetch: bool=False):
    result = file_access.load_file_or_directory(file, fetch)
    if result is None:
        return ["Unknown resource"]

    content_type, contents = result
    response.content_type = content_type
    return contents


@hug.post("/api/save", parse_body=True,
          inputs={"application/x-www-form-urlencoded": hug.input_format.text},
          requires=token_authentication)
def save(body, file: str):
    try:
        file_access.save_file(file, body)
        return "success"
    except files.SaveFileException as e:
        return str(e)


@hug.get("/", output=hug.output_format.html)
@typing.no_type_check
def page(response, page: Pages = "index"):
    return pages.render_page(page, api_config)



@hug.post("/api/login")
def login(username: str, password: str):
    if session_store is not None:
        known = session_store.verify_user(username, password)
        if known is not None:
            token = session_store.new_session({"username": username})
            return {"login_token": token,
                    "username": username,
                    }
    return "Invalid username and/or password"


@hug.cli()
def add_user(username: str):
    config_file = os.environ.get("INTELMQ_MANAGER_CONFIG")
    if config_file is None:
        print("Configuration file given in INTELMQ_MANAGER_CONFIG"
              " environment variable", file=sys.stderr)
        exit(1)

    initialize_api(config_file)
    if session_store is None:
        print("No session store configured in {!r}".format(config_file),
              file=sys.stderr)
        exit(1)

    password = getpass.getpass()
    session_store.add_user(username, password)
