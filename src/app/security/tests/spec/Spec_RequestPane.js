require([
    'app/security/_RequestPane',

    'dojo/dom-construct',
    'dojo/Deferred',
    'dojo/query',

    'app/config'
], function(
    WidgetUnderTest,

    domConstruct,
    Deferred,
    query,

    config
) {
    describe('app/security/_RequestPane', function() {
        var widget;
        var destroy = function(widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function() {
            var def = new Deferred();
            spyOn(config, 'getAppJson').and.returnValue(def);
            def.resolve({
                queryLayers: [{
                    secure: 'No'
                }, {
                    secure: 'Yes',
                    name: 'Layer Name',
                    index: 1
                }, {
                    secure: 'Yes',
                    name: 'Layer Name Two',
                    index: 2
                }]
            });
            widget = new WidgetUnderTest({
                parentWidget: {
                    goToPane: function() {}
                }
            }, domConstruct.create('div', null, document.body));
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a _RequestPane', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('postCreat', function() {
            it('should create the layer checkboxes', function() {
                expect(widget.layersContainer.children.length).toBe(2);

                var lyr = widget.layersContainer.children[0];

                expect(lyr.children[0].children[0].value).toBe('1');
                expect(lyr.children[0].children[1].innerHTML).toBe('Layer Name');
            });
        });
        describe('validate', function() {
            it('requires all fields', function() {
                widget.fNameTxt.value = 'test';
                widget.lNameTxt.value = 'test';
                widget.agencyTxt.value = 'test';
                widget.addressTxt.value = 'test';
                widget.cityTxt.value = 'test';
                widget.stateTxt.value = 'test';
                widget.phoneTxt.value = 'test';
                widget.zipTxt.value = 'test';
                widget.emailTxt.value = 'test@test.com';
                widget.emailConfirmTxt.value = 'test@test.com';
                widget.passwordTxt.value = 'pass';
                widget.passwordConfirmTxt.value = 'pass';

                expect(widget.validate({})).toBe(false);

                widget.timeSelect.value = '3';

                expect(widget.validate({})).toBe(false);

                query('input', widget.layersContainer)[0].checked = true;

                expect(widget.validate({})).toBe(false);

                widget.locationTxt.value = 'blah';

                expect(widget.validate({})).toBe(true);
            });
        });
        describe('getData', function() {
            it('get\'s extra fields', function() {
                widget.fNameTxt.value = 'first';
                widget.lNameTxt.value = 'last';
                widget.agencyTxt.value = 'agency';
                widget.addressTxt.value = 'address';
                widget.cityTxt.value = 'city';
                widget.stateTxt.value = 'state';
                widget.phoneTxt.value = 'phone';
                widget.zipTxt.value = 'zip';
                widget.emailTxt.value = 'test@test.com';
                widget.emailConfirmTxt.value = 'test@test.com';
                widget.passwordTxt.value = 'pass';
                widget.passwordConfirmTxt.value = 'pass';
                query('input', widget.layersContainer)[0].checked = true;
                query('input', widget.layersContainer)[1].checked = true;
                widget.locationTxt.value = 'blah';
                widget.timeSelect.value = '3';

                expect(widget.getData().additional).toEqual({
                    address: 'address',
                    city: 'city',
                    state: 'state',
                    phone: 'phone',
                    zip: 'zip'
                });
                expect(widget.getData().accessRules).toEqual(jasmine.objectContaining({
                        // startDate: 1412891655130,
                        // endDate: 1420844055130,
                        options: {
                            layers: ['1', '2'],
                            locationTxt: 'blah'
                        }
                    }));
                expect(widget.getData()).toEqual(jasmine.objectContaining({
                    first: 'first',
                    last: 'last',
                    agency: 'agency',
                    email: 'test@test.com',
                    password: 'pass'
                }));
            });
        });
    });
});