export default {
    name: 'txt2img',
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

        let a_interface, a_method, a_args;

        a_interface = 'puter-image-generation',
        a_method = 'generate';
        a_args = { prompt };

        const result = await drivers.call({
            interface: a_interface,
            method: a_method,
            args: a_args,
        });

        await ctx.externs.out.write(result);
    }
}
