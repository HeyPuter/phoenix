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
import { MakeTestContext } from './harness.js'
import builtins from '../../src/puter-shell/coreutils/__exports__.js';

export const runSortTests = () => {
    describe('sort', function () {
        const testCases = [
            {
                description: 'reads from stdin if no parameter is given',
                options: {},
                positionals: [],
                stdin: 'a\nb\nc\n',
                expectedStdout: 'a\nb\nc\n',
                expectedStderr: '',
            },
            {
                description: 'reads from stdin if parameter is `-`',
                options: {},
                positionals: ['-'],
                stdin: 'a\nb\nc\n',
                expectedStdout: 'a\nb\nc\n',
                expectedStderr: '',
            },
            {
                description: 'sorts the output by byte value by default',
                options: {},
                positionals: ['-'],
                stdin: 'awesome\nCOOL\nAmazing\n!\ncold\n123\n',
                expectedStdout: '!\n123\nAmazing\nCOOL\nawesome\ncold\n',
                expectedStderr: '',
            },
            {
                description: 'keeps duplicates by default',
                options: {},
                positionals: ['-'],
                stdin: 'a\na\na\n',
                expectedStdout: 'a\na\na\n',
                expectedStderr: '',
            },
            {
                description: 'removes duplicates when -u/--unique is specified',
                options: { unique: true },
                positionals: ['-'],
                stdin: 'a\nd\na\nb\nc\nc\nb\na\n',
                expectedStdout: 'a\nb\nc\nd\n',
                expectedStderr: '',
            },
            // TODO: Test with files once the harness supports that.
        ];
        for (const { description, options, positionals, stdin, expectedStdout, expectedStderr } of testCases) {
            it(description, async () => {
                let ctx = MakeTestContext(builtins.sort, { positionals, values: options, stdinInputs: [stdin] });
                try {
                    const result = await builtins.sort.execute(ctx);
                    assert.equal(result, undefined);
                } catch (e) {
                    assert.fail(e);
                }
                assert.equal(ctx.externs.out.output, expectedStdout, 'wrong output written to stdout');
                assert.equal(ctx.externs.err.output, expectedStderr, 'wrong output written to stderr');
            });
        }
    });
}