define([], function () {
    return {
        getRadioFilterParts: function (text) {
            // get label first
            if (text[text.length - 1] !== ')') {
                throw new Error('Invalid radio filter! "' + text + '"');
            }

            let groups = 0;
            for (let i = text.length - 1; i >= 0; i--) {
                const char = text[i];
                if (char === ')') {
                    groups++;
                } else if (char === '(') {
                    groups--;
                    if (groups === 0) {
                        return {
                            label: text.substring(i + 1, text.length - 1),
                            value: text.substring(0, i - 1)
                        };
                    }
                }
            }

            throw new Error('Invalid radio filter! "' + text + '"');
        }
    };
});
