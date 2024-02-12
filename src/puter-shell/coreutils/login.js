export default {
    name: 'login',
    args: {
        $: 'simple-parser',
        allowPositionals: false,
    },
    execute: async ctx => {
        // ctx.params to access processed args
        // ctx.args to access raw args
        const { positionals, values } = ctx.locals;
        const { puterSDK } = ctx.externs;

        console.log('this is athe puter sdk', puterSDK);

        if ( puterSDK.APIOrigin === undefined ) {
            throw new Error('API origin not set');
        }

        const res = await puterSDK.auth.signIn();

        ctx.vars.user = res?.username;
        ctx.vars.home = '/' + res?.username;
        ctx.vars.pwd = '/' + res?.username + `/AppData/` + puterSDK.appID;

        return res?.username;
    }
}
