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
// TODO: Detect ANSI escape sequences in the text and treat them as 0 width?
export const wrapText = (text, width) => {
    // If width was invalid, just return the original text as a failsafe.
    if (typeof width !== 'number' || width < 1)
        return [text];

    const lines = [];
    // This reduces all whitespace to single space characters. Is that a problem?
    const words = text.split(/\s+/);

    let currentLine = '';
    const splitWordIfTooLong = (word) => {
        while (word.length > width) {
            lines.push(word.substring(0, width - 1) + '-');
            word = word.substring(width - 1);
        }

        currentLine = word;
    };

    for (let word of words) {
        if (currentLine.length === 0) {
            splitWordIfTooLong(word);
            continue;
        }
        if ((currentLine.length + 1 + word.length) > width) {
            // Next line
            lines.push(currentLine);
            splitWordIfTooLong(word);
            continue;
        }
        currentLine += ' ' + word;
    }
    lines.push(currentLine);

    return lines;
};