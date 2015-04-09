define([
    'intern!object',
    'intern/chai!assert',
    'require'
], function (registerSuite, assert, require) {
    registerSuite({
        name: 'statewide searches for all query layers',

        'all': function () {
            return this.remote
                .get(require.toUrl('src/index.html'))
                .
                ;
        }
    });
});