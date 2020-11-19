"""Configuration for IntelMQ Manager

SPDX-FileCopyrightText: 2020 Intevation GmbH <https://intevation.de>
SPDX-License-Identifier: AGPL-3.0-or-later

Funding: of initial version by SUNET
Author(s):
  * Bernhard Herzog <bernhard.herzog@intevation.de>
"""

from typing import List, Optional
import json
from pathlib import Path


class Config:

    """Configuration settings for IntelMQ Manager"""

    intelmq_ctl_cmd: List[str] = ["sudo", "-u", "intelmq",
                                  "/usr/local/bin/intelmqctl"]

    allowed_path: Path = Path("/opt/intelmq/var/lib/bots/")

    session_store: Optional[Path] = None

    session_duration: int = 24 * 3600

    allow_origins: List[str] = ['*']

    html_dir: Path = Path("/usr/share/intelmq-manager/html/")


    def __init__(self, filename: str):
        """Load configuration from JSON file"""
        raw = []

        # this is just for development:
        # if we are in the source directory, we are going to use
        # the html files from the source directory
        source_html = Path(__file__).parent.parent.joinpath("intelmq_manager/html/index.html")
        if source_html.exists():
            self.html_dir = source_html.parent

        if filename:
            with open(filename) as f:
                raw = json.load(f)

        if "intelmq_ctl_cmd" in raw:
            self.intelmq_ctl_cmd = raw["intelmq_ctl_cmd"]

        if "allowed_path" in raw:
            self.allowed_path = Path(raw["allowed_path"])

        if "session_store" in raw:
            self.session_store = Path(raw["session_store"])

        if "session_duration" in raw:
            self.session_duration = int(raw["session_duration"])

        if "allow_origins" in raw:
            self.allow_origins = raw['allow_origins']

        if "html_dir" in raw:
            self.html_dir = Path(raw["html_dir"])

        print("Serving html from {}".format(self.html_dir))
