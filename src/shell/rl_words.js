export const findNextWord = (str, from, reverse) => {
    let stage = 0;
    let incr = reverse ? -1 : 1;
    const cond = reverse ? i => i > 0 : i => i < str.length;
    if ( reverse && from !== 0 ) from--;
    for ( let i=from ; cond(i) ; i += incr ) {
        if ( stage === 0 ) {
            if ( str[i] !== ' ' ) stage++;
            continue;
        }
        if ( stage === 1 ) {
            if ( str[i] === ' ' ) return reverse ? i + 1 : i;
        }
    }
    return reverse ? 0 : str.length;
}
