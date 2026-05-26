#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing dependencies..."
pip install -r backend/requirements.txt

echo "Running database migrations..."
python backend/manage.py migrate

echo "Creating default organization..."
python backend/manage.py shell -c "
from backend.apps.ingestion.models import Organization
Organization.objects.get_or_create(id=1, defaults={'name': 'Acme Corp'})
"

echo "Build complete."
