#!/bin/bash
cd /tmp/kavia/workspace/code-generation/classic-tetris-web-game-12503-12512/tetris_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

