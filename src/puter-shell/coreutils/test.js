export default {
    name: 'test',
    args: {
        $: 'simple-parser',
        allowPositionals: true,
    },
    execute: async ctx => {
        const { historyManager } = ctx.externs;
        const { chatHistory } = ctx.plugins;


        console.log('test????', chatHistory.get_messages());
    }
}
