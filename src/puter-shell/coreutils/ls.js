// INCONST: called 'path' instead of 'path_' elsewhere
import path_ from "path-browserify";
import columnify from "columnify";
import cli_columns from "cli-columns";

// formatLsTimestamp(): written by AI
function formatLsTimestamp(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000); // Convert Unix timestamp to JavaScript Date
    const now = new Date();

    const optionsCurrentYear = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
    const optionsPreviousYear = { month: 'short', day: 'numeric', year: 'numeric' };

    // Check if the year of the date is the same as the current year
    if (date.getFullYear() === now.getFullYear()) {
        // Format for current year
        return date.toLocaleString('en-US', optionsCurrentYear)
            .replace(',', ''); // Remove comma from time);
    } else {
        // Format for previous year
        return date.toLocaleString('en-US', optionsPreviousYear)
            .replace(',', ''); // Remove comma from time);
    }
}

export default {
    name: 'ls',
    args: {
        $: 'simple-parser',
        allowPositionals: true,
        options: {
            all: {
                type: 'boolean',
                short: 'a'
            },
            long: {
                type: 'boolean',
                short: 'l'
            },
            time: {
                type: 'string',
            }
        }
    },
    execute: async ctx => {
        console.log('ls context', ctx);
        console.log('env.COLS', ctx.env.COLS);
        // ctx.params to access processed args
        // ctx.args to access raw args
        const { positionals, values, pwd } = ctx.locals;
        const { puterShell } = ctx.externs;

        const paths = positionals.length < 1
            ? [pwd] : positionals ;


        // DRY: also done in mkdir, cat, and mv
        const resolve = relPath => {
            if ( relPath.startsWith('/') ) {
                return relPath;
            }
            return path_.resolve(ctx.vars.pwd, relPath);
        }

        const showHeadings = paths.length > 1 ? async ({ i, path }) => {
            if ( i !== 0 ) ctx.externs.out.write('\n');
            await ctx.externs.out.write(path + ':\n');
        } : () => {};
        
        for ( let i=0 ; i < paths.length ; i++ ) {
            let path = paths[i];
            await showHeadings({ i, path });
            path = resolve(path);
            const result = await puterShell.command('list', { path });
            console.log('ls items', result);

            // const write_item = values.long
            //     ? item => {
            //         let line = '';
            //         line += item.is_dir ? 'd' : item.is_symlink ? 'l' : '-';
            //         line += ' ';
            //         line += item.is_dir ? 'N/A' : item.size;
            //         line += ' ';
            //         line += item.name;
            //         return line;
            //     }
            //     : item => item.name
            //     
            const icons = {
                // d: '📁',
                // l: '🔗',
            };

            const colors = {
                'd-': 'blue',
                'ds': 'magenta',
                'l-': 'cyan',
            };

            const col_to_ansi = {
                blue: '34',
                cyan: '36',
                green: '32',
                magenta: '35',
            };

            const col = (type, text) => {
                if ( ! colors[type] ) return text;
                return `\x1b[${col_to_ansi[colors[type]]};1m${text}\x1b[0m`;
            }



            if ( values.long ) {
                const time_properties = {
                    mtime: 'modified',
                    ctime: 'created',
                    atime: 'accessed',
                };

                const time = values.time || 'mtime';
                const items = result.map(item => {
                    const ts = item[time_properties[time]];
                    const www = 
                        (!item.subdomains) ? 'N/A' :
                        (!item.subdomains.length) ? '---' :
                        item.subdomains[0].address + (
                            item.subdomains.length > 1
                                ? ` +${item.subdomains.length - 1}`
                                : ''
                        )
                    let type = item.is_dir ? 'd-' : item.is_symlink ? 'l-' : '--';
                    if ( item.subdomains && item.subdomains.length ) {
                        type = type.slice(0, 1) + 's';
                    }
                    return {
                        type: icons[type] || type,
                        name: col(type, item.name),
                        www: www,
                        [time_properties[time]]: formatLsTimestamp(ts),
                    };
                });
                const text = columnify(items, {
                    columns: ['type', 'name', 'www', time_properties[time]],
                    maxLineWidth: ctx.env.COLS,
                    config: {
                        // json: {
                        //     maxWidth: 20,
                        // }
                    }
                });
                const lines = text.split('\n');
                for ( const line of lines ) {
                    await ctx.externs.out.write(line + '\n');
                }
                continue;
            }

            console.log('what is', cli_columns);

            const names = result.map(item => {
                let type = item.is_dir ? 'd-' : item.is_symlink ? 'l-' : '--';
                if ( item.subdomains && item.subdomains.length ) {
                    type = type.slice(0, 1) + 's';
                }
                return col(type, item.name);
            });
            const text = cli_columns(names, {
                width: ctx.env.COLS,
            })

            const lines = text.split('\n');

            for ( const line of lines ) {
                await ctx.externs.out.write(line + '\n');
            }
        }
    }
};
