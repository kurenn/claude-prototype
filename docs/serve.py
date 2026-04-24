#!/usr/bin/env python3
"""
No-cache static file server for prototype development.

Standard `python3 -m http.server` aggressively caches CSS/JS in the browser,
which makes edits to design tokens, persona logic, or the control bar appear
to "not take effect" until a hard refresh. This server sends Cache-Control:
no-store on every response so each reload fetches the latest files.

Use for development. Any static host (Vercel / Netlify / GitHub Pages) is
fine for sharing.

Usage:
  python3 serve.py              # port 8000
  python3 serve.py 9000         # custom port
"""
import http.server
import socketserver
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), NoCacheHandler) as httpd:
        print(f"Serving with no-cache headers at http://localhost:{port}")
        print("Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nbye")


if __name__ == "__main__":
    main()
