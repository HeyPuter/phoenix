import assert from 'assert';
import { Context } from "../context.js";

describe('context', () => {
    it ('works', () => {
        const ctx = new Context({ a: 1 });
        const subCtx = ctx.sub({ b: 2 });

        assert.equal(ctx.a, 1);
        assert.equal(ctx.b, undefined);
        assert.equal(subCtx.a, 1);
        assert.equal(subCtx.b, 2);
    }),
    it ('doesn\'t mangle inner-contexts', () => {
        const ctx = new Context({
            plainObject: { a: 1, b: 2, c: 3 },
            contextObject: new Context({ i: 4, j: 5, k: 6 }),
        });
        const subCtx = ctx.sub({
            plainObject: { a: 101 },
            contextObject: { i: 104 },
        });
        assert.equal(subCtx.plainObject.a, 101);
        assert.equal(subCtx.plainObject.b, undefined);

        assert.equal(subCtx.contextObject.i, 104);
        assert.equal(subCtx.contextObject.j, 5);

    })
});
