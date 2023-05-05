## 2023-05-05

### Iframe Shell Architecture

Separating the terminal emulator from the shell will make it possible to re-use
Puter's terminal emulator for containers, emulators, and tunnels.

Puter's shell will follow modern approaches for handling data; this means:
- Commands will typically operate on streams of objects
  rather than streams of bytes.
- Rich UI capabilities, such as images, will be possible.

To use Puter's shell, this terminal emulator will include an adapter shell.
The adapter shell will delegate to the real Puter shell and provide a sensible
interface for an end-user using an ANSI terminal emulator.

This means the scope of this terminal emulator is to be compatible with
two types of shells:
- Legacy ANSI-compatible shells
- Modern Puter-compatible shells

To avoid duplicate effort, the ANSI adapter for the Puter shell will be
accessed by the terminal emulator through cross-document messaging,
as though it were any other ANSI shell provided by a third-party service.
This will also keep these things loosely coupled so we can separate the
adapter in the future and allow other terminal emulators to take
advantage of it.
