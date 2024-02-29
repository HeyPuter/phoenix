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
import { Exit } from './coreutil_lib/exit.js';

export default {
    name: 'tail',
    usage: 'tail [OPTIONS]',
    description: 'Read standard input and print the last lines to standard output.\n\n' +
        'Defaults to 10 lines unless --lines is given.',
    input: {
        syncLines: true
    },
    args: {
        $: 'simple-parser',
        allowPositionals: true,
        options: {
            lines: {
                description: 'Print the last COUNT lines',
                type: 'string',
                short: 'n',
                valueName: 'COUNT',
            }
        }
    },
    execute: async ctx => {
        const { in_, out } = ctx.externs;

        let lineCount = 10;

        if (ctx.locals.values.lines) {
            const parsedLineCount = Number.parseFloat(ctx.locals.values.lines);
            if (isNaN(parsedLineCount) || ! Number.isInteger(parsedLineCount) || parsedLineCount < 1) {
                await ctx.externs.err.write(`tail: Invalid number of lines '${ctx.locals.values.lines}'\n`);
                throw new Exit(1);
            }
            lineCount = parsedLineCount;
        }

        let items = await in_.collect();
        if ( items.length > lineCount ) {
            items = items.slice(-1 * lineCount);
        }

        for ( const item of items ) {
            await out.write(item);
        }
    }
};
