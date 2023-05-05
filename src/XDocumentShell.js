export class XDocumentShell {
    constructor (params) {
        this.internal_ = {};
        for ( const k in params ) this.internal_[k] = params[k];
    }

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
            console.log('from somewhere:', evt);
            if ( evt.source !== contentWindow ) return;

            console.log('from iframe:', evt.data);
            ptt.out.write(evt.data);
        });

        (async () => {
            for ( ;; ) {
                const chunk = (await ptt.in.read()).value;
                contentWindow.postMessage(chunk);
            }
        })();
    }
}
