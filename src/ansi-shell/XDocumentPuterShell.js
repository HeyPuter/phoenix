export class XDocumentPuterShell extends EventTarget {
    constructor (params) {
        super();
        this.internal_ = {};
        for ( const k in params ) this.internal_[k] = params[k];
        this.ready_ = false;
    }

    set ready (v) {
        if ( ! v ) throw new Error(`can't set ready to false`);
        if ( this.ready_ ) throw new Error(`duplicate ready event`);
        this.ready_ = true;
        console.log('dispatching the ready event');
        this.dispatchEvent(new CustomEvent('ready', {}));
    }

    get ready () { return this.ready_ }

    attachToIframe (iframeEl) {
        const source = this.internal_.source;

        iframeEl.src = source;

        this.internal_.window = iframeEl.contentWindow;
        this.attachToWindow_();
    }

    attachToWindow_ () {
        const contentWindow = this.internal_.window;
        const ptt = this.internal_.ptt;

        window.addEventListener('message', evt => {
            if ( evt.source !== contentWindow ) return;

            if ( ! evt.data.$ ) {
                throw new Error('unrecognized message format');
            }

            if ( evt.data.$ === 'ready' ) {
                this.ready = true;
            }
        });
    }

    configure (config) {
        const contentWindow = this.internal_.window;
        contentWindow.postMessage({
            ...config,
            $: 'config'
        }, this.internal_.source);
    }
}

