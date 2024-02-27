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
export default {
    name: 'tail',
    usage: 'tail [OPTIONS]',
    description: 'Read standard input and print the last lines to standard output.',
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
        // ctx.params to access processed args
        // ctx.args to access raw args

        const { in_, out } = ctx.externs;

        const amount = Number.parseInt(ctx.locals.values.lines);

        let items = await in_.collect();
        if ( items.length > amount ) {
            items = items.slice(-1 * amount);
        }

        for ( const item of items ) {
            await out.write(item);
        }
    }
};
