#!/usr/bin/env bash
# Script de build pour Cloudflare Pages (integration Git).
# Copie uniquement les fichiers PUBLICS du site dans publication/ —
# les guides internes et signatures ne sont jamais publies.
set -e
rm -rf publication
mkdir -p publication
cp index.html 404.html _headers publication/
cp -r css js assets fr publication/
echo "Dossier publication/ genere."
