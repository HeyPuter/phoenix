import { processEscapes } from "./coreutil_lib/echo_escapes";

export default {
    name: 'echo',
    args: {
        $: 'simple-parser',
        allowPositionals: true,
        options: {
            n: {
                type: 'boolean'
            },
            e: {
                type: 'boolean'
            },
            E: {
                type: 'boolean'
            }
        }
    },
    execute: async ctx => {
        const { positionals, values } = ctx.locals;

        let output = '';
        let notFirst = false;
        for ( const positional of positionals ) {
            if ( notFirst ) {
                output += ' ';
            } else notFirst = true;
            output += positional;
        }

        if ( ! values.n ) {
            output += '\n';
        }

        if ( values.e && ! values.E ) {
            console.log('processing');
            output = processEscapes(output);
        }

        const lines = output.split('\n');
        for ( let i=0 ; i < lines.length ; i++ ) {
            const line = lines[i];
            const isLast = i === lines.length - 1;
            await ctx.externs.out.write(line + (isLast ? '' : '\n'));
        }
    }
}
