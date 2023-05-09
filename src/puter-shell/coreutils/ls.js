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
    execute: async ctx => {
        // ctx.params to access processed args
        // ctx.args to access raw args
        const { positionals, values, pwd } = ctx.locals;
        const { puterShell } = ctx.externs;

        const paths = positionals.length < 1
            ? [pwd] : positionals ;
        
        for ( const path of paths ) {
            const result = await puterShell.command('list', { path });
            for ( const item of result ) {
                ctx.externs.out.write(item.name + '\n');
            }
        }
    }
};
