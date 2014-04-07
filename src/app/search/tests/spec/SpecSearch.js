require([
    'app/search/Search',

    'dojo/_base/window',

    'dojo/dom-construct',

    'stubmodule'
], function(
    WidgetUnderTest,

    win,

    domConstruct,

    stubmodule
) {

    var widget;

    afterEach(function() {
        if (widget) {
            widget.destroy();
            widget = null;
        }
    });

    describe('app/search/Search', function() {
        describe('Sanity', function() {
            beforeEach(function() {
                widget = new WidgetUnderTest(null, domConstruct.create('div', null, win.body()));
            });

            it('should create a Search', function(done) {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));

                var arraySpy = jasmine.createSpyObj('array', ['forEach']);
                stubmodule('app/search/Search', {
                    'dojo/_base/array': arraySpy
                }).then(function (Stubbed) {
                    new Stubbed(null);
                    expect(arraySpy.forEach).toHaveBeenCalled();
                    done();
                });
            });
        });
    });
});