define([
    './page_objects/IndexPage',

    'intern!object'
], function (
    IndexPage,

    registerSuite
) {
    registerSuite(function () {
        var indexPage;
        var remote;
        return {
            setup: function () {
                indexPage = new IndexPage(this.remote);
                remote = this.remote;
            },

            'statewide all': function () {
                var layers = [17, 18];
                return indexPage.loadPage()
                    .then(indexPage.openPanel.bind(indexPage, 'queryLayers'))
                    .then(indexPage.selectQueryLayers.bind(indexPage, layers))
                    .then(indexPage.openPanel.bind(indexPage, 'location'))
                    .then(indexPage.statewideSearch.bind(indexPage))
                    .then(function () {
                        return remote.findById('asdf');
                    })
                ;
            }
        };
    });
});
