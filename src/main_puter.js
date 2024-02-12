import { Context } from 'contextlink';
import { launchPuterShell } from './puter-shell/main.js';
import { CreateFilesystemProvider } from './platform/puter/filesystem.js';
import { XDocumentPuterShell } from './puter-shell/XDocumentPuterShell.js';
import { CreateDriversProvider } from './platform/puter/drivers.js';

window.main_shell = async () => {
    const config = {};

    let resolveConfigured = null;
    const configured_ = new Promise(rslv => {
        resolveConfigured = rslv;
    });
    window.addEventListener('message', evt => {
        if ( evt.source !== window.parent ) return;
        if ( evt.data instanceof Uint8Array ) {
            return;
        }
        if ( ! evt.data.hasOwnProperty('$') ) {
            console.error(`unrecognized window message`, evt);
            return;
        }
        if ( evt.data.$ !== 'config' ) return;

        console.log('received configuration at ANSI shell');
        const configValues = { ...evt.data };
        delete configValues.$;
        for ( const k in configValues ) {
            config[k] = configValues[k];
        }
        resolveConfigured();
    });

    window.parent.postMessage({ $: 'ready' }, '*');

    await configured_;

    const puterSDK = globalThis.puter;
    await puterSDK.setAuthToken(config['puter.auth.token']);
    const source_without_trailing_slash =
        (config.source && config.source.replace(/\/$/, ''))
        || 'https://api.puter.com';
    await puterSDK.setAPIOrigin(source_without_trailing_slash);

    await launchPuterShell(new Context({
        config, puterSDK,
        platform: new Context({
            filesystem: CreateFilesystemProvider({ puterSDK }),
            drivers: CreateDriversProvider({ puterSDK }),
        }),
    }));
};
