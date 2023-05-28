export const PARSE_CONSTANTS = {
    list_ws: [' ', '\n', '\t'],
    list_quot: [`"`, `'`],
};

PARSE_CONSTANTS.list_stoptoken = [
    '|','>','<','&','\\','#',';','(',')',
    ...PARSE_CONSTANTS.list_ws,
    ...PARSE_CONSTANTS.list_quot,
]

PARSE_CONSTANTS.escapeSubstitutions = {
    '\\': '\\',
    '/': '/',
    b: '\b',
    f: '\f',
    n: '\n',
    r: '\r',
    t: '\t',
    '"': '"',
    "'": "'",
};