define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom-construct'

], function(
    declare,
    lang,
    domConstruct
) {
    return declare(null, {
        // description:
        //      Adds this widget as a popover to the passed in popoverBtn node.


        // Properties to be sent into constructor

        // popoverBtn: DomNode
        //      The button that will toggle this popup
        popoverBtn: null,

        postCreate: function () {
            // summary:
            //      description
            console.log('app/_PopoverMixin::postCreate', arguments);

            // remove title so that the custom title in the constructor
            // below will be recognized
            var title = this.popoverBtn.title;
            this.popoverBtn.title = '';

            var titleDiv = domConstruct.create('div', {
                innerHTML: title
            });
            domConstruct.create('button', {
                'class': 'close',
                innerHTML: '&times;',
                click: lang.hitch(this, 'hide')
            }, titleDiv);

            $(this.popoverBtn).popover({
                content: this.domNode,
                container: 'body',
                html: true,
                title: titleDiv
            });

            this.popoverBtn.title = title;
        },
        show: function () {
            // summary:
            //      shows the popover
            console.log('app/_PopoverMixin:show', arguments);
        
            $(this.popoverBtn).popover('show');
        },
        hide: function () {
            // summary:
            //      hides the popover
            console.log('app/_PopoverMixin:hide', arguments);
        
            $(this.popoverBtn).popover('hide');
        }
    });
});