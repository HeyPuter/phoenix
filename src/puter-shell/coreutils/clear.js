export default {
    name: 'clear',
    args: {
        // TODO: add 'none-parser'
        $: 'simple-parser',
        allowPositionals: false
    },
    execute: async ctx => {
        ctx.externs.out.write('\x1B[H\x1B[2J');
    }
};
