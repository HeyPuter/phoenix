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
    if ( config['puter.auth.token'] ) {
        await puterSDK.setAuthToken(config['puter.auth.token']);
    }
    const source_without_trailing_slash =
        (config.source && config.source.replace(/\/$/, ''))
        || 'https://api.puter.com';
    await puterSDK.setAPIOrigin(source_without_trailing_slash);

    await launchPuterShell(new Context({
        config, puterSDK,
        externs: new Context({ puterSDK }),
        platform: new Context({
            filesystem: CreateFilesystemProvider({ puterSDK }),
            drivers: CreateDriversProvider({ puterSDK }),
        }),
    }));
};
