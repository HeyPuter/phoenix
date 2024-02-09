import path_ from "path-browserify";
import { Pipeline } from "../../ansi-shell/pipeline/Pipeline";

export class ScriptCommandProvider {
    async lookup (id, { ctx }) {
        const is_path = id.match(/^[.\/]/);
        if ( ! is_path ) return undefined;

        const absPath = id.startsWith('/') ? id :
            path_.resolve(ctx.vars.pwd, id);
        
        const { filesystem } = ctx.platform;

        const script_blob = await filesystem.read(absPath);
        const script_text = await script_blob.text();

        console.log('result though?', script_text);

        // note: it's still called `parseLineForProcessing` but
        // it has since been extended to parse the entire file
        const ast = ctx.externs.parser.parseScript(script_text);
        const statements = ast[0].statements;

        return {
            async execute (ctx) {
                for (const stmt of statements) {
                    const pipeline = await Pipeline.createFromAST(ctx, stmt);
                    await pipeline.execute(ctx);
                }
            }
        };
    }
}