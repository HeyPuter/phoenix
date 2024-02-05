import { Context } from 'contextlink';
import { ANSIShell } from './ansi-shell/ANSIShell.js';
import { launchPuterShell } from './puter-shell/main.js';

const ctx = new Context();

const ansiShell = new ANSIShell(ctx);