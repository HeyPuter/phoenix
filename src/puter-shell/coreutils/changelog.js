// INCONST: called 'path' instead of 'path_' elsewhere
import path_ from "path-browserify";
import { SHELL_VERSIONS } from "../../meta/versions.js";

export default {
    name: 'changelog',
    args: {
        $: 'simple-parser',
        allowPositionals: false
    },
    execute: async ctx => {
        for ( const version of SHELL_VERSIONS ) {
            ctx.externs.out.write(`\x1B[35;1m[v${version.v}]\x1B[0m\n`);
            for ( const change of version.changes ) {
                ctx.externs.out.write(`\x1B[32;1m+\x1B[0m ${change}\n`);
            }
        }
    }
};

