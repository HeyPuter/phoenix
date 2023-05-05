import assert from 'assert';
import { Uint8List } from '../src/util/bytes.js';

describe('bytes', () => {
    describe('Uint8List', () => {
        it ('should satisfy: 5 bytes of input', () => {
            const list = new Uint8List();
            for ( let i = 0 ; i < 5 ; i++ ) {
                list.append(i);
            }
            const array = list.toArray();
            assert.equal(array.length, 5);
            for ( let i = 0 ; i < 5 ; i++ ) {
                assert.equal(array[i], i);
            }
        })
    })
})