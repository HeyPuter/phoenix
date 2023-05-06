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

// --- convenience function decorators ---
const CSI_INT_ARG = delegate => ctx => {
    const controlSequence = ctx.controlSequence;

    const str = new TextDecoder().decode(controlSequence);
    let num = str === '' ? 1 : Number.parseInt(str);
    if ( Number.isNaN(num) ) num = 0;

    delegate({ ...ctx, num });
};

// --- CSI handlers: this is the last definition in this file ---
export const CSI_HANDLERS = {
    // cursor back
    [cc('D')]: CSI_INT_ARG(ctx => {
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
};
