import path from "path-browserify";

// TODO: fetch help information from command registry

export default {
    name: 'help',
    args: {
        $: 'simple-parser',
        allowPositionals: true
    },
    execute: async ctx => {
        const { commands } = ctx.registries;

        const { out } = ctx.externs;

        const heading = txt => {
            out.write(`\x1B[34;1m~ ${txt} ~\x1B[0m\n`);
        };

        heading('available commands');
        for ( const k in commands ) {
            out.write('  - ' + k + '\n');
        }
        out.write('\n');
        heading('available features');
        out.write('  - pipes; ex: ls | tail -n 2\n')
        out.write('  - redirects; ex: ls > some_file.txt\n')
        out.write('  - simple tab completion\n')
        out.write('  - in-memory command history\n')
        out.write('\n');
        heading('what\'s coming up?');
        out.write('  - keep watching for \x1B[34;1mmore\x1B[0m (est: v0.1.10)\n')
        // out.write('  - \x1B[34;1mcurl\x1B[0m up with your favorite terminal (est: TBA)\n')
    }
}
