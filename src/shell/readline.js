import { Uint8List } from "../util/bytes";
import { Log } from "../util/log";
import { StatefulProcessorBuilder } from "../util/statemachine";
import { CSI_HANDLERS } from "./rl_csi_handlers";

const decoder = new TextDecoder();

const CHAR_LF = '\n'.charCodeAt(0);
const CHAR_CR = '\r'.charCodeAt(0);

const cc = chr => chr.charCodeAt(0);

const ReadlineProcessorBuilder = builder => builder
    // TODO: import these constants from a package
    .constant('CHAR_LF', '\n'.charCodeAt(0))
    .constant('CHAR_CR', '\r'.charCodeAt(0))
    .constant('CHAR_CSI', '['.charCodeAt(0))
    .constant('CHAR_ESC', 0x1B)
    .constant('CHAR_DEL', 0x7F)
    .constant('CSI_F_0', 0x40, {
        documentation: 'beginning of CSI Final Byte range'
    })
    .constant('CSI_F_E', 0x7F, {
        documentation: 'end of CSI Final Byte range (exclusive)'
    })
    .variable('result', { getDefaultValue: () => '' })
    .variable('cursor', { getDefaultValue: () => 0 })
    .external('out', { required: true })
    .external('in_', { required: true })
    .beforeAll('get-byte', async ctx => {
        const { locals, externs } = ctx;

        const byteBuffer = new Uint8Array(1);
        await externs.in_.read(byteBuffer);
        locals.byteBuffer = byteBuffer;
        locals.byte = byteBuffer[0];
    })
    .state('start', async ctx => {
        const { consts, vars, externs, locals } = ctx;
        console.log('byte??', locals.byte)

        if ( locals.byte === consts.CHAR_LF ) {
            externs.out.write('\n');
            ctx.setState('end');
            return;
        }

        if ( locals.byte === consts.CHAR_ESC ) {
            console.log('this happened');
            ctx.setState('ESC');
            return;
        }

        // (note): DEL is actually the backspace key
        // [explained here](https://en.wikipedia.org/wiki/Backspace#Common_use)
        // TOOD: very similar to delete in CSI_HANDLERS; how can this be unified?
        if ( locals.byte === consts.CHAR_DEL ) {
            // can't backspace at beginning of line
            if ( vars.cursor === 0 ) return;

            vars.result = vars.result.slice(0, vars.cursor - 1) +
                vars.result.slice(vars.cursor)

            vars.cursor--;

            // TODO: maybe wrap these CSI codes in a library
            const backspaceSequence = new Uint8Array([
                // consts.CHAR_ESC, consts.CHAR_CSI, cc('s'), // save cur
                consts.CHAR_ESC, consts.CHAR_CSI, cc('D'), // left
                consts.CHAR_ESC, consts.CHAR_CSI, cc('P'),
                // consts.CHAR_ESC, consts.CHAR_CSI, cc('u'), // restore cur
                // consts.CHAR_ESC, consts.CHAR_CSI, cc('D'), // left
            ]);

            externs.out.write(backspaceSequence);
            return;
        }

        const part = decoder.decode(locals.byteBuffer);

        if ( vars.cursor === vars.result.length ) {
            // output
            externs.out.write(locals.byteBuffer);
            // update buffer
            vars.result = vars.result + part;
            // update cursor
            vars.cursor += part.length;
            console.log('new cursor', vars.cursor)
        } else {
            // output
            const insertSequence = new Uint8Array([
                consts.CHAR_ESC,
                consts.CHAR_CSI,
                '@'.charCodeAt(0),
                ...locals.byteBuffer
            ]);
            externs.out.write(insertSequence);
            // update buffer
            vars.result =
                vars.result.slice(0, vars.cursor) +
                part +
                vars.result.slice(vars.cursor)
            // update cursor
            vars.cursor += part.length;
        }
    })
    .onTransitionTo('ESC-CSI', async ctx => {
        console.log('initialized control sequence')
        ctx.vars.controlSequence = new Uint8List();
    })
    .state('ESC', async ctx => {
        console.log('---esc---')
        const { consts, vars, externs, locals } = ctx;

        if ( locals.byte === consts.CHAR_ESC ) {
            externs.out.write(consts.CHAR_ESC);
            ctx.setState('start');
            return;
        }

        if ( locals.byte === '['.charCodeAt(0) ) {
            ctx.setState('ESC-CSI');
            return;
        }
    })
    .state('ESC-CSI', async ctx => {
        const { consts, locals, vars } = ctx;

        if (
            locals.byte >= consts.CSI_F_0 &&
            locals.byte <  consts.CSI_F_E
        ) {
            ctx.trigger('ESC-CSI.post');
            ctx.setState('start');
            return;
        }

        vars.controlSequence.append(locals.byte);
    })
    .action('ESC-CSI.post', async ctx => {
        const { vars, externs, locals } = ctx;

        const finalByte = locals.byte;
        const controlSequence = vars.controlSequence.toArray();

        Log.log('controlSequence', controlSequence);

        if ( ! CSI_HANDLERS.hasOwnProperty(finalByte) ) {
            return;
        }

        const csiCtx = {
            controlSequence,
            cursor: vars.cursor,
            result: vars.result,
            moveCursor: n => {
                console.log('cursor move', n);
                ctx.vars.cursor += n;
            },
            vars: { doWrite: false },
            out: externs.out,
        };
        CSI_HANDLERS[finalByte](csiCtx);

        if ( csiCtx.vars.doWrite ) {
            externs.out.write(new Uint8Array([
                ctx.consts.CHAR_ESC,
                ctx.consts.CHAR_CSI,
                ...controlSequence,
                finalByte
            ]))
            Log.log('CS', controlSequence)
        }
    })
    .build();

const ReadlineProcessor = ReadlineProcessorBuilder(
    new StatefulProcessorBuilder()
);

class Readline {
    constructor (params) {
        this.internal_ = {};
        for ( const k in params ) this.internal_[k] = params[k];
    }

    async readline (prompt) {
        const out = this.internal_.out;
        const in_ = this.internal_.in;

        out.write(prompt);

        const {
            result
        } = await ReadlineProcessor.run({ out, in_ });

        return result;
    }

    // async readline (prompt) {
    //     const out = this.internal_.out;
    //     const in_ = this.internal_.in;

    //     out.write(prompt);

    //     let text = '';

    //     const decoder = new TextDecoder();

    //     while ( true ) {
    //         const byteBuffer = new Uint8Array(1);
    //         await in_.read(byteBuffer);

    //         const byte = byteBuffer[0];
    //         if ( byte === CHAR_LF ) {
    //             out.write('\n');
    //             break;
    //         }

    //         out.write(byteBuffer);
    //         const part = decoder.decode(byteBuffer);
    //         text += part;
    //     }

    //     // const text = await in_.readLine({ stream: out });
    //     return text;
    // }
}

export default class ReadlineLib {
    static create(params) {
        const rl = new Readline(params);
        return rl.readline.bind(rl);
    }
}
