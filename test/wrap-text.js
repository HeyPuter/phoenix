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
import assert from 'assert';
import { wrapText } from '../src/util/wrap-text.js';

describe('wrapText', () => {
    const testCases = [
        {
            description: 'should wrap text',
            input: 'Well, hello friends! How are you today?',
            width: 12,
            output: ['Well, hello', 'friends! How', 'are you', 'today?'],
        },
        {
            description: 'should break too-long words onto multiple lines',
            input: 'Antidisestablishmentarianism.',
            width: 20,
            output: ['Antidisestablishmen-', 'tarianism.'],
        },
        {
            description: 'should break too-long words onto multiple lines',
            input: 'Antidisestablishmentarianism.',
            width: 10,
            output: ['Antidises-', 'tablishme-', 'ntarianis-', 'm.'],
        },
        {
            description: 'should break too-long words when there is already text on the line',
            input: 'The longest word I can think of is antidisestablishmentarianism.',
            width: 20,
            output: ['The longest word I', 'can think of is', 'antidisestablishmen-', 'tarianism.'],
        },
        {
            description: 'should return the original text if the width is invalid',
            input: 'Well, hello friends!',
            width: 0,
            output: ['Well, hello friends!'],
        },
    ];
    for (const { description, input, width, output } of testCases) {
        it (description, () => {
            const result = wrapText(input, width);
            for (const line of result) {
                if (typeof width === 'number' && width > 0) {
                    assert.ok(line.length <= width, `Line is too long: '${line}`);
                }
            }
            assert.equal(result.length, output.length, 'Wrong number of lines');
            for (const i in result) {
                assert.equal(result[i], output[i], `Line ${i} doesn't match: expected '${output[i]}', got '${result[i]}'`);
            }
        });
    }
})