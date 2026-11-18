"""Serve the public V22 pages and the community preview on one local origin."""

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "hosted-source" / "public"
COMMUNITY_PAGE = "community-share.html"


class PreviewHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        archived = super().translate_path(path)
        if Path(archived) == PUBLIC / COMMUNITY_PAGE:
            return str(ROOT / "preview" / COMMUNITY_PAGE)
        return archived


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=4173, help="local port (default 4173)")
    port = parser.parse_args().port
    if not 0 <= port <= 65535:
        parser.error("port must be between 0 and 65535")
    handler = partial(PreviewHandler, directory=PUBLIC)
    try:
        with ThreadingHTTPServer(("127.0.0.1", port), handler) as server:
            print(f"Open http://127.0.0.1:{server.server_port}/{COMMUNITY_PAGE}", flush=True)
            print("Press Ctrl+C to stop the preview.", flush=True)
            server.serve_forever()
    except KeyboardInterrupt:
        return 0
    except OSError as error:
        print(f"Could not start the local V22 preview: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
