export const disallowAccessToUndefined = (obj) => {
    return new Proxy(obj, {
        get (target, prop, receiver) {
            if ( ! target.hasOwnProperty(prop) ) {
                throw new Error(
                    `disallowed access to undefined property` +
                    `: ${JSON.stringify(prop)}.`
                );
            }
            return Reflect.get(target, prop, receiver);
        }
    })
}