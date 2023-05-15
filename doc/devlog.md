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

## 2023-05-06

### The Context

In creating the state processor I made a variable called
`ctx`, representing contextual information for state functions.

The context has a few properties on it:
- constants
- locals
- vars
- externs

#### constants

Constants are immutable values tied to the context.
They can be overriden when a context is constructed but
cannot be overwritten within an instance of the context.

#### variables

Variabes are mutable context values which the caller providing
the context might be able to access.

#### locals

Locals are the same as varaibles but the state processor
exports them. This might not have been a good idea;
maybe to the user of a context these should appear
to be the same as variables, because the code using a
context doesn't care what the longevity of locals is
vs variables.

Perhaps locals could be a useful concept for values that
only change under a sub-context, but this is already
true about constants since sub-contexts can override
them. After all, I can't think of a compelling reason
not to allow overridding constants when you're creating
a sub-context.

#### externs

Externs are like constants in that they're not mutable to
the code using a context. However, unlike constants they're
not limited to primitive values. They can be objects and
these objects can have side-effects.

### How to make the context better moving forward?

#### Composing contexts

The ability to compose context would be useful. For example
the readline function could have a context that's a composition
of the ANSI context (containing ANSI constantsl maybe also
library functions in the future), an outputter context since
it outputs characters to the terminal, as well as a context
specific to handlers under the readline utility.

#### Additional reflection
This idea of contexts and compositing contexts is actually
something I've been thinking about for a long time. Contexts
are an essential component in FOAM for example. However, this
idea of separating **constants**, **imports**, and
**side-effect varibles** (that is, variables something else
is able to access),
is not something I thought about until I looked at the source
code for ash (an implementation of `sh`), and considered how
I might make that source code more portable by repreasting
it as language-agnostic data.

## 2023-05-07

### Conclusion of Context Thing from Yesterday

I just figured something out after re-reading yesterday's
devlog entry.

While the State Processor needs a separate concept of
variables vs locals, even the state functions don't care
about this distinction. It's only there so certain values
are cleared at each iteration of the state processor.

This means a context can be composed at each iteration
containing both the instance variables and the transient
variables.

### When Contexts are Equivalent to Pure Functions

In pure-functional logic functions do not have side effects.
This means they would never change a value by reference, but
they would return a value.

When a subcontext is created prior to a function call, this
is equivalent to a pure function under certain conditions:
- the values which may be changed must be explicity stated
- the immediate consequences of updating any value are known

## 2023-05-08

### Sending authorization information to the shell

Separating the terminal emulator from the shell currenly
means that the terminal is a Puter app and the shell is
a service being used by a Puter app, rather than natively
being a Puter app.

This may change in the future, but currently it means the
terminal emulator needs to - not because it's the terminal
emulator, but because it's the Puter application - configure
the shell with authorization information.

There are a few different approaches to this:
- pass query string parameters onto the shell via url
- send a non-binary postMessage with configuration
- send an ANSI escape code followed by a binary-encoded
  configuration message
- construct a Form object in javascript and do a POST
  request to the target iframe

The last option seems like it could be a CORS nightmare since
right now I'm testing in a situation where the shell happens
to be under the same domain name as the terminal emulator, but
this may not always be the case.

Passing query string parameters over means authorization
tokens are inside the DOM. While this is already true
about the parent iframe I'd like to avoid this in case we
find security issues with this approach under different
situations. For example the parent iframe is in a situation
where userselect and the default context menu are disabled,
which may be preventing a user from accidentally putting
sensitive html attributes in their clipboard.

That leaves the two options for sending a postMessage:
either binary, or a non-binary message. The binary approach
would require finding handling an OSC escape sequence handler
and creating some conventions for how to communicate with
Puter's API using ANSI escape codes. While this might be useful
in the future, it seems more practical to create a higher-level
message protocol first and then eventually create an adapter
for OSC codes in the future if need is found for one.

So with that, here are window messages between Puter's
ANSI terminal emulator and Puter's ANSI adapter for Puter's
shell:

#### Ready message

Sent by shell when it's loaded.

```
{ $: 'ready' }
```

#### Config message

Sent by terminal emulator after shell is loaded.

```
{
  $: 'config',
  ...variables
}
```

All `variables` are currently keys from the querystring
but this may change as the authorization mechanism and
available shell features mature.

## 2023-05-09

### Parsing CLI arguments

Node has a bulit-in utility, but using this would be
unreliable because it's allowed to depend on system-provided
APIs which won't be available in a browser.

There's
[a polyfill](https://github.com/pkgjs/parseargs/tree/main)
which doesn't appear to depend on any node builtins.
It does not support sub-commands, nor does it generate
helptext, but it's a starting point.

If each command specifies a parser for CLI arguments, and also
provides configuration in a format specific to that parser,
there are a few advantages:
- easy to migrate away from this polyfill later by creating an
  adapter or updating the commands which use it.
- easy to add custom argument processors for commands which
  have an interface that isn't strictly adherent to convention.
- auto-complete and help can be generated with knowledge of how
  CLI arguments are processed by a particular command.

## 2023-05-10

### Kind of tangential, but synonyms are annoying

The left side of a UNIX pipe is the
- source, faucet, producer, upstream

The right side of a UNIX pipe is the
- target, sink, consumer, downstream

I'm going to go with `source` and `target` for any cases like this
because they have the same number of letters, and I like when similar
lines of code are the same length because it's easier to spot errors.

## 2023-05-14

### Retro: Terminal Architecture

#### class: PreparedCommand

A prepared command contains information about a command which will
be invoked within a pipeline, including:
- the command to be invoked
- the arguments for the command (as tokens)
- the context that the command will be run under

A prepared command is created using the static method
`PreparedCommand.createFromTokens`. It does not have a
context until `setContext` is later called.

#### class Pipeline

A pipeline contains PreparedCommand instances which represent the
commands that will be run together in a pipeline.

A pipeline is created using the static method
`Pipeline.createFromTokens`, which accepts a context under which
the pipeline will be constructed. The pipeline's `execute` method
will also be passed a context when the pipeline should begin running,
and this context can be different. (this is also the context that
will be passed to each `PreparedCommand` instance before each
respective `execute` method is called).

#### class Pipe

A pipe is composed of a readable stream and a writable stream.
A respective `reader` and `writer` are exposed as
`out` and `in` respectively.

The readable stream and writable stream are tied together.

#### class Coupler

A coupler aggregates a reader and a writer and begins actively
reading, relaying all items to the writer.

This behaviour allows a coupler to be used as a way of connecting
two pipes together.

At the time of writing this, it's used to tie the pipe that is
created after the last command in a pipeline to the writer of the
pseudo terminal target, instead of giving the last command this
writer directly. This allows the command to close its output pipe
without affecting subsequent functionality of the terminal.

