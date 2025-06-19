#!/usr/bin/env python3
import http.server
import socketserver
import os
from datetime import datetime

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add headers to prevent caching
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', 'Thu, 01 Jan 1970 00:00:00 GMT')
        self.send_header('Last-Modified', datetime.now().strftime('%a, %d %b %Y %H:%M:%S GMT'))
        super().end_headers()

    def guess_type(self, path):
        mime_type, encoding = super().guess_type(path)
        # Force reload for HTML, CSS, and JS files
        if mime_type in ['text/html', 'text/css', 'application/javascript']:
            return mime_type
        return mime_type, encoding

if __name__ == "__main__":
    PORT = 5000
    with socketserver.TCPServer(("0.0.0.0", PORT), NoCacheHTTPRequestHandler) as httpd:
        print(f"🚀 FinanFun No-Cache Server running on port {PORT}")
        print(f"📅 Server started at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("🔄 All files served with no-cache headers")
        httpd.serve_forever()