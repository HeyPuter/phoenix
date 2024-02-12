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
import path from "path-browserify";

export default {
    name: 'cat',
    args: {
        $: 'simple-parser',
        allowPositionals: true
    },
    input: {
        syncLines: true,
    },
    output: 'text',
    execute: async ctx => {
        const { positionals, values } = ctx.locals;
        const { filesystem } = ctx.platform;

        const paths = [...positionals];
        if ( paths.length < 1 ) paths.push('-');

        for ( const relPath of paths ) {
            if ( relPath === '-' ) {
                let line, done;
                const next_line = async () => {
                    ({ value: line, done } = await ctx.externs.in_.read());
                    console.log('CAT LOOP', { line, done });
                }
                for ( await next_line() ; ! done ; await next_line() ) {
                    await ctx.externs.out.write(line);
                }
                continue;
            }
            // DRY: also done in mkdir
            const absPath = relPath.startsWith('/') ? relPath :
                path.resolve(ctx.vars.pwd, relPath);

            const result = await filesystem.read(absPath);

            await ctx.externs.out.write(result);
        }
    }
}