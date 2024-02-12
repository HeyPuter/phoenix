export default {
    name: 'driver-call',
    args: {
        $: 'simple-parser',
        allowPositionals: true,
    },
    execute: async ctx => {
        const { positionals } = ctx.locals;
        const [ method, json ] = positionals;

        const { drivers } = ctx.platform;

        let a_interface, a_method, a_args;
        if ( method === 'test' ) {
            // a_interface = 'puter-kvstore';
            // a_method = 'get';
            // a_args = { key: 'something' };
            a_interface = 'puter-image-generation',
            a_method = 'generate';
            a_args = {
                prompt: 'a blue cat',
            };
        } else {
            [a_interface, a_method] = method.split(':');
            try {
                a_args = JSON.parse(json);
            } catch (e) {
                a_args = {};
            }
        }

        const result = await drivers.call({
            interface: a_interface,
            method: a_method,
            args: a_args,
        });

        await ctx.externs.out.write(result);
    }
}
