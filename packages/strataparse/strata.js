export class DelegatingPStratumImplAPI {
    constructor (facade) {
        this.facade = facade;
    }
    get delegate () {
        return this.facade.delegate;
    }
}

export class DelegatingPStratumImplType {
    constructor (facade) {
        this.facade = facade;
    }
    getImplAPI () {
        return new DelegatingPStratumImplAPI(this.facade);
    }
}

export class TerminalPStratumImplType {
    getImplAPI () {
        return {};
    }
}

export class PStratum {
    constructor (impl) {
        this.impl = impl;

        const implTypeClass = this.impl.constructor.TYPE
            ?? DelegatingPStratumImplType;
        
        this.implType = new implTypeClass(this);
        this.api = this.implType.getImplAPI();

        this.lookValue = null;
        this.seqNo = 0;
    }

    setDelegate (delegate) {
        this.delegate = delegate;
    }

    look () {
        if ( this.looking ) {
            return this.lookValue;
        }
        this.looking = true;
        this.lookValue = this.impl.next(this.api);
        return this.lookValue;
    }

    next () {
        this.seqNo++;
        if ( this.looking ) {
            this.looking = false;
            return this.lookValue;
        }
        return this.impl.next(this.api);
    }

    fork () {
        const forkImpl = this.impl.fork(this.api);
        const fork = new PStratum(forkImpl);
        // DRY: sync state
        fork.looking = this.looking;
        fork.lookValue = this.lookValue;
        fork.seqNo = this.seqNo;
        return fork;
    }

    join (friend) {
        // DRY: sync state
        this.looking = friend.looking;
        this.lookValue = friend.lookValue;
        this.seqNo = friend.seqNo;
        this.impl.join(this.api, friend.impl);
    }
}
