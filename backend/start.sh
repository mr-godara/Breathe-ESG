#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Running database migrations..."
python backend/manage.py migrate

echo "Creating default organization..."
python backend/manage.py shell -c "
from backend.apps.ingestion.models import Organization
from django.utils.text import slugify
Organization.objects.get_or_create(
	id=1,
	defaults={'name': 'Acme Corp', 'slug': slugify('Acme Corp')},
)
"

echo "Starting server..."
gunicorn -c backend/gunicorn.conf.py backend.config.wsgi:application
