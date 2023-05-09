export default {
    name: 'ls',
    args: {
        $: 'simple-parser',
        allowPositionals: true,
        options: {
            all: {
                type: 'boolean',
                short: 'a'
            }
        }
    },
    invoke: ctx => {
        // ctx.params to access processed args
        // ctx.args to access raw args

        const text = JSON.stringify({
            positionals: ctx.locals.positionals,
            values: ctx.locals.values,
        });
        ctx.externs.out.write(text + '\n');
    }
};
