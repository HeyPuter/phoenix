# dev-ansi-terminal

ANSI Terminal emulator for Puter

## Scope

The terminal will be able to connect to any ANSI terminal.

The following methods may be supported:
- cross-document communication with a browser-based ANSI shell
  - **current priority**
  - this is done via `postMessage`
- websocket server hosting a shell
  - might be useful for tunneling SSH over HTTP
    - note: risk of misuse of server providing tunneling

Included in this repository will be the ANSI adapter for
the Puter shell. The Puter shell itself will be a separate
application.

