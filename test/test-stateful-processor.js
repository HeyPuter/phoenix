import assert from 'assert';

import { StatefulProcessorBuilder } from '../src/util/statemachine.js';

describe('StatefulProcessor', async () => {
    it ('should satisfy: simple example', async () => {
        const messages = [];
        const processor = new StatefulProcessorBuilder()
            .state('start', async ctx => {
                messages.push('start');
                ctx.setState('intermediate');
            })
            .state('intermediate', async ctx => {
                messages.push('intermediate');
                ctx.setState('end');
            })
            .build();
        await processor.run();
        assert.deepEqual(messages, ['start', 'intermediate']);
    });
    it ('should handle transition', async () => {
        const messages = [];
        const processor = new StatefulProcessorBuilder()
            .state('start', async ctx => {
                messages.push('start');
                ctx.setState('intermediate');
            })
            .onTransitionTo('intermediate', ctx => {
                messages.push('transition');
                ctx.locals.test1 = true;
            })
            .state('intermediate', async ctx => {
                messages.push('intermediate');
                assert.equal(ctx.locals.test1, true);
                ctx.setState('end');
            })
            .build();
        await processor.run();
        assert.deepEqual(messages, [
            'start', 'transition', 'intermediate'
        ]);
    });
    it ('should handle beforeAll', async () => {
        const messages = [];
        const processor = new StatefulProcessorBuilder()
            .state('start', async ctx => {
                messages.push('start');
                assert.equal(ctx.locals.test2, 'undefined_a');
                ctx.setState('intermediate');
            })
            .beforeAll('example-hook', async ctx => {
                messages.push('before');
                ctx.locals.test2 += '_a';
            })
            .state('intermediate', async ctx => {
                messages.push('intermediate');
                assert.equal(ctx.locals.test2, 'undefined_a');
                ctx.setState('end');
            })
            .build();
        await processor.run();
        assert.deepEqual(messages, [
            'before', 'start', 'before', 'intermediate'
        ]);
    });
    it ('should fail when export is missing', async () => {
        const messages = [];
        const processor = new StatefulProcessorBuilder()
            .external('test3', { required: true })
            .state('start', async ctx => {
                ctx.setState('end');
            })
            .build();
        await assert.rejects(processor.run());
    });
    it ('should succeed when export is provided', async () => {
        const messages = [];
        const processor = new StatefulProcessorBuilder()
            .external('test3', { required: true })
            .state('start', async ctx => {
                messages.push(ctx.externs.test3)
                ctx.setState('end');
            })
            .build();
        await processor.run({ test3: 'test4' });
        assert.deepEqual(messages, ['test4']);
    });
})

