define([
    'dojo/text!./templates/QueryLayerHeader.html',

    'dojo/_base/declare',
    'dojo/dom-construct',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin'

], function (
    template,

    declare,
    domConstruct,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //      A collapsable container to hold QueryLayer widgets that share the same heading.

        templateString: template,
        baseClass: 'query-layer-header panel panel-default',
        widgetsInTemplate: true,

        // Properties to be sent into constructor

        // name: String
        //      The name of the heading
        name: null,

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.log('app/search/QueryLayerHeader::postCreate', arguments);

            const openIcon = 'glyphicon-triangle-bottom';
            const closeIcon = 'glyphicon-triangle-right';

            $(this.collapsePanel).on('show.bs.collapse', (event) => {
                event.stopPropagation();
                this.icon.classList.remove(closeIcon);
                this.icon.classList.add(openIcon);
            });
            $(this.collapsePanel).on('hide.bs.collapse', (event) => {
                event.stopPropagation();
                this.icon.classList.add(closeIcon);
                this.icon.classList.remove(openIcon);
            });

            this.inherited(arguments);
        }
    });
});
