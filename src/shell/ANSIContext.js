import { Context } from "../context/context";

const modifiers = ['shift', 'alt', 'ctrl', 'meta'];

const keyboardModifierBits = {};
for ( let i=0 ; i < modifiers.length ; i++ ) {
    const key = `KEYBOARD_BIT_${modifiers[i].toUpperCase()}`;
    keyboardModifierBits[key] = 1 << i;
}

export const ANSIContext = new Context({
    constants: {
        CHAR_LF: '\n'.charCodeAt(0),
        CHAR_CR: '\r'.charCodeAt(0),
        CHAR_CSI: '['.charCodeAt(0),
        CHAR_OSC: ']'.charCodeAt(0),
        CHAR_ESC: 0x1B,
        CHAR_DEL: 0x7F,
        CHAR_BEL: 0x07,
        CSI_F_0: 0x40,
        CSI_F_E: 0x7F,
        ...keyboardModifierBits
    }
});

export const getActiveModifiersFromXTerm = (n) => {
    // decrement explained in doc/graveyard/keyboard_modifiers.md
    n--;

    const active = {};

    for ( let i=0 ; i < modifiers.length ; i++ ) {
        if ( n & 1 << i ) {
            active[modifiers[i]] = true;
        }
    }

    return active;
};