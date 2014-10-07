define([
    'dojo/_base/declare',
    'dojo/dom-construct'

], function(
    declare,
    domConstruct
) {
    return declare(null, {
        // description:
        //      Adds this widget as a popover to the passed in btn node.


        // Properties to be sent into constructor

        // btn: DomNode
        //      The button that will toggle this popup
        btn: null,

        postCreate: function () {
            // summary:
            //      description
            console.log('app/_PopoverMixin::postCreate', arguments);

            var that = this;

            // remove title so that the custom title in the constructor
            // below will be recognized
            var title = this.btn.title;
            this.btn.title = '';

            var titleDiv = domConstruct.create('div', {
                innerHTML: title
            });
            domConstruct.create('button', {
                'class': 'close',
                innerHTML: '&times;',
                click: function () {
                    $(that.btn).popover('hide');
                }
            }, titleDiv);

            $(this.btn).popover({
                content: this.domNode,
                container: 'body',
                html: true,
                title: titleDiv
            });

            this.btn.title = title;
        }
    });
});