/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import path_ from "path-browserify";
import { Pipeline } from "../../ansi-shell/pipeline/Pipeline.js";
import { resolveRelativePath } from '../../util/path.js';

export class ScriptCommandProvider {
    async lookup (id, { ctx }) {
        const is_path = id.match(/^[.\/]/);
        if ( ! is_path ) return undefined;

        const absPath = resolveRelativePath(ctx.vars, id);
        
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