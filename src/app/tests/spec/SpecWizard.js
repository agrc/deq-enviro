require([
    'app/Wizard',
    'app/config',

    'dojo/_base/window',

    'dojo/dom-construct',

    'matchers/topics'
], function(
    WidgetUnderTest,
    config,

    win,

    domConstruct,

    topics
) {
    describe('app/Wizard', function() {
        var widget;

        beforeEach(function() {
            widget = new WidgetUnderTest(null, domConstruct.create('div', null, win.body()));
        });

        afterEach(function() {
            if (widget) {
                widget.destroy();
                widget = null;
            }
        });

        describe('Sanity', function() {
            it('should create a Wizard', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('changePane', function () {
            it('advances to the next pane', function () {
                widget.currentPaneIndex = 1;

                widget.changePane(true);

                expect(widget.currentPaneIndex).toBe(2);
            });
            it('goes back to the previous pane', function () {
                widget.currentPaneIndex = 1;

                widget.changePane(false);

                expect(widget.currentPaneIndex).toBe(0);
            });
            it('disables back and next buttons appropriately', function () {
                widget.currentPaneIndex = 1;

                widget.changePane(false);

                expect(widget.backBtn.disabled).toBe(true);
                expect(widget.nextBtn.disabled).toBe(false);

                widget.currentPaneIndex = widget.panes.length - 2;

                widget.changePane(true);

                expect(widget.backBtn.disabled).toBe(false);
                expect(widget.nextBtn.disabled).toBe(true);

                widget.currentPaneIndex = 0;

                widget.changePane(true);

                expect(widget.backBtn.disabled).toBe(false);
                expect(widget.nextBtn.disabled).toBe(false);
            });
            it('publishes topics', function () {
                var t = config.topics.appWizard;
                topics.listen(t);
                widget.currentPaneIndex = 0;

                widget.changePane(true); // query layers

                expect(t.showQueryLayers).toHaveBeenPublished();
                expect(t.showSearch).not.toHaveBeenPublished();

                widget.changePane(true); // search

                expect(t.showSearch).toHaveBeenPublished();

                widget.changePane(false); // back to query layers

                expect(t.showQueryLayers).toHaveBeenPublishedThisManyTimes(2);

                widget.changePane(true); // back to search

                expect(t.showSearch).toHaveBeenPublishedThisManyTimes(2);

                widget.changePane(true); // results

                expect(t.showResults).toHaveBeenPublished();
            });
        });
    });
});