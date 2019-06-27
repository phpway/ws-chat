#!/bin/bash
cd $(dirname $0)

# build client
pushd ../client/
npm install
npm run build
popd

# build server
pushd ../server/
npm install
popd

cd ..
rm -rf dist build
mkdir -p dist build/client
rsync -a client/dist build/client
rsync -a server/{node_modules,index.js} build/server

# package into tar/gzip archive
tar -cvzf dist/ws-chat.tgz -C build .