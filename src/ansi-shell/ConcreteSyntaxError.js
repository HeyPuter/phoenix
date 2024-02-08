/**
 * An error for which the location it occurred within the input is known.
 */
export class ConcreteSyntaxError extends Error {
    constructor(message, cst_location) {
        super(message);
        this.cst_location = cst_location;
    }

    /**
     * Prints the location of the error in the input.
     * 
     * Example output:
     * 
     * ```
     * 1: echo $($(echo zxcv))
     *           ^^^^^^^^^^^
     * ```
     * 
     * @param {*} input 
     */
    print_here (input) {
        const lines = input.split('\n');
        const line = lines[this.cst_location.line];
        const str_line_number = String(this.cst_location.line + 1) + ': ';
        const n_spaces =
            str_line_number.length +
            this.cst_location.start;
        const n_arrows = Math.max(
            this.cst_location.end - this.cst_location.start,
            1
        );

        return (
            str_line_number + line + '\n' +
            ' '.repeat(n_spaces) + '^'.repeat(n_arrows)
        );
    }
}
