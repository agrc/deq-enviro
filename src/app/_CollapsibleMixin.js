define([
    'dojo/_base/declare',

    'bootstrap'
], function(
    declare
) {
    return declare(null, {
        // description:
        //      A mixin for bootstrap collapsible components.


        postCreate: function () {
            // summary:
            //      description
            console.log('app/_CollapsibleMixin::postCreate', arguments);
        
            var pane = $('.accordion-collapse', this.domNode).collapse({
                parent: this.domNode,
                toggle: false
            });

            if (localStorage) {
                pane.each(function () {
                    var state = localStorage[this.id];
                    if (state !== undefined) {
                        $(this).collapse(state);
                    }
                });
                $(pane).on('shown.bs.collapse', function () {
                    localStorage[this.id] = 'show';
                });
                $(pane).on('hidden.bs.collapse', function () {
                    localStorage[this.id] = 'hide';
                });
            }

            this.inherited(arguments);
        }
    });
});