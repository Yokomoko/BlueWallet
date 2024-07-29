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

echo 'export LDFLAGS="-L/usr/local/opt/node@18/lib"' >> ~/.zshrc
export LDFLAGS="-L/usr/local/opt/node@18/lib"

echo 'export CPPFLAGS="-I/usr/local/opt/node@18/include"' >> ~/.zshrc
export CPPFLAGS="-I/usr/local/opt/node@18/include"
echo "Configuration complete."

# Install dependencies using yarn
echo "===== Running yarn install ====="
yarn install | tee yarn-install-log.txt
echo "yarn install complete. Full log output in yarn-install-log.txt"

echo "===== Running pod install ====="
cd ios
pod install | tee pod-install-log.txt
echo "pod install complete. Full log output in pod-install-log.txt"
cd ..

echo "===== Installation and Setup Complete ====="
