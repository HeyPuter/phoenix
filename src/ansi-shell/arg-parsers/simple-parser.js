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
            if ( ! ctx.locals.args ) debugger;
            result = parseArgs({ ...spec, args: ctx.locals.args });
        } catch (e) {
            ctx.externs.out.write(
                '\x1B[31;1m' +
                'error parsing arguments: ' +
                e.message + '\x1B[0m\n');
            ctx.cmdExecState.valid = false;
            return;
        }
        ctx.locals.values = result.values;
        ctx.locals.positionals = result.positionals;
    }
}
