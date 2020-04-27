import os
import json
import re
import string
from pathlib import PurePath, Path
from typing import Optional, Tuple, Union, Dict, Any, Iterable, TextIO


WRITABLE_FILES = {
    'defaults': Path('/opt/intelmq/etc/defaults.conf'),
    'pipeline': Path('/opt/intelmq/etc/pipeline.conf'),
    'runtime': Path('/opt/intelmq/etc/runtime.conf'),
    'positions': Path('/opt/intelmq/etc/manager/positions.conf'),
    }

READONLY_FILES = {
    'bots': Path('/opt/intelmq/etc/BOTS'),
    'harmonization': Path('/opt/intelmq/etc/harmonization.conf'),
    }

FILES = {}
FILES.update(WRITABLE_FILES)
FILES.update(READONLY_FILES)


ALLOWED_PATH = Path("/opt/intelmq/var/lib/bots/")

BOT_CONFIG_CHARS = set(string.ascii_letters + string.digits + string.punctuation
                       + " \n\r\t")


def path_starts_with(path: PurePath, prefix: PurePath) -> bool:
    """Return whether the path starts with prefix.

    Both arguments must be absolute paths. If not, this function raises
    a ValueError.

    This function compares the path components, so it's not a simple
    string prefix test.
    """
    if not path.is_absolute():
        raise ValueError("{!r} is not absolute".format(path))
    if not prefix.is_absolute():
        raise ValueError("{!r} is not absolute".format(prefix))
    return path.parts[:len(prefix.parts)] == prefix.parts


def file_name_allowed(filename: str) -> Optional[Tuple[bool, Path]]:
    """Determine wether the API should allow access to a file."""
    predefined = FILES.get(filename)
    if predefined is not None:
        return (True, predefined)

    resolved = Path(filename).resolve()
    if not path_starts_with(resolved, ALLOWED_PATH):
        return None

    return (False, resolved)


def load_file_or_directory(unvalidated_filename: str, fetch: bool) \
        -> Union[Tuple[str, Union[TextIO, Dict[str, Any]]], None]:
    allowed = file_name_allowed(unvalidated_filename)
    if allowed is None:
        return None

    content_type = "application/json"
    predefined, normalized = allowed

    if predefined or fetch:
        if fetch:
            content_type = "text/html"
        return (content_type, open(normalized))

    result = {"files": {}} # type: Dict[str, Any]
    if normalized.is_dir():
        result["directory"] = str(normalized)
        files = normalized.iterdir() # type: Iterable[Path]
    else:
        files = [normalized]

    for path in files:
        stat = path.stat()
        if stat.st_size < 2000:
            # FIXME: don't hardwire this size
            obj = {"contents": path.read_text()} # type: Dict[str, Any]
        else:
            obj = {"size": stat.st_size, "path": str(path.resolve())}
        result["files"][path.name] = obj
    return (content_type, result)


class SaveFileException(Exception):

    """Exception thrown for errors/invalid input in save_file"""


def save_file(unvalidated_filename: str, contents: str) -> None:
    target_path = WRITABLE_FILES.get(unvalidated_filename)
    if target_path is None:
        raise SaveFileException("Invalid filename: {!r}"
                                .format(unvalidated_filename))

    try:
        parsed = json.loads(contents)
    except json.JSONDecodeError as e:
        raise SaveFileException("File contents for {!r} are not JSON: {}"
                                .format(unvalidated_filename, str(e)))
    if not isinstance(parsed, dict):
        raise SaveFileException("File must contain a JSON object.")

    if unvalidated_filename not in ("defaults", "positions"):
        for key in parsed.keys():
            if key != "__default__" and re.search("[^A-Za-z0-9.-]", key):
                raise SaveFileException("Invalid bot ID: {!r}".format(key))

    if not set(contents) < BOT_CONFIG_CHARS:
        raise SaveFileException("Config has invalid characters");


    old_contents = target_path.read_text()
    if contents != old_contents:
        try:
            target_path.write_text(contents, encoding="utf-8")
        except IOError:
            # TODO: log details of this error
            raise SaveFileException("Could not write file.")
