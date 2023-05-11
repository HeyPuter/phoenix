export default {
    name: 'tail',
    args: {
        $: 'simple-parser',
        allowPositionals: true,
        options: {
            lines: {
                type: 'string',
                short: 'n'
            }
        }
    },
    execute: async ctx => {
        // ctx.params to access processed args
        // ctx.args to access raw args

        const { in_, out } = ctx.externs;

        const amount = Number.parseInt(ctx.locals.values.lines);

        let items = await in_.collect();
        if ( items.length > amount ) {
            items = items.slice(-1 * amount);
        }

        for ( const item of items ) {
            await out.write(item);
        }
    }
};
