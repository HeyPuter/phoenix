export default {
    name: 'printenv',
    args: {
        // TODO: add 'none-parser'
        $: 'simple-parser',
        allowPositionals: false
    },
    execute: async ctx => {
        const env = ctx.env;
        const out = ctx.externs.out;

        for ( const k in env ) {
            out.write(`${k}=${env[k]}\n`);
        }
    }
};
