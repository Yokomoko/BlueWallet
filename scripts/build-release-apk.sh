#!/bin/bash

# assumes 3 env variables: KEYSTORE_FILE_BASE64, KEYSTORE_PASSWORD and KEY_PASSWORD

# PS. to turn keystore to base64 and back:
#     $ openssl base64 -A -in hashengineering.keystore > base64file
#     $ cat base64file | base64 -d > bluewallet-release-key.keystore

echo $KEYSTORE_FILE_BASE64 > release-key.base64
echo "$(cat release-key.base64)" | base64 -d > ./android/bluewallet-release-key.keystore
rm release-key.base64

cd android
# Use the BUILD_NUMBER environment variable set in the GitHub Actions workflow
sed -i'.original' "s/versionCode 1/versionCode $BUILD_NUMBER/g" app/build.gradle

# Extract versionName from build.gradle
VERSION_NAME=$(grep versionName app/build.gradle | awk '{print $2}' | tr -d '"')

./gradlew assembleRelease

# Rename the APK file to include the dynamic version and build number with parentheses
mv ./app/build/outputs/apk/release/app-release-unsigned.apk "./app/build/outputs/apk/release/BlueWallet-${VERSION_NAME}($BUILD_NUMBER).apk"

echo wheres waldo?
find $ANDROID_HOME | grep apksigner | grep -v jar

$ANDROID_HOME/build-tools/34.0.0/apksigner sign --ks ./bluewallet-release-key.keystore --ks-pass=pass:$KEYSTORE_PASSWORD --key-pass=pass:$KEY_PASSWORD "./app/build/outputs/apk/release/BlueWallet-${VERSION_NAME}($BUILD_NUMBER).apk"
