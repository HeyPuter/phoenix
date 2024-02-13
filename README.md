# Phoenix

`phoenix` is a pure-javascript shell built for [puter.com](https://puter.com).
Following the spirit of open-source initiatives we've seen like
[SerenityOS](https://serenityos.org/),
we've built much of the shell's functionality from scratch.
Some interesting portions of this shell include:
- A shell parser which produces a Concrete-Syntax-Tree
- Pipeline constructs built on top of the [Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
- Platform support for Puter

The shell is a work in progress. The following improvements are considered in-scope:
- Anything specified in [POSIX.1-2017 Chapter 2](https://pubs.opengroup.org/onlinepubs/9699919799.2018edition/utilities/V3_chap02.html)
- UX improvements over traditional shells
  > examples include: readline syntax highlighting, hex view for binary streams
- Platform support, so `phoenix` can run in more environments

## Quickstart

To run the shell, follow the instructions provided for
[Puter's terminal emulator](https://github.com/HeyPuter/terminal).

## What's on the Roadmap?

We're looking to continue improving the shell and broaden its usefulness.
Here are a few ideas we have for the future:

- local machine platform support
  > Some effort has already been made to de-couple Puter platform support
  > from the shell, so we only need to implement a `node` platform in
  > [the src/platform directory](./src/platform).
- further support for the POSIX Command Language
  > Check our list of [missing features](doc/missing-posix.md)

