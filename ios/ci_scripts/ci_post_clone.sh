#!/bin/zsh

# fail if any command fails

echo "🧩 Stage: Post-clone is activated .... "

set -e
# debug log
set -x

# Install dependencies using Homebrew.
export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
brew install node@18 cocoapods
brew link node@18
brew install yarn

# Install node and pods dependencies.
cd .. && yarn && npx pod deintegrate && npx pod update

echo "🎯 Stage: Post-clone is done .... "

exit 0
