import path_ from "path-browserify";

export default {
    name: 'pwd',
    args: {
        $: 'simple-parser',
        allowPositionals: true
    },
    execute: async ctx => {
        ctx.externs.out.write(ctx.vars.pwd + '\n');
    }
}
