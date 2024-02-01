import jsonQuery from 'json-query';

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


        console.log('input', in_);

        let line, done;
        const next_line = async () => {
            ({ value: line, done } = await in_.read());
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