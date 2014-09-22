require([
    'app/map/Print',
    'app/map/MapButton',

    'dojo/dom-construct',
    'dojo/dom-class',
    'dojo/query',

    'agrc/widgets/map/BaseMap'
], function(
    WidgetUnderTest,
    MapButton,

    domConstruct,
    domClass,
    query,

    BaseMap
) {
    describe('app/map/Print', function() {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function(done) {
            var btn = new MapButton();
            var map = new BaseMap(domConstruct.create('div'));
            map.on('load', function () {
                widget = new WidgetUnderTest({
                    map: map,
                    btn: btn.domNode
                }, domConstruct.create('div', null, document.body));
                done();
            });
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a Print', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('showLoader', function () {
            it('disables print button and sets text', function () {
                var value = 'blah';

                widget.showLoader(value);

                expect(widget.printBtn.innerHTML).toBe(value);
                expect(widget.printBtn.disabled).toBe(true);
            });
        });
        describe('hideLoader', function () {
            it('enables button and resets text', function () {
                widget.printBtn.disabled = true;
                widget.printBtn.innerHTML = 'blah';

                widget.hideLoader();

                expect(widget.printBtn.disabled).toBe(false);
                expect(widget.printBtn.innerHTML).toBe(widget.btnText);
            });
        });
    });
});
