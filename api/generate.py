import json
from importlib import util
from http.server import BaseHTTPRequestHandler
from pathlib import Path


_backend_path = Path(__file__).resolve().parent.parent / "app.py"
_backend_spec = util.spec_from_file_location("linkedin_backend", _backend_path)
if _backend_spec is None or _backend_spec.loader is None:
    raise RuntimeError("Unable to load Python backend module.")
_backend = util.module_from_spec(_backend_spec)
_backend_spec.loader.exec_module(_backend)
generate_post = _backend.generate_post


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/api/generate":
            self.send_response(404)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Not found"}).encode("utf-8"))
            return

        content_length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(content_length) if content_length else b"{}"

        try:
            payload = json.loads(raw_body.decode("utf-8"))
        except json.JSONDecodeError:
            payload = {}

        prompt = payload.get("prompt", "")
        if not isinstance(prompt, str) or not prompt.strip():
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(
                json.dumps({"error": "Please enter a prompt before generating a post."}).encode("utf-8")
            )
            return

        try:
            final_post = generate_post(prompt.strip())
            body = json.dumps({"finalPost": final_post}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except Exception as error:
            body = json.dumps({"error": str(error)}).encode("utf-8")
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
