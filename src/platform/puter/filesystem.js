import { DestinationIsDirectoryError } from "../definitions";

export const CreateFilesystemProvider = ({
    puterSDK,
}) => {
    return {
        // The interface for Puter SDK is a good interface for any filesystem
        // provider, so we will use that as the basis for the Puter Shell's
        // own filesystem provider interface.
        readdir: puterSDK.fs.readdir.bind(puterSDK.fs),
        stat: puterSDK.fs.stat.bind(puterSDK.fs),
        mkdir: puterSDK.fs.mkdir.bind(puterSDK.fs),

        // For move and copy the interface is a compromise between the
        // Puter SDK and node.js's `fs` module. This compromise is
        // effectively the same behaviour provided by the POSIX `mv`
        // command; we accept a new name in newPath (contrary to Puter SDK),
        // and we do not throw an error if the destination is a directory
        // (contrary to node.js's `fs`).
        move: async (oldPath, newPath) => {
            let dst_stat = null;
            try {
                dst_stat = await puterSDK.fs.stat(newPath);
            } catch (e) {
                if ( e.code !== 'subject_does_not_exist' ) throw e;
            }

            // In the Puter SDK, the destination specified is always
            // the parent directory to move the source under.

            let new_name = undefined;
            if ( ! dst_stat ) {
                // take last part of destination path and use it as the new name
                const parts = newPath.split('/');
                new_name = parts[parts.length - 1];

                // remove new name from destination path
                parts.pop();
                newPath = parts.join('/');
            }

            return await puterSDK.fs.move(oldPath, newPath, {
                ...(new_name ? { newName: new_name } : {}),
            });
        },
    }
};
