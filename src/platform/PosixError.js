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
export const ErrorCodes = {
    EACCES: Symbol.for('EACCES'),
    EADDRINUSE: Symbol.for('EADDRINUSE'),
    ECONNREFUSED: Symbol.for('ECONNREFUSED'),
    ECONNRESET: Symbol.for('ECONNRESET'),
    EEXIST: Symbol.for('EEXIST'),
    EFBIG: Symbol.for('EFBIG'),
    EINVAL: Symbol.for('EINVAL'),
    EIO: Symbol.for('EIO'),
    EISDIR: Symbol.for('EISDIR'),
    EMFILE: Symbol.for('EMFILE'),
    ENOENT: Symbol.for('ENOENT'),
    ENOSPC: Symbol.for('ENOSPC'),
    ENOTDIR: Symbol.for('ENOTDIR'),
    ENOTEMPTY: Symbol.for('ENOTEMPTY'),
    EPERM: Symbol.for('EPERM'),
    EPIPE: Symbol.for('EPIPE'),
    ETIMEDOUT: Symbol.for('ETIMEDOUT'),
};

export class PosixError extends Error {
    // posixErrorCode can be either a string, or one of the ErrorCodes above.
    constructor(posixErrorCode, message) {
        super(message);
        if (typeof posixErrorCode === 'symbol') {
            if (ErrorCodes[Symbol.keyFor(posixErrorCode)] !== posixErrorCode) {
                throw new Error(`Unrecognized POSIX error code: '${posixErrorCode}'`);
            }
            this.posixCode = posixErrorCode;
        } else {
            const code = ErrorCodes[posixErrorCode];
            if (!code) throw new Error(`Unrecognized POSIX error code: '${posixErrorCode}'`);
            this.posixCode = code;
        }
    }

    //
    // Helpers for constructing a PosixError when you don't already have an error message.
    //
    static AccessNotPermitted(path) {
        return new PosixError(ErrorCodes.EACCES, `Access not permitted to: '${path}'`);
    }
    static AddressInUse() {
        return new PosixError(ErrorCodes.EADDRINUSE, `Address already in use`);
    }
    static ConnectionRefused() {
        return new PosixError(ErrorCodes.ECONNREFUSED, `Connection refused`);
    }
    static ConnectionReset() {
        return new PosixError(ErrorCodes.ECONNRESET, `Connection reset`);
    }
    static PathAlreadyExists(path) {
        return new PosixError(ErrorCodes.EEXIST, `Path already exists: '${path}'`);
    }
    static FileTooLarge() {
        return new PosixError(ErrorCodes.EFBIG, `File too large`);
    }
    static InvalidArgument(message) {
        return new PosixError(ErrorCodes.EINVAL, message);
    }
    static IO() {
        return new PosixError(ErrorCodes.EIO, `IO error`);
    }
    static IsDirectory(path) {
        return new PosixError(ErrorCodes.EISDIR, `Path is directory: '${path}'`);
    }
    static TooManyOpenFiles() {
        return new PosixError(ErrorCodes.EMFILE, `Too many open files`);
    }
    static DoesNotExist(path) {
        return new PosixError(ErrorCodes.ENOENT, `Path not found: '${path}'`);
    }
    static NotEnoughSpace() {
        return new PosixError(ErrorCodes.ENOSPC, `Not enough space available`);
    }
    static IsNotDirectory(path) {
        return new PosixError(ErrorCodes.ENOTDIR, `Path is not a directory: '${path}'`);
    }
    static DirectoryIsNotEmpty(path) {
        return new PosixError(ErrorCodes.ENOTEMPTY, `Directory is not empty: '${path}'`);
    }
    static OperationNotPermitted() {
        return new PosixError(ErrorCodes.EPERM, 'Operation not permitted');
    }
    static BrokenPipe() {
        return new PosixError(ErrorCodes.EPIPE, 'Broken pipe');
    }
    static TimedOut() {
        return new PosixError(ErrorCodes.ETIMEDOUT, 'Connection timed out');
    }
}
