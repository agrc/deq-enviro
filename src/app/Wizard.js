define([
    'dojo/text!./templates/Wizard.html',

    'dojo/_base/declare',
    'dojo/topic',
    'dojo/on',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    './_CollapsibleMixin',
    './config'
], function(
    template,

    declare,
    topic,
    on,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    _CollapsibleMixin,
    config
) {
    return declare(
        [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _CollapsibleMixin], {
        // description:
        //      The title pane with help text.

        templateString: template,
        baseClass: 'wizard panel-group',
        widgetsInTemplate: true,

        // panes: ContentPane[]
        //      The panes in the wizard
        panes: null,

        // currentPaneIndex: Number
        //      The index of the currently selected pane within this.panes
        currentPaneIndex: null,

        // Properties to be sent into constructor

        constructor: function () {
            // summary:
            //      description
            console.log('app/Wizard::constructor', arguments);

            this.currentPaneIndex = 0;
        
            this.inherited(arguments);
        },
        postCreate: function() {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private
            console.log('app/Wizard::postCreate', arguments);

            this.panes = [
                this.introPane,
                this.layersPane,
                this.searchPane
            ];

            var that = this;
            this.own(
                on(this.backBtn, 'click', function () {
                    that.changePane(false);
                }),
                on(this.nextBtn, 'click', function () {
                    that.changePane(true);
                })
            );

            this.inherited(arguments);
        },
        close: function (evt) {
            // summary:
            //      closes the pane
            // evt: Event Object
            console.log('app/Wizard::close', arguments);
        
            evt.preventDefault();

            $(this.panel).collapse('hide');
        },
        requestAccess: function (evt) {
            // summary:
            //      opens the request access form
            // evt: Event Object
            console.log('app/Wizard::requestAccess', arguments);
        
            evt.preventDefault();

            topic.publish(config.topics.appWizard.requestAccess);
        },
        changePane: function (advance) {
            // summary:
            //      changes the currently selected pane for the wizard
            // advance: Boolean
            //      If true, the next pane is shown. If false, the previous pane is shown
            console.log('app/Wizard::changePane', arguments);
        
            if (advance) {
                this.currentPaneIndex = this.currentPaneIndex + 1;
            } else {
                this.currentPaneIndex = this.currentPaneIndex - 1;
            }

            this.backBtn.disabled = this.currentPaneIndex === 0;
            this.nextBtn.disabled = this.currentPaneIndex === this.panes.length - 1;

            this.stackContainer.selectChild(this.panes[this.currentPaneIndex]);
        }
    });
});