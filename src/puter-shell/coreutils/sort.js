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
import { resolveRelativePath } from '../../util/path.js';

export default {
    name: 'sort',
    usage: 'sort [FILE...]',
    description: 'Sort the combined lines from the files provided, and output them.\n\n' +
        'If no FILE is specified, or FILE is `-`, read standard input.',
    input: {
        syncLines: true
    },
    args: {
        $: 'simple-parser',
        allowPositionals: true,
        options: {
            output: {
                description: 'Output to this file, instead of standard output',
                type: 'string',
                short: 'o'
            },
            unique: {
                description: 'Remove duplicates of previous lines',
                type: 'boolean',
                short: 'u'
            },
        }
    },
    execute: async ctx => {
        const { in_, out, err } = ctx.externs;
        const { positionals, values } = ctx.locals;
        const { filesystem } = ctx.platform;

        let relPaths = [...positionals];
        if (relPaths.length === 0) {
            relPaths.push('-');
        }

        const lines = [];

        for (const relPath of relPaths) {
            if (relPath === '-') {
                lines.push(...await in_.collect());
            } else {
                const absPath = resolveRelativePath(ctx.vars, relPath);
                const fileData = await filesystem.read(absPath);
                // DRY: Similar logic in wc and tail
                if (fileData instanceof Blob) {
                    const arrayBuffer = await fileData.arrayBuffer();
                    const fileText = new TextDecoder().decode(arrayBuffer);
                    lines.push(...fileText.split(/\n|\r|\r\n/).map(it => it + '\n'));
                } else if (typeof fileData === 'string') {
                    lines.push(...fileData.split(/\n|\r|\r\n/).map(it => it + '\n'));
                } else {
                    // ArrayBuffer or TypedArray
                    const fileText = new TextDecoder().decode(fileData);
                    lines.push(...fileText.split(/\n|\r|\r\n/).map(it => it + '\n'));
                }
            }
        }

        lines.sort();

        let resultLines = lines;
        if (values.unique) {
            resultLines = lines.filter((value, index, array) => {
                return !index || value !== array[index - 1];
            });
        }

        if (values.output) {
            const outputPath = resolveRelativePath(ctx.vars, values.output);
            await filesystem.write(outputPath, resultLines.join(''));
        } else {
            for (const line of resultLines) {
                await out.write(line);
            }
        }
    }
};
