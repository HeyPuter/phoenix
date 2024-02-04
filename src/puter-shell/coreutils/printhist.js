export default {
    name: 'printhist',
    args: {
        $: 'simple-parser',
        allowPositionals: true,
    },
    execute: async ctx => {
        const { historyManager } = ctx.externs;
        console.log('test????', ctx);
        for ( const item of historyManager.items ) {
            await ctx.externs.out.write(item + '\n');
        }
    }
}