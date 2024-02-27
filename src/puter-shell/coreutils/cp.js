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
import { Exit } from "./coreutil_lib/exit.js";

export default {
    name: 'cp',
    usage: ['cp [OPTIONS] SOURCE DESTINATION', 'cp [OPTIONS] SOURCE... DIRECTORY'],
    description: 'Copy the SOURCE to DESTINATION, or multiple SOURCE(s) to DIRECTORY.',
    args: {
        $: 'simple-parser',
        allowPositionals: true,
        options: {
            recursive: {
                description: 'Copy directories recursively',
                type: 'boolean',
                short: 'R'
            }
        }
    },
    execute: async ctx => {
        const { positionals, values } = ctx.locals;
        const { out, err } = ctx.externs;
        const { filesystem } = ctx.platform;

        if ( positionals.length < 1 ) {
            err.write('cp: missing file operand\n');
            throw new Exit(1);
        }

        const srcRelPath = positionals.shift();

        if ( positionals.length < 1 ) {
            const aft = positionals[0];
            err.write(`cp: missing destination file operand after '${aft}'\n`);
            throw new Exit(1);
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

        const srcStat = await filesystem.stat(srcAbsPath);
        if ( srcStat && srcStat.is_dir && ! values.recursive ) {
            err.write(`cp: -R not specified; skipping directory '${srcRelPath}'\n`);
            throw new Exit(1);
        }

        await filesystem.copy(srcAbsPath, dstAbsPath);
    }
}