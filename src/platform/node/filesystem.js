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
        stat: async (path) => {
            const stat = await fs.promises.stat(path);
            const fullPath = await fs.promises.realpath(path);
            const parsedPath = path_.parse(fullPath);
            // TODO: Fill in more of these?
            return {
                id: stat.ino,
                associated_app_id: null,
                public_token: null,
                file_request_token: null,
                uid: stat.uid,
                parent_id: null,
                parent_uid: null,
                is_dir: stat.isDirectory(),
                is_public: null,
                is_shortcut: null,
                is_symlink: stat.isSymbolicLink(),
                symlink_path: null,
                sort_by: null,
                sort_order: null,
                immutable: null,
                name: parsedPath.base,
                path: fullPath,
                dirname: parsedPath.dir,
                dirpath: parsedPath.dir,
                metadata: null,
                modified: stat.mtime,
                created: stat.birthtime,
                accessed: stat.atime,
                size: stat.size,
                layout: null,
                owner: null,
                type: null,
                is_empty: await (async (stat) => {
                    if (!stat.isDirectory())
                        return null;
                    const children = await fs.promises.readdir(path);
                    return children.length === 0;
                })(stat),
            };
        },
        mkdir: async (path, options = { createMissingParents: false }) => {
            const createMissingParents = options['createMissingParents'] || false;
            return await fs.promises.mkdir(path, { recursive: createMissingParents });
        }
    };
};
