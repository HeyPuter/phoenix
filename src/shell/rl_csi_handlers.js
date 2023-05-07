/*
## this source file
- maps: CSI (Control Sequence Introducer) sequences
- to:   expected functionality in the context of readline

## relevant articles
- [ECMA-48](https://www.ecma-international.org/wp-content/uploads/ECMA-48_5th_edition_june_1991.pdf)
- [Wikipedia](https://en.wikipedia.org/wiki/ANSI_escape_code)
*/

// TODO: potentially include metadata in handlers

// --- util ---
const cc = chr => chr.charCodeAt(0);

const CHAR_DEL = 127;
const CHAR_ESC = 0x1B;

// TODO: import theses constants from a package
const consts = {
    CHAR_DEL,
    CHAR_ESC: 0x1B,
    CHAR_CSI: cc('['),
};

// --- convenience function decorators ---
const CSI_INT_ARG = delegate => ctx => {
    const controlSequence = ctx.controlSequence;

    const str = new TextDecoder().decode(controlSequence);
    let num = str === '' ? 1 : Number.parseInt(str);
    if ( Number.isNaN(num) ) num = 0;

    delegate({ ...ctx, num });
};

// --- PC-Style Function Key handles (see `~` final byte in CSI_HANDLERS) ---
export const PC_FN_HANDLERS = {
    // delete key
    3: ctx => {
        const deleteSequence = new Uint8Array([
            consts.CHAR_ESC, consts.CHAR_CSI, cc('P')
        ]);
        // ctx.moveCursor(-1);
        ctx.out.write(deleteSequence);
    }
};

// --- CSI handlers: this is the last definition in this file ---
export const CSI_HANDLERS = {
    // cursor back
    [cc('D')]: CSI_INT_ARG(ctx => {
        if ( ctx.cursor === 0 ) {
            return;
        }
        ctx.moveCursor(-1 * ctx.num);
        ctx.vars.doWrite = true;        
    }),
    // cursor forward
    [cc('C')]: CSI_INT_ARG(ctx => {
        if ( ctx.cursor >= ctx.result.length ) {
            return;
        }
        ctx.moveCursor(ctx.num);
        ctx.vars.doWrite = true;        
    }),
    // PC-Style Function Keys
    [cc('~')]: CSI_INT_ARG(ctx => {
        if ( ! PC_FN_HANDLERS.hasOwnProperty(ctx.num) ) {
            console.error(`unrecognized PC Function: ${ctx.num}`);
            return;
        }
        PC_FN_HANDLERS[ctx.num](ctx);
    })
};
