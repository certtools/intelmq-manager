import io
import subprocess
from typing import List, Dict, Optional
from .version import __version__


#
# Typing aliases for use with RunIntelMQCtl
#
# Arguments for a subprocess command line are a list of strings.
Args = List[str]

# JSON output of intelmqctl is returned as a BytesIO object because hug
# will then simply pass its contents to the client as JSON.
JSONFile = io.BytesIO


class RunIntelMQCtl:

    def __init__(self, base_cmd: Args):
        self.base_cmd = base_cmd

    def _run_intelmq_ctl(self, args: Args) -> subprocess.CompletedProcess:
        return subprocess.run(self.base_cmd + args,
                              stdout=subprocess.PIPE,
                              stderr=subprocess.PIPE)

    def _run_json(self, args: Args) -> JSONFile:
        completed = self._run_intelmq_ctl(["--type", "json"] + args)
        return io.BytesIO(completed.stdout)

    def _run_str(self, args: Args) -> str:
        completed = self._run_intelmq_ctl(args)
        return str(completed.stdout, "ascii")


    def botnet(self, action: str, group: Optional[str]) -> JSONFile:
        args = [action]
        if group is not None and group != "botnet":
            args.extend(["--group", group])
        return self._run_json(args)

    def bot(self, action: str, bot_id: str) -> JSONFile:
        return self._run_json([action, bot_id])

    def log(self, bot_id: str, lines: int, level: str) -> JSONFile:
        if level == "ALL":
            level = "DEBUG"
        return self._run_json(["log", bot_id, str(lines), level])

    def list(self, kind: str) -> JSONFile:
        return self._run_json(["list", kind])

    def version(self) -> Dict[str, str]:
        intelmq_version = self._run_str(["--version"]).strip()
        return {"intelmq": intelmq_version,
                "intelmq-manager": __version__,
                }
    def check(self) -> JSONFile:
        return self._run_json(["check"])

    def clear(self, queue_name: str) -> JSONFile:
        return self._run_json(["clear", queue_name])

    def run(self, bot_id: str, cmd: str, show: bool, dry: bool,
            msg: str) -> str:
        args = ["run", bot_id]
        if cmd == "get":
            args.extend(["message", "get"])
        elif cmd == "pop":
            args.extend(["message", "pop"])
        elif cmd == "send":
            args.extend(["message", "send", msg])
        elif cmd == "process":
            args.append("process")
            if show:
                args.append("--show-sent")
            if dry:
                args.append("--dry")
            args.extend(["--msg", msg])
        return self._run_str(args)

    def debug(self) -> JSONFile:
        return self._run_json(["debug"])
