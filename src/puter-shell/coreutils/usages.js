export default {
    name: 'usages',
    args: {
        $: 'simple-parser',
        allowPositionals: true,
    },
    execute: async ctx => {
        const { positionals } = ctx.locals;

        const { puterShell } = ctx.externs;

        const result = await puterShell.command('driver-usage');

        await ctx.externs.out.write(JSON.stringify(result, undefined, 2));
    }
}
