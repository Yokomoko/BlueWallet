#!/bin/zsh

# fail if any command fails

echo "🧩 Stage: Post-clone is activated .... "

set -e
# debug log
set -x

# Install dependencies using Homebrew.
brew install node cocoapods

# Install node and pods dependencies.
ls && cd .. && npm install && npx pod-install

echo "🎯 Stage: Post-clone is done .... "

exit 0
