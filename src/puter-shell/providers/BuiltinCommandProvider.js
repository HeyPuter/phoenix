import builtins from '../coreutils/__exports__';

export class BuiltinCommandProvider {
    async lookup (id) {
        return builtins[id];
    }
}
