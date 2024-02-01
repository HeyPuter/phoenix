export default {
    name: 'sample-data',
    args: {
        $: 'simple-parser',
        allowPositionals: true,
    },
    execute: async ctx => {
        const { positionals } = ctx.locals;
        const [ what ] = positionals;

        if ( what === 'blob' ) {
            // Hello world blob
            const blob = new Blob([ 'Hello, world!' ]);
            console.log('before writing');
            await ctx.externs.out.write(blob);
            console.log('after writing');
            return;
        }

        console.log('before writing');
        ctx.externs.out.write('Hello, World!\n');
        console.log('after writing');
    }
}
