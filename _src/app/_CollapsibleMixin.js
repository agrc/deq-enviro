define([
    'dojo/_base/declare',
    'dojo/dom-construct',

    'bootstrap'
], function (
    declare,
    domConstruct
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
                toggle: true
            });

            const openIcon = 'glyphicon-triangle-bottom';
            const closeIcon = 'glyphicon-triangle-right';
            pane.each(function () {
                var state = localStorage[this.id];
                if (state !== undefined) {
                    $(this).collapse(state);
                }

                const anchor = $(`a[href="#${this.id}"]`)[0];
                const header = $(':header', anchor)[0];
                const icon = domConstruct.create('span', {
                    className: 'glyphicon ' + (state === 'hide' ? closeIcon : openIcon),
                    style: {
                        'font-size': '0.8em'
                    }
                }, header, 'first');

                $(this).on('show.bs.collapse', () => {
                    localStorage[this.id] = 'show';
                    icon.classList.remove(closeIcon);
                    icon.classList.add(openIcon);
                });
                $(this).on('hide.bs.collapse', () => {
                    localStorage[this.id] = 'hide';
                    icon.classList.add(closeIcon);
                    icon.classList.remove(openIcon);
                });
            });

            this.inherited(arguments);
        }
    });
});
