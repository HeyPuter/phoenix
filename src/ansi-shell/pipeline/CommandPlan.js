export class CommandPlan {
    constructor (params) {
        this.instance_ = {};
        for ( const k in params ) {
            this.instance_[k] = params[k];
        }
    }

    bulidContext_ (parentCtx) {
        return {
            ...parentCtx,
            vars: this.instance_.shell.variables;
        };
    }
}
