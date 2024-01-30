import path_ from "path-browserify";

// DRY: also done in many other places
const resolve = (ctx, relPath) => {
    if ( relPath.startsWith('/') ) {
        return relPath;
    }
    console.log('wrong context?', ctx);
    return path_.resolve(ctx.vars.pwd, relPath);
}

export class FileCompleter {
    async getCompetions (ctx, inputState) {
        const { puterShell } = ctx.externs;

        if ( inputState.input === '' ) {
            return [];
        }

        let path = resolve(ctx, inputState.input);
        let dir = path_.dirname(path);
        let base = path_.basename(path);

        const completions = [];

        const result = await puterShell.command('list', { path: dir });
        if ( result == undefined ) {
            return [];
        }

        for ( const item of result ) {
            if ( item.name.startsWith(base) ) {
                completions.push(item.name.slice(base.length));
            }
        }
        
        return completions;
    }
}
