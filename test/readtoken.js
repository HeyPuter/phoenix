import assert from 'assert';
import { readtoken, TOKENS } from '../src/ansi-shell/readtoken.js';

describe('readtoken', () => {
    const tcases = [
        {
            desc: 'should accept unquoted string',
            input: 'asdf',
            expected: ['asdf']
        },
        {
            desc: 'should accept leading spaces',
            input: '   asdf',
            expected: ['asdf']
        },
        {
            desc: 'should accept trailing spaces',
            input: 'asdf   ',
            expected: ['asdf']
        },
        {
            desc: 'should expected quoted string',
            input: '"asdf"',
            expected: ['asdf']
        },
        {
            desc: 'should recognize pipe with no whitespace',
            input: 'asdf|zxcv',
            expected: ['asdf', TOKENS['|'], 'zxcv']
        },
        {
            desc: 'mixed quoted and unquoted should work',
            input: '"asdf" zxcv',
            expected: ['asdf', 'zxcv']
        },
    ];
    for ( const { desc, input, expected } of tcases ) {
        it(desc, () => {
            assert.deepEqual(readtoken(input), expected)
        });
    }
})