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
import path_ from "path-browserify";
import child_process from "node:child_process";
import stream from "node:stream";
import { signals } from '../../ansi-shell/signals.js';
import { Exit } from '../coreutils/coreutil_lib/exit.js';

export class PathCommandProvider {
    async lookup (id, { ctx }) {
        const PATH = ctx.env['PATH'];
        if (!PATH)
            return;
        const pathDirectories = PATH.split(':');

        for (const dir of pathDirectories) {
            const executablePath = path_.resolve(dir, id);
            let stat;
            try {
                stat = await ctx.platform.filesystem.stat(executablePath);
            } catch (e) {
                // Stat failed -> file does not exist
                continue;
            }
            // TODO: Detect if the file is executable, and ignore it if not.
            return {
                name: id,
                path: executablePath,
                async execute(ctx) {
                    const child = child_process.spawn(executablePath, ctx.locals.args, {
                        stdio: ['pipe', 'pipe', 'pipe'],
                        cwd: ctx.vars.pwd,
                    });

                    const in_ = new stream.PassThrough();
                    const out = new stream.PassThrough();
                    const err = new stream.PassThrough();

                    in_.on('data', (chunk) => {
                        child.stdin.write(chunk);
                    });
                    out.on('data', (chunk) => {
                        ctx.externs.out.write(chunk);
                    });
                    err.on('data', (chunk) => {
                        ctx.externs.err.write(chunk);
                    });

                    const fn_err = label => err => {
                        console.log(`ERR(${label})`, err);
                    };
                    in_.on('error', fn_err('in_'));
                    out.on('error', fn_err('out'));
                    err.on('error', fn_err('err'));
                    child.stdin.on('error', fn_err('stdin'));
                    child.stdout.on('error', fn_err('stdout'));
                    child.stderr.on('error', fn_err('stderr'));

                    child.stdout.pipe(out);
                    child.stderr.pipe(err);

                    child.on('error', (err) => {
                        console.error(`Error running path executable '${executablePath}':`, err);
                    });

                    const sigint_promise = new Promise((resolve, reject) => {
                        ctx.externs.sig.on((signal) => {
                            if ( signal === signals.SIGINT ) {
                                reject(new Exit(130));
                            }
                        });
                    });

                    const exit_promise = new Promise((resolve, reject) => {
                        child.on('exit', (code) => {
                            ctx.externs.out.write(`Exited with code ${code}\n`);
                            if (code === 0) {
                                resolve({ done: true });
                            } else {
                                reject(new Exit(code));
                            }
                        });
                    });

                    // Repeatedly copy data from stdin to the child, while it's running.
                    let data, done;
                    const next_data = async () => {
                        // FIXME: This waits for one more read() after we finish.
                        ({ value: data, done } = await Promise.race([
                            exit_promise, sigint_promise, ctx.externs.in_.read(),
                        ]));
                        if ( data ) {
                            in_.write(data);
                            if ( ! done ) setTimeout(next_data, 0);
                        }
                    }
                    setTimeout(next_data, 0);

                    return Promise.race([ exit_promise, sigint_promise ]);
                }
            };
        }
    }
}
