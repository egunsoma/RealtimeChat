#!/usr/bin/env bash

if [ "$1" == "production" ];
then
  echo "Switching to Production Environment"
  yes | cp -rf "firebase-environments/production/google-services.json" android
  yes | cp -rf "firebase-environments/production/GoogleService-Info.plist" ios
elif [ "$1" == "development" ]
then
  echo "Switching to Development Environment"
  yes | cp -rf "firebase-environments/development/google-services.json" android
  yes | cp -rf "firebase-environments/development/GoogleService-Info.plist" ios
elif [ "$1" == "envs" ]
then
  echo "ID\tFIREBASE PROJECT"
  echo "production\trealtime-chat-prod"
  echo "development\trealtime-chat-dev"
else
  echo "Run 'firebase-config.sh envs' to list available environments."
fi