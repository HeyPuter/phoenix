import { Uint8List } from "../util/bytes";
import { Log } from "../util/log";
import { StatefulProcessorBuilder } from "../util/statemachine";

const decoder = new TextDecoder();

const CHAR_LF = '\n'.charCodeAt(0);
const CHAR_CR = '\r'.charCodeAt(0);

const ReadlineProcessorBuilder = builder => builder
    .constant('CHAR_LF', '\n'.charCodeAt(0))
    .constant('CHAR_CR', '\r'.charCodeAt(0))
    .constant('CHAR_ESC', 0x1B)
    .constant('CSI_F_0', 0x40, {
        documentation: 'beginning of CSI Final Byte range'
    })
    .constant('CSI_F_E', 0x7F, {
        documentation: 'end of CSI Final Byte range (exclusive)'
    })
    .variable('result', { getDefaultValue: () => '' })
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

        externs.out.write(locals.byteBuffer);
        const part = decoder.decode(locals.byteBuffer);
        vars.result = vars.result + part;
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

        vars.controlSequence.append(locals.byte);

        if (
            locals.byte >= consts.CSI_F_0 &&
            locals.byte <  consts.CSI_F_E
        ) {
            ctx.trigger('ESC-CSI.post');
            ctx.setState('start');
            return;
        }
    })
    .action('ESC-CSI.post', async ctx => {
        const { vars } = ctx;
        const controlSequence = vars.controlSequence.toArray();
        Log.log('controlSequence', controlSequence);
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
