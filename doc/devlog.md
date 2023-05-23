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

### Behaviour of echo escapes

#### behaviour of `\\` should be verified
Based on experimentation in Bash:
- `\\` is always seen by echo as `\`
  - this means `\\a` and `\a` are the same

#### difference between `\x` and `\0`

In echo, `\0` initiates an octal escape while `\x` initiates
a hexadecimal escape.

However, `\0` without being followed by a valid octal sequence
is considered to be `NULL`, while `\x` will be outputted literally
if not followed with a valid hexadecimal sequence.

If either of these escapes has at least one valid character
for its respective numeric base, it will be processed with that
value. So, for example, `echo -en "\xag" | hexdump -C` shows
bytes `0A 67`, as does the same with `\x0ag` instead of `\xag`.

## 2023-05-15

### Synchronization bug in Coupler

[this issue](https://github.com/HeyPuter/dev-ansi-terminal/issues/1)
was caused by an issue where the `Coupler` between a pipeline and
stdout was still writing after the command was completed.
This happens because the listener loop in the Coupler is async and
might defer writing until after the pipeline has returned.

This was fixed by adding a member to Coupler called `isDone` which
provides a promise that resolves when the Coupler receives the end
of the stream. As a consequence of this it is very important to
ensure that the stream gets closed when commands are finished
executing; right now the `PreparedCommand` class is responsible for
this behaviour, so all commands should be executed via
`PreparedCommand`.

### tail, and echo output chunking

Right now `tail` outputs the last two items sent over the stream,
and doesn't care if these items contain line breaks. For this
implementation to work the same as the "real" tail, it must be
asserted that each item over the stream is a separate line.

Since `ls` is outputting each line on a separate call to
`out.write` it is working correctly with tail, but echo is not.
This could be fixed in `tail` itself, having it check each item
for line breaks while iterating backwards, but I would rather have
metadata on each command specifying how it expects its input
to be chunked so that the shell can accommodate; although this isn't
how it works in "real" bash, it wouldn't affect the behaviour of
shell scripts or input and it's closer to the model of Puter's shell
for JSON-like structured data, which may help with improved
interoperability and better code reuse.

## 2023-05-22

### Catching Up

There hasn't been much to log in the past few days; most updates
to the terminal have been basic command additions.

The next step is adding the redirect operators (`<` and `>`),
which should involve some information written in this dev log.

### Multiple Output Redirect

In Bash, the redirect operator has precedence over pipes. This is
sensible but also results in some situations where a prompt entry
has dormant pieces, for example two output redirects (only one of
them will be used), or an output redirect and a pipe (the pipe will
receive nothing from stdout of the left-hand process).

Here's an example with two output redirects:

```
some-command > a_file.txt > b_file.txt
```

In Puter's ANSI shell we could allow this as a way of splitting
the output. Although, this only really makes sense if stdout will
also be passed through the pipeline instead of consumed by a
redirect, otherwise the behaviour is counterintuitive.

Maybe for this purpose we can have a couple modes of interpretation,
one where the Puter ANSI Shell behaves how Bash would and another
where it behaves in a more convenient way. Shell scripts with no
hashbang would be interpreted the Bash-like way while shell scripts
with a puter-specific hashbang would be interpreted in this more
convenient way.

For now I plan to prioritize the way that seems more logical as it
will help keep the logic of the shell less complicated. I think it's
likely that we'll reach full POSIX compatibility via Bash running in
containers or emulators before the Puter ANSI shell itself reaches
full POSIX compatibility, so for this reason it makes sense to
prioritize making the Puter ANSI shell convenient and powerful over
making it behave like Bash. Additionally, we have a unique situation
where we're not so bound to backwards compatibility as is a
distribution of a personal computer operating system, so we should
take advantage of that where we can.

## 2023-05-23

### Adding more coreutils

- `clear` was very easy; it's just an escape code
- `printenv` was also very easy; most of the effort was already done

### First steps to handling tab-completion

#### Getting desired tab-completion behaviour from input state
Tab-completion needs information about the type of command arguments.
Since commands are modelled, it's possible the model of a command can
provide this information. For example a registered command could
implement `getTabCompleterFor(ARG_SPEC)`.

`ARG_SPEC` would be an identifier for an argument that is understood
by readline. Ex: `{ $: 'positional', pos: 0 }` for the first positional
argument, or `{ $: 'named', name: 'verbose' }` for a named parameter
called `verbose`.

The command model already has a nested model specifying how arguments
are parsed, so this model could describe the behaviour for a
`getArgSpecFromInputState(input, i)`, where `input` is the
current text in readline's buffer and `i` is the cursor position.
This separates the concern of knowing what parameter the user is
typing in from readline, allowing modelled commands to support tab
completion for arbitrary syntaxes.

**revision**

It's better if the command model has just one method which
readline needs to call, ex: `getTabCompleterFromInputState`.
I've left the above explanation as-is however because it's easier
to explain the two halves if its functionality separately.

### Trigger background readdir call on PWD change

When working on the FUSE driver for Puter's filesystem I noticed that
tab completion makes a readdir call upon the user pressing tab which
blocks the tab completion behaviour until the call is finished.
While this works fine on local filesystems, it's very confusing on
remote filesystems where the ping delay will - for a moment - make it
look like tab completion isn't working at all.

Puter's shell can handle this a bit better. Triggering a readdir call
whenever PWD changes will allow tab-completion to have a quicker
response time. However, there's a caveat; the information about what
nodes exist in that directory might be outdated by the time the user
tries to use tab completion.

My first thought was for "tab twice" to invoke a readdir to get the
most recent result, however this conflicts with pressing tab once to
get the completed path and then pressing tab a second time to get
a list of files within that path.

My second thougfht is using ctrl + tab. The terminal will need to
provide some indication to the user that they can do this and what
is happening.

Here are a few thoughts on how to do this with ideal UX:

- after pressing tab:
  - complete the text if possible
  - highlight the completed portion in a **bright** color
    - a dim colour would convey that the completion wasn't input yet
  - display in a **hint bar** the following items:
    - `[Ctrl+Tab]: re-complete with recent data`
    - `[Ctrl+Enter]: more options`

### Implementation of background readdir

The background `readdir` could be invoked in two ways:
- when the current working directory changes
- at a poll interval

These means the **action** of invoking background readdir needs
to be separate from the method by which it is called.

Also, results from a previous `readdir` need to be marked invalid
when the current working directory changes.

There is a possibility that the user might use tab completion before
the first `readdir` is called for a given pwd, which means the method
to get path completions must be async.

if `readdir` is called because of a pwd change, the poll timer should
be reset so that it's not called again too quickly or at the same
time.

#### Concern Mapping

- **PuterANSIShell**
  - does not need to be aware of this feature
- **readline**
  - needs to trap Tab
  - needs to recognize what command is being entered
  - needs to delegate tab completion logic to the command's model
  - does not need to be aware of how tab completion is implemented
- **readdir action**
  - needs WRITE to cached dir lists
- **readdir poll timer**
  - needs READ to cached dir lists to check when they were
    updated
  - needs the path to be polled

#### Order of implementation

- First implementation will **not** have **background readdir**.
  - Interfaces should be appropriate to implement this after.
- When tab completion is working for paths, then readdir caching
  can be implemented.
