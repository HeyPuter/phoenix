/*
## this source file
- maps: CSI (Control Sequence Introducer) sequences
- to:   expected functionality in the context of readline

## relevant articles
- [ECMA-48](https://www.ecma-international.org/wp-content/uploads/ECMA-48_5th_edition_june_1991.pdf)
- [Wikipedia](https://en.wikipedia.org/wiki/ANSI_escape_code)
*/

import { ANSIContext } from "./ANSIContext";

// TODO: potentially include metadata in handlers

// --- util ---
const cc = chr => chr.charCodeAt(0);

const CHAR_DEL = 127;
const CHAR_ESC = 0x1B;

const { consts } = ANSIContext;

// --- convenience function decorators ---
const CSI_INT_ARG = delegate => ctx => {
    const controlSequence = ctx.locals.controlSequence;

    const str = new TextDecoder().decode(controlSequence);
    let num = str === '' ? 1 : Number.parseInt(str);
    if ( Number.isNaN(num) ) num = 0;

    ctx.locals.num = num;

    return delegate(ctx);
};

// --- PC-Style Function Key handles (see `~` final byte in CSI_HANDLERS) ---
export const PC_FN_HANDLERS = {
    // delete key
    3: ctx => {
        const { vars } = ctx;
        const deleteSequence = new Uint8Array([
            consts.CHAR_ESC, consts.CHAR_CSI, cc('P')
        ]);
        vars.result = vars.result.slice(0, vars.cursor) +
            vars.result.slice(vars.cursor + 1);
        ctx.externs.out.write(deleteSequence);
    }
};

// --- CSI handlers: this is the last definition in this file ---
export const CSI_HANDLERS = {
    // cursor back
    [cc('D')]: CSI_INT_ARG(ctx => {
        if ( ctx.cursor === 0 ) {
            return;
        }
        ctx.vars.cursor -= ctx.locals.num;
        ctx.locals.doWrite = true;        
    }),
    // cursor forward
    [cc('C')]: CSI_INT_ARG(ctx => {
        console.log('!@#', ctx.vars.cursor, ctx.vars.result)
        if ( ctx.vars.cursor >= ctx.vars.result.length ) {
            return;
        }
        ctx.vars.cursor += ctx.locals.num;
        ctx.locals.doWrite = true;        
    }),
    // PC-Style Function Keys
    [cc('~')]: CSI_INT_ARG(ctx => {
        if ( ! PC_FN_HANDLERS.hasOwnProperty(ctx.locals.num) ) {
            console.error(`unrecognized PC Function: ${ctx.locals.num}`);
            return;
        }
        PC_FN_HANDLERS[ctx.locals.num](ctx);
    })
};
