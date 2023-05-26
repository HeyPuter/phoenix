export class MergeWhitespacePStratumImpl {
    static meta = {
        inputs: 'node',
        outputs: 'node',
    }
    constructor (tabWidth) {
        this.tabWidth = tabWidth ?? 1;
        this.line = 0;
        this.col = 0;
    }
    next (api) {
        const lexer = api.delegate;

        for ( ;; ) {
            const { value, done } = lexer.next();
            if ( done ) return { value, done };
            
            if ( value.$ === 'whitespace' ) {
                for ( const c of value.text ) {
                    if ( c === '\n' ) {
                        this.line++;
                        this.col = 0;
                        continue;
                    }
                    if ( c === '\t' ) {
                        this.col += this.tabWidth;
                        continue;
                    }
                    if ( c === '\r' ) continue;
                    this.col++;
                }
                continue;
            }

            value.$cst = {
                ...(value.$cst ?? {}),
                line: this.line,
                col: this.col,
            };

            if ( ! value.hasOwnProperty('$cst') ) {
                console.warn('missing CST data: CST might be inaccurate');
            } else {
                this.col += value.$cst.end - value.$cst.start;
            }

            return { value, done: false };
        }
    }
}
