"""
Gemini CORS Proxy -- zero dependencies, built-in Python only
----------------------------------------------------------------
SETUP (one-time):
  1. Paste your Google Gemini API key below where it says YOUR_KEY_HERE
     Get a free key at: https://aistudio.google.com/app/apikey
  2. Run:  python3 gemini_proxy.py
  3. Open your resume_filter app in any browser -- no key prompt, just works!

Works on Python 3.6+
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.request
import json
import sys

# -- PUT YOUR GEMINI API KEY HERE ----------------------------------------------
API_KEY = "AIzaSyDtEyDB6s0Zrgd9kIZths-ofdQmuvPFdRM"   # e.g. AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
# -----------------------------------------------------------------------------

MODEL = "gemini-flash-latest"   # or "gemini-2.0-flash", "gemini-1.5-pro", etc.
PORT  = 8787


class ProxyHandler(BaseHTTPRequestHandler):

    def log_message(self, fmt, *args):
        status = args[1] if len(args) > 1 else "?"
        print(f"  [{self.command}] {self.path}  ->  {status}")

    def do_OPTIONS(self):
        """Handle CORS preflight from browser."""
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_POST(self):
        if self.path != "/v1/generate":
            self._json(404, {"error": "path not found - use /v1/generate"})
            return

        if API_KEY == "YOUR_KEY_HERE":
            self._json(500, {"error": {"message": "Open gemini_proxy.py and replace YOUR_KEY_HERE with your real Gemini API key."}})
            return

        length = int(self.headers.get("Content-Length", 0))
        body   = self.rfile.read(length)

        try:
            incoming = json.loads(body)
        except Exception:
            self._json(400, {"error": {"message": "Invalid JSON body"}})
            return

        prompt = incoming.get("prompt", "")

        gemini_body = json.dumps({
            "contents": [
                {"role": "user", "parts": [{"text": prompt}]}
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 2048,
                "responseMimeType": "application/json",
            }
        }).encode()

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

        req = urllib.request.Request(
            url,
            data=gemini_body,
            method="POST",
            headers={
                "Content-Type": "application/json",
                "X-goog-api-key": API_KEY,
            },
        )

        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                status        = resp.status
                response_body = resp.read()
        except urllib.error.HTTPError as e:
            status        = e.code
            response_body = e.read()
        except Exception as e:
            self._json(502, {"error": {"message": str(e)}})
            return

        self.send_response(status)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(response_body)

    def _json(self, status, payload):
        data = json.dumps(payload).encode()
        self.send_response(status)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(data)

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin",  "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")


if __name__ == "__main__":
    if API_KEY == "YOUR_KEY_HERE":
        print("\n[!] Edit gemini_proxy.py first -- set your API key, then re-run.\n")
        sys.exit(1)

    server = HTTPServer(("0.0.0.0", PORT), ProxyHandler)
    print(f"""
+--------------------------------------------------+
|        Gemini CORS Proxy -- running OK           |
|  Model:       {MODEL:<34}|
|  Listening on http://127.0.0.1:{PORT}             |
|  Open your resume_filter app in any browser      |
|  Press  Ctrl+C  to stop                          |
+--------------------------------------------------+
""")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nProxy stopped.")
        sys.exit(0)

