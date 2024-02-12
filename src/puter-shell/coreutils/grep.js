const lxor = (a, b) => a ? !b : b;

import path_ from "path-browserify";

export default {
    name: 'grep',
    input: {
        syncLines: true,
    },
    args: {
        $: 'simple-parser',
        allowPositionals: true,
        options: {
            'ignore-case': {
                type: 'boolean',
                short: 'i'
            },
            'invert-match': {
                type: 'boolean',
                short: 'v'
            },
            'line-number': {
                type: 'boolean',
                short: 'n'
            },
            recursive: {
                type: 'boolean',
                short: 'r'
            }
        },
    },
    output: 'text',
    execute: async ctx => {
        const { positionals, values } = ctx.locals;
        const { filesystem } = ctx.platform;

        const [ pattern, ...files ] = positionals;

        const do_grep_dir = async ( path ) => {
            const entries = await filesystem.readdir(path);

            for ( const entry of entries ) {
                const entryPath = path_.join(path, entry.name);

                if ( entry.type === 'directory' ) {
                    if ( values.recursive ) {
                        await do_grep_dir(entryPath);
                    }
                } else {
                    await do_grep_file(entryPath);
                }
            }
        }
        
        const do_grep_line = async ( line ) => {
            if ( line.endsWith('\n') ) line = line.slice(0, -1);
            const re = new RegExp(
                pattern,
                values['ignore-case'] ? 'i' : ''
            );

            console.log(
                'Attempting to match line',
                line,
                'with pattern',
                pattern,
                'and re',
                re,
                'and parameters',
                values
            );

            if ( lxor(values['invert-match'], re.test(line)) ) {
                const lineNumber = values['line-number'] ? i + 1 : '';
                const lineToPrint =
                        lineNumber ? lineNumber + ':' : '' +
                        line;
                    
                console.log(`LINE{${lineToPrint}}`);
                await ctx.externs.out.write(lineToPrint + '\n');
            }
        }

        const do_grep_lines = async ( lines ) => {
            for ( let i=0 ; i < lines.length ; i++ ) {
                const line = lines[i];

                await do_grep_line(line);
            }
        }

        const do_grep_file = async ( path ) => {
            console.log('about to read path', path);
            const data_blob = await filesystem.read(path);
            const data_string = await data_blob.text();

            const lines = data_string.split('\n');

            await do_grep_lines(lines);
        }



        if ( files.length === 0 ) {
            if ( values.recursive ) {
                files.push('.');
            } else {
                files.push('-');
            }
        }

        console.log('FILES', files);

        for ( let file of files ) {
            if ( file === '-' ) {
                for ( ;; ) {
                    const { value, done } = await ctx.externs.in_.read();
                    if ( done ) break;
                    await do_grep_line(value);
                }
            } else {
                if ( ! file.startsWith('/') ) {
                    file = path_.resolve(ctx.vars.pwd, file);
                }
                const stat = await filesystem.stat(file);
                if ( stat.is_dir ) {
                    if ( values.recursive ) {
                        await do_grep_dir(file);
                    } else {
                        await ctx.externs.err.write('grep: ' + file + ': Is a directory\n');
                    }
                } else {
                    await do_grep_file(file);
                }
            }
        }
    }
}