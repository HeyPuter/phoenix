/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
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

    async command (cmdName, command) {
        const contentWindow = this.internal_.window;
        let result;
        const p = new Promise(rslv => {
            const lis = evt => {
                if ( evt.source !== contentWindow ) return;
                if ( ! evt.data.$ ) {
                    console.error('message without $ when waiting');
                    return;
                }
                if ( evt.data.$ !== 'command-done' ) return;
                result = evt.data.result;
                rslv();
                window.removeEventListener('message', lis);
            }
            window.addEventListener('message', lis);
        });
        contentWindow.postMessage({
            ...command,
            $: 'command',
            $$: cmdName,
        }, this.internal_.source);
        await p;
        return result;
    }
}
