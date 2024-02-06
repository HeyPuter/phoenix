import path_ from "path-browserify";

export default {
    name: 'cp',
    args: {
        $: 'simple-parser',
        allowPositionals: true
    },
    execute: async ctx => {
        const { positionals } = ctx.locals;
        const { out, err } = ctx.externs;
        const { filesystem } = ctx.platform;

        if ( positionals.length < 1 ) {
            err.write('mv: missing file operand\n');
            return;
        }

        const srcRelPath = positionals.shift();

        if ( positionals.length < 1 ) {
            const aft = positionals[0];
            err.write(`mv: missing destination file operand after '${aft}'\n`);
            return;
        }

        const dstRelPath = positionals.shift();

        // DRY: also done in mkdir and cat
        const resolve = relPath => {
            if ( relPath.startsWith('/') ) {
                return relPath;
            }
            return path_.resolve(ctx.vars.pwd, relPath);
        }

        const srcAbsPath = resolve(srcRelPath);
        let   dstAbsPath = resolve(dstRelPath);

        await filesystem.copy(srcAbsPath, dstAbsPath);
    }
}