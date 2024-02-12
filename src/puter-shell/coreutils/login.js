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
