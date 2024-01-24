import path from "path-browserify";

export default {
    name: 'mv',
    args: {
        $: 'simple-parser',
        allowPositionals: true
    },
    execute: async ctx => {
        const { positionals } = ctx.locals;
        const { out, err, puterShell } = ctx.externs;

        let isErr = false;

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
            return path.resolve(ctx.vars.pwd, relPath);
        }

        const srcAbsPath = resolve(srcRelPath);
        let   dstAbsPath = resolve(dstRelPath);

        // TODO: check if destination is a directory
        const statOfDst = await puterShell.command(
            'call-puter-api', {
                command: 'stat',
                params: { path: dstAbsPath }
            }
        );

        let isDir = statOfDst.$ !== 'error' && statOfDst.is_dir;

        if ( statOfDst.$ === 'error' ) {
            if ( statOfDst.status === 404 ) console.log('YES IS 404');
        }

        console.log('dest is dir?', isDir);

        let new_name = null;
        // if ( ! isDir ) {
        //     new_name = path.basename(dstAbsPath);
        //     dstAbsPath = path.dirname(dstAbsPath);
        // }

        const result = await puterShell.command(
            'fs:move', {
                source: srcAbsPath,
                // ...(new_name ? { new_name } : {}),
                destination: dstAbsPath,
            }
        );
    }
}