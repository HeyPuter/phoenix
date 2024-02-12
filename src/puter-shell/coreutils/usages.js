export default {
    name: 'usages',
    args: {
        $: 'simple-parser',
        allowPositionals: true,
    },
    execute: async ctx => {
        const { positionals } = ctx.locals;

        const { drivers } = ctx.platform;

        const result = await drivers.usage();

        await ctx.externs.out.write(JSON.stringify(result, undefined, 2));
    }
}
