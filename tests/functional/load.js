define([
    './page_objects/IndexPage',

    'intern!object',

    'intern/chai!assert'
], function (
    IndexPage,

    registerSuite,

    assert
) {
    registerSuite(function () {
        var page;
        var remote;
        return {
            setup: function () {
                page = new IndexPage(this.remote);
                remote = this.remote;
            },
            'app loads': function () {
                return page.loadPage()
                    .then(function () {
                        assert.ok(true);
                    })
                ;
            },
            'query layer headers built': function () {
                return page.loadPage()
                    .then(function () {
                        return remote.findAllByCssSelector('.query-layer-header')
                            .then(function (headers) {
                                assert.equal(headers.length, 5);
                            })
                        ;
                    })
                ;
            },
            'query layer widgets built': function () {
                return page.loadPage()
                    .then(function () {
                        return remote.findAllByCssSelector('.query-layer')
                            .then(function (headers) {
                                assert.isAbove(headers.length, 20);
                            })
                        ;
                    })
                ;
            },
            'basemap is loaded': function () {
                return page.loadPage()
                    .then(function () {
                        return remote.findAllByCssSelector('.layerTile')
                            .then(function (tiles) {
                                assert.isAbove(tiles.length, 4);
                            })
                        ;
                    })
                ;
            },
            'legends are loaded': function () {
                // mostly to test that the testing proxies are working
                return page.loadPage()
                    .then(page.openMapReferenceLayers.bind(page))
                    .then(function () {
                        return remote.findByCssSelector('div[data-dojo-attach-point="legendTip"]')
                            .moveMouseTo()
                            .then(function () {
                                remote.findAllByCssSelector('.tooltip .legend .patch-cell')
                                .then(function (cells) {
                                    assert.isAbove(cells.length, 1);
                                });
                            })
                        ;
                    })
                ;
            }
        };
    });
});
