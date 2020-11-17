"""Stand-alone server for IntelMQ-Manager

SPDX-FileCopyrightText: 2020 Intevation GmbH <https://intevation.de>
SPDX-License-Identifier: AGPL-3.0-or-later

Funding: of initial version by SUNET
Author(s):
  * Bernhard Herzog <bernhard.herzog@intevation.de>

This is the main entry point when serving all of the IntelMQ-Manager via
hug. In addition to the backend implemented in intelmq_manager.api, this
module also serves the static files (JS, CSS, etc.).

Run with hug from the shell as:
   hug -f intelmq_manager/serve.py
"""

import os

import hug # type: ignore

import intelmq_manager.api
import intelmq_manager.config

api_config: intelmq_manager.config.Config = intelmq_manager.config.Config(os.environ.get("INTELMQ_MANAGER_CONFIG"))

api = hug.API(__name__)
api.http.add_middleware(hug.middleware.CORSMiddleware(api, allow_origins=api_config.allow_origins))

@hug.extend_api()
def add_api():
    return [intelmq_manager.api]


@hug.static("/")
def static_dirs():
    return [os.path.join(os.path.dirname(__file__), "static")]


@hug.startup()
def setup(api):
    """Initialize the API when hug starts.

    This function calls initialize_api passing the value of the
    environment variable INTELMQ_MANAGER_CONFIG as the name of the
    configuration file.
    """
    intelmq_manager.api.initialize_api(api_config)
