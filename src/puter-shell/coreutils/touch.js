import path_ from "path-browserify";

export default {
    name: 'touch',
    args: {
        $: 'simple-parser',
        allowPositionals: true
    },
    execute: async ctx => {
        const { positionals } = ctx.locals;
        const { filesystem } = ctx.platform;

        if ( positionals.length === 0 ) {
            await ctx.externs.err.write('touch: missing file operand');
            return;
        }

        // DRY: also done in mkdir, cat, mv, and ls
        const resolve = relPath => {
            if ( relPath.startsWith('/') ) {
                return relPath;
            }
            return path_.resolve(ctx.vars.pwd, relPath);
        }

        for ( let i=0 ; i < positionals.length ; i++ ) {
            const path = resolve(positionals[i]);
            
            let stat = null;
            try {
                stat = await filesystem.stat(path);
            } catch (e) {
                if ( e.code !== 'subject_does_not_exist' ) throw e;
            }

            if ( stat ) continue;

            await filesystem.write(path, '');
        }
    }
}
