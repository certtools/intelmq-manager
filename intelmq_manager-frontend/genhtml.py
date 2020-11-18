#!/usr/bin/env python3

import pathlib
import shutil
from mako.lookup import TemplateLookup



template_dir = pathlib.Path("templates")
template_lookup = TemplateLookup(directories=[template_dir], default_filters=["h"])

def render_page(pagename: str) -> str:
    template = template_lookup.get_template(pagename + ".mako")
    controller_cmd = "intelmq"
    allowed_path = "/opt/intelmq/var/lib/bots/"
    return template.render(pagename=pagename,
            controller_cmd=controller_cmd,
            allowed_path=allowed_path)

def main():
    outputdir = pathlib.Path('html')
    outputdir.mkdir(parents=True, exist_ok=True)

    htmlfiles = ["configs", "management", "monitor", "check", "about", "index"]
    for filename in htmlfiles:
        html = render_page(filename)
        with outputdir.joinpath("{}.html".format(filename)) as p:
            p.write_text(html)


    staticfiles = ["css", "images", "js", "plugins", "less"]
    for filename in staticfiles:
        src = pathlib.Path('static/{}'.format(filename))
        dst = outputdir.joinpath(filename)
        if dst.exists():
            shutil.rmtree(dst)
        shutil.copytree(src, dst)

if __name__ == "__main__": main()
