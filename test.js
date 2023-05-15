import { parseArgs } from '@pkgjs/parseargs';

const spec = {
    allowPositionals: true,
    options: {
        all: {
            type: 'boolean',
            short: 'a'
        },
        'human-readable': {
            type: 'boolean',
            short: 'h'
        }
    }
};

const args = [
    '-ah',
    './some-dir'
];

const result = parseArgs({ ...spec, args })
console.log(JSON.stringify(result, undefined, '  '));
