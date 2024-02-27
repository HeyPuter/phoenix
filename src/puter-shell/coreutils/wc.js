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
import path from "path-browserify";

export default {
    name: 'wc',
    args: {
        $: 'simple-parser',
        allowPositionals: true,
        options: {
            bytes: {
                type: 'boolean',
                short: 'c'
            },
            chars: {
                type: 'boolean',
                short: 'm'
            },
            lines: {
                type: 'boolean',
                short: 'l'
            },
            words: {
                type: 'boolean',
                short: 'w'
            },
        }
    },
    execute: async ctx => {
        const { positionals, values } = ctx.locals;
        const { filesystem } = ctx.platform;

        const paths = [...positionals];
        if (paths.length < 1) paths.push('-');

        let { bytes: printBytes, chars: printChars, lines: printNewlines, words: printWords } = values;
        const anyOutputOptionsSpecified = printBytes || printChars || printNewlines || printWords;
        if (!anyOutputOptionsSpecified) {
            printBytes = true;
            printNewlines = true;
            printWords = true;
        }

        let perFile = [];
        let newlinesWidth = 1;
        let wordsWidth = 1;
        let charsWidth = 1;
        let bytesWidth = 1;

        for (const relPath of paths) {
            let counts = {
                filename: relPath,
                newlines: 0,
                words: 0,
                chars: 0,
                bytes: 0,
            };

            let inWord = false;
            let accumulateData = (input) => {
                const byteInput = typeof input === 'string' ? new TextEncoder().encode(input) : input;
                const stringInput = typeof input === 'string' ? input : new TextDecoder().decode(input);
                counts.bytes += byteInput.length;
                counts.chars += stringInput.length;
                for (const char of stringInput) {
                    // "The wc utility shall consider a word to be a non-zero-length string of characters delimited by white space."
                    if (/\s/.test(char)) {
                        if (char === '\r' || char === '\n') {
                            counts.newlines++;
                        }
                        inWord = false;
                        continue;
                    }
                    if (!inWord) {
                        counts.words++;
                        inWord = true;
                    }
                }
            }

            if (relPath === '-') {
                let chunk, done;
                const nextChunk = async () => {
                    ({ value: chunk, done } = await ctx.externs.in_.read());
                }
                for ( await nextChunk() ; ! done ; await nextChunk() ) {
                    accumulateData(chunk);
                }
            } else {
                // DRY: also done in mkdir
                const absPath = relPath.startsWith('/') ? relPath :
                    path.resolve(ctx.vars.pwd, relPath);
                const fileData = await filesystem.read(absPath);
                accumulateData(fileData);
            }

            newlinesWidth = Math.max(newlinesWidth, counts.newlines.toString().length);
            wordsWidth = Math.max(wordsWidth, counts.words.toString().length);
            charsWidth = Math.max(charsWidth, counts.chars.toString().length);
            bytesWidth = Math.max(bytesWidth, counts.bytes.toString().length);
            perFile.push(counts);
        }

        let printCounts = async (count) => {
            let output = '';
            const append = (string) => {
                if (output.length !== 0) output += ' ';
                output += string;
            };

            if (printNewlines) append(count.newlines.toString().padStart(newlinesWidth, ' '));
            if (printWords)    append(count.words.toString().padStart(wordsWidth, ' '));
            if (printChars)    append(count.chars.toString().padStart(charsWidth, ' '));
            if (printBytes)    append(count.bytes.toString().padStart(bytesWidth, ' '));
            append(`${count.filename}\n`);
            await ctx.externs.out.write(output);
        }

        let totalCounts = {
            filename: 'total', // POSIX: This is locale-dependent
            newlines: 0,
            words: 0,
            chars: 0,
            bytes: 0,
        };
        for (const count of perFile) {
            totalCounts.newlines += count.newlines;
            totalCounts.words += count.words;
            totalCounts.chars += count.chars;
            totalCounts.bytes += count.bytes;
            await printCounts(count);
        }
        if (perFile.length > 1) {
            await printCounts(totalCounts);
        }
    }
};
