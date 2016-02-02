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
        var firstExtent;
        return {
            setup: function () {
                page = new IndexPage(this.remote);
            },
            'zooms to full extent of features': function () {
                // depends on sandy_underground_search.har
                // make sure that the extent doesn't change when pressing the search button
                // a second time after the grid is already open
                return page.loadPage()
                    .then(page.openPanel.bind(page, 'queryLayers'))
                    .then(page.selectQueryLayers.bind(page, ['Underground Storage Tanks']))
                    .then(page.openPanel.bind(page, 'location'))
                    .then(page.citySearch.bind(page, 'Sandy'))
                    .sleep(1000)
                    .execute(function () {
                        /* eslint-disable no-undef */
                        return AGRC.app.map.extent.toJson();
                        /* eslint-enable no-undef */
                    })
                    .then(function (extent) {
                        firstExtent = extent;
                    })
                    .findByCssSelector('button[data-dojo-attach-point="searchBtn"]')
                        .click()
                        .end()
                    .sleep(1000)
                    .execute(function () {
                        /* eslint-disable no-undef */
                        return AGRC.app.map.extent.toJson();
                        /* eslint-enable no-undef */
                    })
                    .then(function (extent) {
                        assert.deepEqual(extent, firstExtent, 'extents changed');
                    })
                ;
            }
        };
    });
});
