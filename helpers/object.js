module.exports = {
    'access': (srcObj, key) => {
        let search = key.replace(/\[(\w+)]/g, '.$1');
        let object = srcObj;

        search = search.replace(/^\./, '');

        const list = search.split('.');

        for (let i = 0, max = list.length; i < max; ++i) {
            const k = list[i];

            if (k in object) {
                object = object[k];
            } else {
                return;
            }
        }

        return object;
    }
};
