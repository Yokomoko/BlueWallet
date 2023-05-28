#!/bin/zsh

# fail if any command fails

echo "🧩 Stage: Post-clone is activated .... "

set -e
# debug log
set -x

# Install dependencies using Homebrew.
brew install node cocoapods

# Install node and pods dependencies.
if [ $CI_PRODUCT_PLATFORM = 'macOS' ]
then
    cd .. &&
    cd .. &&
    ./scripts/maccatalystpatches/applypatchesformaccatalyst.sh
else
    cd .. && npm install && npx pod-install
fi

echo "🎯 Stage: Post-clone is done .... "

exit 0
