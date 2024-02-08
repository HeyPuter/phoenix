import jsonQuery from 'json-query';
import { signals } from '../../ansi-shell/signals';
import { Exit } from './coreutil_lib/exit';

export default {
    name: 'jq',
    input: {
        syncLines: true,
    },
    args: {
        $: 'simple-parser',
        allowPositionals: true,
    },
    execute: async ctx => {
        const { externs } = ctx;
        const { sdkv2 } = externs;

        const { positionals } = ctx.locals;
        const [query] = positionals;
    
        // Read one line at a time
        const { in_, out, err } = ctx.externs;

        let rslv_sigint;
        const p_int = new Promise(rslv => rslv_sigint = rslv);
        ctx.externs.sig.on((signal) => {
            if ( signal === signals.SIGINT ) {
                rslv_sigint({ is_sigint: true });
            }
        });


        let line, done;
        const next_line = async () => {
            let is_sigint = false;
            ({ value: line, done, is_sigint } = await Promise.race([
                p_int, in_.read(),
            ]));
            if ( is_sigint ) {
                throw new Exit(130);
            }
            // ({ value: line, done } = await in_.read());
        }
        for ( await next_line() ; ! done ; await next_line() ) {
            let data; try {
                data = JSON.parse(line);
            } catch (e) {
                await err.write('Error: ' + e.message + '\n');
                continue;
            }
            const result = jsonQuery(query, { data });
            await out.write(JSON.stringify(result.value) + '\n');
        }
    }
}