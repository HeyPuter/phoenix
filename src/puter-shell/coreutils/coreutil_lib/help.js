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
import { wrapText } from '../../../util/wrap-text.js';

const TAB_SIZE = 8;

export const DEFAULT_OPTIONS = {
    help: {
        description: 'Display this help text, and exit',
        type: 'boolean',
    },
};

export const printUsage = async (command, out, vars) => {
    const { name, usage, description, args } = command;
    const options = Object.assign(DEFAULT_OPTIONS, args.options);

    const heading = text => {
        out.write(`\x1B[34;1m${text}:\x1B[0m\n`);
    };
    const colorOption = text => {
        return `\x1B[92m${text}\x1B[0m`;
    };
    const colorOptionArgument = text => {
        return `\x1B[91m${text}\x1B[0m`;
    };

    heading('Usage');
    if (!usage) {
        let output = name;
        if (options) {
            output += ' [OPTIONS]';
        }
        if (args.allowPositionals) {
            output += ' INPUTS...';
        }
        out.write(`  ${output}\n\n`);
    } else if (typeof usage === 'string') {
        out.write(`  ${usage}\n\n`);
    } else {
        for (const line of usage) {
            out.write(`  ${line}\n`);
        }
        out.write('\n');
    }

    if (description) {
        const wrappedLines = wrapText(description, vars.size.cols);
        for (const line of wrappedLines) {
            out.write(`${line}\n`);
        }
        out.write(`\n`);
    }

    if (options) {
        heading('Options');

        for (const optionName in options) {
            let optionText = '  ';
            let indentSize = optionText.length;
            const option = options[optionName];
            if (option.short) {
                optionText += colorOption('-' + option.short) + ', ';
                indentSize += `-${option.short}, `.length;
            } else {
                optionText += `    `;
                indentSize += `    `.length;
            }
            optionText += colorOption(`--${optionName}`);
            indentSize += `--${optionName}`.length;
            if (option.type !== 'boolean') {
                const valueName = option.valueName || 'VALUE';
                optionText += `=${colorOptionArgument(valueName)}`;
                indentSize += `=${valueName}`.length;
            }
            if (option.description) {
                const indentSizeIncludingTab = (size) => {
                    return (Math.floor(size / TAB_SIZE) + 1) * TAB_SIZE + 1;
                };

                // Wrap the description based on the terminal width, with each line indented.
                let remainingWidth = vars.size.cols - indentSizeIncludingTab(indentSize);
                let skipIndentOnFirstLine = true;

                // If there's not enough room after a very long option name, start on the next line.
                if (remainingWidth < 30) {
                    optionText += '\n';
                    indentSize = 8;
                    remainingWidth = vars.size.cols - indentSizeIncludingTab(indentSize);
                    skipIndentOnFirstLine = false;
                }

                const wrappedDescriptionLines = wrapText(option.description, remainingWidth);
                for (const line of wrappedDescriptionLines) {
                    if (skipIndentOnFirstLine) {
                        skipIndentOnFirstLine = false;
                    } else {
                        optionText += ' '.repeat(indentSize);
                    }
                    optionText += `\t ${line}\n`;
                }
            } else {
                optionText += '\n';
            }
            out.write(optionText);
        }
        out.write('\n');
    }
}