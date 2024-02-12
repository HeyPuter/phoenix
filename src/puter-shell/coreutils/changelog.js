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
// INCONST: called 'path' instead of 'path_' elsewhere
import path_ from "path-browserify";
import { SHELL_VERSIONS } from "../../meta/versions.js";

export default {
    name: 'changelog',
    args: {
        $: 'simple-parser',
        allowPositionals: false
    },
    execute: async ctx => {
        for ( const version of SHELL_VERSIONS ) {
            ctx.externs.out.write(`\x1B[35;1m[v${version.v}]\x1B[0m\n`);
            for ( const change of version.changes ) {
                ctx.externs.out.write(`\x1B[32;1m+\x1B[0m ${change}\n`);
            }
        }
    }
};

