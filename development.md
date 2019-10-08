**metis-web: development notes**

Developing
===========

## Requirements

- Node 8.9.1+
- NPM

## Basic instructions

Do


```sh
npm install
npm run start
```

to start the development server. If there are problems do the usual

`rm -rf node_modules; npm install` and start.

The server will be on `localhost:8000`. You might need to tunnel the
port if you dev machine is not your desktop.

The system will auto-reload content. Unless you change the layout
(directory `static`). In that case do

- Kill the server
- `cd static`
- `npm install` (on a first run)
- `node build.js`

