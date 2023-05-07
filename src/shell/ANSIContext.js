import { Context } from "../context/context";

export const ANSIContext = new Context({
    constants: {
        CHAR_LF: '\n'.charCodeAt(0),
        CHAR_CR: '\r'.charCodeAt(0),
        CHAR_CSI: '['.charCodeAt(0),
        CHAR_ESC: 0x1B,
        CHAR_DEL: 0x7F,
        CSI_F_0: 0x40,
        CSI_F_E: 0x7F,
    },

    imports: {
        out: {}
    }
});
