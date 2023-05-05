import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';

export default {
    input: "src/main.js",
    output: {
        file: "dist/bundle.js",
        format: "iife"
    },
    plugins: [
        nodeResolve(),
        commonjs(),
        copy({
            targets: [
                { src: 'assets/index.html', dest: 'dist' },
                { src: 'assets/shell.html', dest: 'dist' },
                { src: 'assets/normalize.css', dest: 'dist' },
                { src: 'assets/style.css', dest: 'dist' },
                { src: 'node_modules/xterm/css/xterm.css', dest: 'dist' }
            ]
        })
    ]
}

