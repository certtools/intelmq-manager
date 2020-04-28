"""Configuration for IntelMQ Manager"""

from typing import List
import json
from pathlib import Path


class Config:

    """Configuration settings for IntelMQ Manager"""

    intelmq_ctl_cmd: List[str] = ["sudo", "-u", "intelmq",
                                  "/usr/local/bin/intelmqctl"]


def load_config(filename: str) -> Config:
    """Load configuration from JSON file"""
    with open(filename) as f:
        raw = json.load(f)

    config = Config()

    if "intelmq_ctl_cmd" in raw:
        config.intelmq_ctl_cmd = raw["intelmq_ctl_cmd"]

    return config
