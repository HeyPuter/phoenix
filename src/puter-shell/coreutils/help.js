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

// TODO: fetch help information from command registry

export default {
    name: 'help',
    args: {
        $: 'simple-parser',
        allowPositionals: true
    },
    execute: async ctx => {
        const { builtins } = ctx.registries;

        const { out } = ctx.externs;

        const heading = txt => {
            out.write(`\x1B[34;1m~ ${txt} ~\x1B[0m\n`);
        };

        heading('available commands');
        for ( const k in builtins ) {
            out.write('  - ' + k + '\n');
        }
        out.write('\n');
        heading('available features');
        out.write('  - pipes; ex: ls | tail -n 2\n')
        out.write('  - redirects; ex: ls > some_file.txt\n')
        out.write('  - simple tab completion\n')
        out.write('  - in-memory command history\n')
        out.write('\n');
        heading('what\'s coming up?');
        out.write('  - keep watching for \x1B[34;1mmore\x1B[0m (est: v0.1.11)\n')
        // out.write('  - \x1B[34;1mcurl\x1B[0m up with your favorite terminal (est: TBA)\n')
    }
}
