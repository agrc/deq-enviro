define([
    'dojo/Deferred',
    'dojo/promise/all',

    'intern',
    'intern/dojo/node!leadfoot/helpers/pollUntil',
    'intern/dojo/node!leadfoot/keys',

    'require'
], function (
    Deferred,
    all,

    intern,
    pollUntil,
    keys,

    require
) {
    function isElementVisible(cssSelector) {
        console.log('cssSelector', cssSelector);
        var query = require('dojo/query');
        var elements = query(cssSelector);
        var rtn;
        if (elements.length === 0) {
            rtn = null;
        } else {
            rtn = (elements.every(function (el) {
                return el.offsetWidth > 0;
            })) ? true : null;
        }
        return rtn;
    }

    function IndexPage(remote) {
        this.remote = remote;
    }

    var indexUrl = intern.args.indexUrl || require.toUrl(intern.args.indexPrefix + '/');

    IndexPage.prototype = {
        constructor: IndexPage,

        loadPage: function () {
            return this.remote
                .get(indexUrl)
                .setFindTimeout(5000)
                .findByCssSelector('body.loaded')
            ;
        },
        openMapReferenceLayers: function () {
            return this.remote
                .findByCssSelector('div.map-button[title="Map Reference Layers"]')
                    .click()
                    .end()
                .findByCssSelector('.map-layers-popover')
            ;
        },
        openPanel: function (panel) {
            return this.remote
                .findByCssSelector('a[href="#' + panel + 'Panel"]')
                    .click()
                    .end()
                .sleep(500)
            ;
        },
        selectQueryLayers: function (layers) {
            var that = this;

            var selector = '.query-layer input[name="' + layers.join('"], .query-layer input[name="') + '"]';

            return this.remote
                // .then(pollUntil(isElementVisible, ['.query-layer-header'], 5000))
                .findAllByCssSelector('.query-layer-header')
                    .then(function (headers) {
                        // click on head header allowing time for them to open
                        var def = new Deferred();

                        var i = 0;
                        var expand = function () {
                            var head = headers[i];
                            all([head.getAttribute('id'), head.click(), that.remote.sleep(500)]).then(function (vals) {
                                pollUntil(isElementVisible, ['#' + vals[0] + ' .query-layer'], 5000)
                                    .call(that.remote).then(function () {
                                        if (i < headers.length - 1) {
                                            i++;
                                            expand();
                                        } else {
                                            def.resolve();
                                        }
                                    });
                            });
                        };

                        expand();

                        return def.promise;
                    })
                    .end()
                .findAllByCssSelector(selector)
                    .click()
                    .end()
            ;
        },
        statewideSearch: function () {
            return this.remote
                .findByCssSelector('option[value="county"]')
                    .click()
                    .end()
                .findByCssSelector('button[data-dojo-attach-point="searchBtn"]')
                    .click()
                    .end()
            ;
        }
    };

    return IndexPage;
});
