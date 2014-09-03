define([
    'dojo/_base/declare',
    'dojo/dom-attr'

], function(
    declare,
    domAttr
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

            $(this.btn).popover({
                content: this.domNode,
                container: 'body',
                html: true
            });
            // put original title back since bootstrap popover removes it
            // and places it in data-original-title
            this.btn.title = domAttr.get(this.btn, 'data-original-title');
        }
    });
});