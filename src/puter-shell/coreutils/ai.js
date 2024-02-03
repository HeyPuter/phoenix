export default {
    name: 'ai',
    args: {
        $: 'simple-parser',
        allowPositionals: true,
    },
    execute: async ctx => {
        const { positionals } = ctx.locals;
        const [ prompt ] = positionals;

        if ( ! prompt ) {
            ctx.externs.err.write('txt2img: missing prompt\n');
            return;
        }

        const { puterShell } = ctx.externs;

        let a_interface, a_method, a_args;

        a_interface = 'puter-chat-completion',
        a_method = 'complete';
        a_args = {
            messages: [
                {
                    role: 'system',
                    content:
                        'You are running inside the Puter terminal via the `ai` command. Refer to yourself as Puter Terminal AI.',
                },
                {
                    role: 'system',
                    content:
                        'If the user asks you to run a command, let them know you are not yet capable of this and instead provide an example.'
                },
                {
                    role: 'system',
                    content:
                        'If the user asks what commands are available, tell them you don\'t yet have the ability to list commands but the `help` command is available for this purpose.'
                },
                {
                    role: 'system',
                    content:
                        [
                            'FAQ, in case the user asks (rephrase these answers in character as Puter Terminal AI):',
                            'Q: What is the command language?',
                            'A: A subset of the POSIX Command Language, commonly known as the shell language.',
                            'Q: Is this POSIX compliant?',
                            'A: Our goal is to eventually be POSIX compliant, but support for most syntax is currently incomplete.',
                            'Q: Is this a real shell?',
                            'A: Yes, this is a real shell. You can interact with Puter\'s filesystem and drivers.',
                            'Q: What is Puter?',
                            'A: Puter is an operating system on the cloud, accessible from your browser. It is designed to be a platform for running applications and services with tools and interfaces you\'re already familiar with.',
                            'Q: Is Puter a real operating system?',
                            'A: Puter has a filesystem, manages cloud resources, and provides online services we call "drivers". It is the higher-level equivalent of a traditional operating system.',
                        ].join(' ')
                },
                {
                    role: 'user',
                    content: prompt
                }
            ]
        };

        const result = await puterShell.command('driver-call', {
            interface: a_interface,
            method: a_method,
            args: a_args,
        });

        const resobj = JSON.parse(await result.text(), null, 2);

        if ( resobj.success !== true ) {
            await ctx.externs.err.write('request failed\n');
            await ctx.externs.err.write(resobj);
            return;
        }

        const message = resobj?.result?.message?.content;

        if ( ! message ) {
            await ctx.externs.err.write('message not found in response\n');
            await ctx.externs.err.write(result);
            return;
        }

        await ctx.externs.out.write(message + '\n');
    }
}
