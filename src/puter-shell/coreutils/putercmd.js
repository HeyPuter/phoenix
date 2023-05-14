export default {
    name: 'putercmd',
    args: {
        $: 'simple-parser',
        allowPositionals: true
    },
    execute: async ctx => {
        const { puterShell } = ctx.externs;
        const { positionals } = ctx.locals;

        const [commandName, rawJSON] = positionals;

        if (
            positionals.length < 1 ||
            commandName === 'help' ||
            commandName === '--help'
        ) {
            ctx.externs.err.write(`usage: putercmd <commadName> <JSON>\n`);
            return;
        }

        const commandParameters = JSON.parse(rawJSON ?? '{}');

        const result = await puterShell.command(commandName, commandParameters);

        if ( result.$ === 'error' ) {
            ctx.externs.err.write('putercall: error: ' + result.message + '\n');
            return;
        }

        ctx.externs.out.write(JSON.stringify(data, undefined, '  ') + '\n');
    }
}
