# Connect 4 Multiplayer: Server

A websocket server that powers the multiplayer on https://br-connect-4.herokuapp.com/.

## Building from Source

Using npm:

```
$ npm run build
```

will produce the compiled server and documentation under `/dist`.

## Running the Server

The uncompiled server without documentation can be started locally with npm:

```
$ npm run start:dev
```

The compiled server with documentation can be started locally with npm:

```
$ npm run build
$ npm start
```

Navigating to `http://localhost:8080` will display the generated server documentation.

## Testing

The test suite can be executed with npm:

```
$ npm test
```
