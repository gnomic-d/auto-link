// Copies the web app into www/ so Capacitor can package it.
const fs = require('fs');
const keep = ['index.html', 'manifest.webmanifest', 'sw.js', 'css', 'js', 'images', 'icons'];
fs.rmSync('www', { recursive: true, force: true });
fs.mkdirSync('www');
for (const name of keep) fs.cpSync(name, 'www/' + name, { recursive: true });
console.log('www/ ready:', fs.readdirSync('www').join(', '));
