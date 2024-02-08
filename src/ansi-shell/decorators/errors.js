export default {
    name: 'errors',
    decorate (fn, { command, ctx }) {
        return async (...a) => {
            try {
                await fn(...a);
            } catch (e) {
                console.log('GOT IT HERE');
                // message without "Error:"
                let message = e.message;
                if (message.startsWith('Error: ')) {
                    message = message.slice(7);
                }
                ctx.externs.err.write(
                    '\x1B[31;1m' + command.name + ': ' + message + '\x1B[0m\n'
                );
            }
        }
    }
}
