import fs from 'fs';
import path_ from 'path';

import modeString from 'fs-mode-to-string';


export const CreateFilesystemProvider = () => {
    return {
        capabilities: {
            'readdir.posix-mode': true,
        },
        readdir: async (path) => {
            const names = await fs.promises.readdir(path);

            const items = [];

            const users = {};
            const groups = {};

            for ( const name of names ) {
                const stat = await fs.promises.stat(path_.join(path, name));

                items.push({
                    name,
                    is_dir: stat.isDirectory(),
                    is_symlink: stat.isSymbolicLink(),
                    size: stat.size,
                    modified: stat.mtimeMs / 1000,
                    created: stat.ctimeMs / 1000,
                    accessed: stat.atimeMs / 1000,
                    mode: stat.mode,
                    mode_human_readable: modeString(stat.mode),
                    uid: stat.uid,
                    gid: stat.gid,
                });
            }

            return items;
        },
    };
};
