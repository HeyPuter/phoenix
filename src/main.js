import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { PTY } from 'dev-pty';
import { XDocumentShell } from './XDocumentShell';
import { main_shell } from './main_shell';


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
            ArrowRight: () => {
                pty.out.write('\x1B[C');
            },
            ArrowLeft: () => {
                pty.out.write('\x1B[D');
            },
            Backspace: () => {
                pty.out.write('\x08');
            },
            Delete: () => {
                pty.out.write('\x1B[3~');
            },
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

    const shell = new XDocumentShell({
        source: 'https://puter.local:8080/shell.html',
        ptt
    });

    const iframe = document.createElement('iframe');
    const xdEl = document.getElementById('cross-document-container');
    xdEl.appendChild(iframe);
    shell.attachToIframe(iframe);

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

    // (async () => {
    //     for ( ;; ) {
    //         const chunk = (await ptt.in.read()).value;
    //         console.log('got', chunk)
    //         ptt.out.write('' + chunk.length);
    //     }
    // })();
    // term.write('xterm test');

    const ioController = new XTermIO({ term, pty });
    ioController.bind();

    // for ( let i=0; i < 100; i++ ) {
    //     ptt.out.write(`Hello ${i}\n`);
    // }
};

window.main_shell = main_shell;
