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
export const printUsage = async (command, out) => {
    const { name, usage, description, args } = command;
    const { options } = args;

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
        out.write(`${description}\n\n`);
    }

    if (options) {
        heading('Options');

        for (const optionName in options) {
            let optionText = '';
            const option = options[optionName];
            if (option.short) {
                optionText += colorOption('-' + option.short) + ', ';
            } else {
                optionText += `    `;
            }
            optionText += colorOption(`--${optionName}`);
            if (option.type !== 'boolean') {
                const valueName = option.valueName || 'VALUE';
                optionText += `=${colorOptionArgument(valueName)}`;
            }
            if (option.description) {
                optionText += `\t ${option.description}`;
            }
            out.write(`  ${optionText}\n`);
        }
        out.write('\n');
    }
}