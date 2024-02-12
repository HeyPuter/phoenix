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

        const { drivers } = ctx.platform;
        const { chatHistory } = ctx.plugins;

        let a_interface, a_method, a_args;

        a_interface = 'puter-chat-completion',
        a_method = 'complete';
        a_args = {
            messages: [
                ...chatHistory.get_messages(),
                {
                    role: 'user',
                    content: prompt,
                }
            ],
        };

        console.log('THESE ARE THE MESSAGES', a_args.messages);

        const result = await drivers.call({
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

        chatHistory.add_message(resobj?.result?.message);

        await ctx.externs.out.write(message + '\n');
    }
}
