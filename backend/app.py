import json
from http.server import BaseHTTPRequestHandler

from graph import run_pipeline


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status_code: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(content_length) if content_length else b"{}"

        try:
            payload = json.loads(raw_body.decode("utf-8"))
        except json.JSONDecodeError:
            payload = {}

        prompt = payload.get("prompt", "")
        if not isinstance(prompt, str) or not prompt.strip():
            self._send_json(400, {"error": "Please enter a prompt before generating a post."})
            return

        try:
            final_state = run_pipeline(prompt.strip())
            final_post = final_state["final_post"]
            self._send_json(200, {"finalPost": final_post})
        except Exception as error:
            self._send_json(500, {"error": str(error)})
