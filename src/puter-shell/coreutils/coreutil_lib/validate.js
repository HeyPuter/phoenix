export const validate_string = (str, meta) => {
    if ( str === undefined ) {
        if ( ! meta.allow_empty ) {
            throw new Error(`${meta?.name} is required`);
        }
        return '';
    }

    if ( typeof str !== 'string' ) {
        throw new Error(`${meta?.name} must be a string`);
    }

    if ( ! meta.allow_empty && str.length === 0 ) {
        throw new Error(`${meta?.name} must not be empty`);
    }

    return str;
}
