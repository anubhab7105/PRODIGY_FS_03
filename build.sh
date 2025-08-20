#!/bin/bash
# Create the api directory if it doesn't exist
mkdir -p api

# Copy the necessary files
cp app.py api/index.py
cp requirements.txt api/requirements.txt

echo "Build completed successfully!"