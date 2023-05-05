import { XDocumentPTT } from "./XDocumentPTT";
import ReadlineLib from "./shell/readline";

export const main_shell = async () => {
    const ptt = new XDocumentPTT();

    // (async () => {
    //     for ( ;; ) {
    //         const chunk = (await ptt.in.read()).value;
    //         console.log('gott it', chunk);
    //         ptt.out.write(chunk);
    //     }
    // })();

    const readline = ReadlineLib.create({
        in: ptt.in,
        out: ptt.out
    });

    for ( ;; ) {
        const input = await readline('> ');
        ptt.out.write('got input: ' + input + '\n');
    }
};
