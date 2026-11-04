"""Writes the FastAPI app's OpenAPI schema to a JSON file, for the
frontend to generate typed API clients from (see frontend/package.json
`gen:api` script).
"""

import json
import sys
from pathlib import Path

from app.main import app

DEFAULT_OUTPUT = Path(__file__).resolve().parents[1] / "openapi.json"


def export(output_path: Path = DEFAULT_OUTPUT) -> None:
    schema = app.openapi()
    output_path.write_text(json.dumps(schema, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote OpenAPI schema to {output_path}")


if __name__ == "__main__":
    output = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_OUTPUT
    export(output)
