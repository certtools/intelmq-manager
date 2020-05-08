"""Render the HTML-pages of the IntelMQ-Manager

SPDX-FileCopyrightText: 2020 Intevation GmbH <https://intevation.de>
SPDX-License-Identifier: AGPL-3.0-or-later

Funding: of initial version by SUNET
Author(s):
  * Bernhard Herzog <bernhard.herzog@intevation.de>
"""

from pathlib import Path

import mako  # type: ignore
from mako.lookup import TemplateLookup  # type: ignore

from intelmq_manager.config import Config
from intelmq_manager.util import shell_command_for_errors


template_dir = Path(__file__).parent / "templates"


template_lookup = TemplateLookup(directories=[template_dir],
                                 default_filters=["h"])


def render_page(pagename: str, config: Config) -> str:
    template = template_lookup.get_template(pagename + ".mako")
    controller_cmd = shell_command_for_errors(config.intelmq_ctl_cmd)
    return template.render(pagename=pagename,
                           controller_cmd=controller_cmd,
                           allowed_path=config.allowed_path)
