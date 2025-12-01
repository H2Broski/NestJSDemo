#!/bin/bash
set -e
echo "Installing dependencies..."
npm install
echo "Building application..."
./node_modules/.bin/nest build
echo "Build complete!"
