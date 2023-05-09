import { parseArgs } from '@pkgjs/parseargs';

export default {
    name: 'simple-parser',
    process (ctx, spec) {
        console.log({
            ...spec,
            args: ctx.locals.args
        });
        let result;
        try {
            result = parseArgs({ ...spec, args: ctx.locals.args });
        } catch (e) {
            ctx.externs.out.write('error parsing arguments: ' +
                e.message + '\n');
            ctx.locals.valid = false;
            return;
        }
        ctx.locals.values = result.values;
        ctx.locals.positionals = result.positionals;
    }
}
