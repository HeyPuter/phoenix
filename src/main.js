import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { PTY } from 'dev-pty';
import { XDocumentANSIShell } from './XDocumentANSIShell';
import { main_shell } from './ansi-shell/main_shell';


class XTermIO {
    constructor ({ term, pty }) {
        this.term = term;
        this.pty = pty;
    }

    bind () {
        this.term.onKey(this.handleKey.bind(this));

        (async () => {
            for ( ;; ) {
                const chunk = (await this.pty.in.read()).value;
                this.term.write(chunk);
            }
        })();
    }

    handleKey ({ key, domEvent }) {
        const pty = this.pty;

        const handlers = {
            Enter: () => {
                pty.out.write('\n');
            },
            // Backspace: () => {
            //     pty.out.write('\x08');
            // },
            // Delete: () => {
            //     pty.out.write('\x1B[3~');
            // },
            Home: () => {
                pty.out.write('\x1B[H');
            },
            End: () => {
                pty.out.write('\x1B[F');
            }
        }
    
        if ( handlers.hasOwnProperty(domEvent.key) ) {
            const writeKey = handlers[domEvent.key]();
            if ( ! writeKey ) return;
        }

        pty.out.write(key);
    }
}

window.main_term = () => {
    const pty = new PTY();
    const ptt = pty.getPTT();

    const shell = new XDocumentANSIShell({
        source: 'https://puter.local:8080/shell.html',
        ptt
    });

    const iframe = document.createElement('iframe');
    const xdEl = document.getElementById('cross-document-container');
    xdEl.appendChild(iframe);
    shell.attachToIframe(iframe);

    const cw = iframe.contentWindow;
    window.addEventListener('message', evt => {
        if ( evt.source !== cw ) return;
        if ( evt.data instanceof Uint8Array ) return;
        // When the iframe reports it's ready, send configuration
        if ( evt.data.$ === 'ready' ) {
            const params = Object.fromEntries(
                new URLSearchParams(window.location.search)
                    .entries()
            );
            cw.postMessage({
                $: 'config',
                ...params
            });
            return;
        }
    });

    const termEl = document.createElement('div');
    termEl.id = 'terminal';

    document.body.append(termEl);
    const term = new Terminal();
    term.open(document.getElementById('terminal'));

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.onResize(evt => {
        // console.log(evt)
    })

    fitAddon.fit();

    window.addEventListener('resize', () => {
        fitAddon.fit();
    })

    const termObserver = new ResizeObserver(() => {
        fitAddon.fit();
    });

    termObserver.observe(termEl);

    const ioController = new XTermIO({ term, pty });
    ioController.bind();
};

window.main_shell = main_shell;
