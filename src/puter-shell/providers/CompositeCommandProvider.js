export class CompositeCommandProvider {
    constructor (providers) {
        this.providers = providers;
    }

    async lookup (...a) {
        for (const provider of this.providers) {
            const command = await provider.lookup(...a);
            if (command) {
                return command;
            }
        }
    }
}
