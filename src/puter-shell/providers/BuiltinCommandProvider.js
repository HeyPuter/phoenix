import builtins from '../coreutils/__exports__.js';

export class BuiltinCommandProvider {
    async lookup (id) {
        return builtins[id];
    }
}
