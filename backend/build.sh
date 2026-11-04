#!/usr/bin/env bash
set -o errexit
pip install -e .
alembic upgrade head
