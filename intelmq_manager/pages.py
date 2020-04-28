from typing import List
from pathlib import Path
import shlex
import pwd
import os

import mako  # type: ignore
from mako.lookup import TemplateLookup  # type: ignore

import intelmq_manager.files as files
from intelmq_manager.config import Config


template_dir = Path(__file__).parent / "templates"


template_lookup = TemplateLookup(directories=[template_dir],
                                 default_filters=["h"])


def make_shell_cmd(words: List[str]) -> str:
    return " ".join(shlex.quote(word) for word in words)


def effective_user_name() -> str:
    return pwd.getpwuid(os.geteuid()).pw_name


def render_page(pagename: str, config: Config) -> str:
    template = template_lookup.get_template(pagename + ".mako")
    controller_cmd = make_shell_cmd(["sudo", "-u", effective_user_name()]
                                    + config.intelmq_ctl_cmd)
    return template.render(pagename=pagename,
                           controller_cmd=controller_cmd,
                           allowed_path=files.ALLOWED_PATH)
