import path from "path-browserify";
import { validate_string } from "./coreutil_lib/validate";
import { EMPTY } from "../../util/singleton";

// DRY: very similar to `cd`
export default {
    name: 'mkdir',
    args: {
        $: 'simple-parser',
        allowPositionals: true,
        options: {
            parents: {
                type: 'boolean',
                short: 'p'
            }
        }
    },
    decorators: { errors: EMPTY },
    execute: async ctx => {
        // ctx.params to access processed args
        // ctx.args to access raw args
        const { positionals, values } = ctx.locals;
        const { filesystem } = ctx.platform;

        let [ target ] = positionals;

        validate_string(target, { name: 'path' });

        if ( ! target.startsWith('/') ) {
            target = path.resolve(ctx.vars.pwd, target);
        }

        const result = await filesystem.mkdir(target);

        if ( result.$ === 'error' ) {
            throw new Error(result.message);
        }
    }
};
