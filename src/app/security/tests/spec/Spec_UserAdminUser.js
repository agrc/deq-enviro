require([
    'app/security/_UserAdminUser',

    'dojo/dom-construct',
    'dojo/query'
], function(
    WidgetUnderTest,

    domConstruct,
    query
) {
    describe('app/security/_UserAdminUser', function() {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        var phone = '801-699-1234';
        var endDate = 1412283976527;

        beforeEach(function() {
            widget = new WidgetUnderTest({
                first: 'Scott',
                last: 'Davis',
                email: 'stdavis@utah.gov',
                role: 'viewer',
                roles: ['publisher', 'viewer', 'admin'],
                agency: 'AGRC',
                lastLogin: 1412283976527,
                adminToken: 'blah',
                userId: 'asdlfkjasdasdf',
                appName: 'unittests',
                additional: {
                    address: '123 e main',
                    city: 'salt lake city',
                    state: 'Utah',
                    phone: phone,
                    zip: '84124'
                },
                accessRules: {
                    endDate: endDate,
                    options: {
                        // counties: ['BEAVER', 'DAVIS'],
                        locationTxt: 'this is a great description of a location that ' +
                            'leaves absolutely no room for mis-interpretation'
                        // layers: [0, 1]
                    }
                }
            }, domConstruct.create('div', null, document.body));
            widget.startup();
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a _UserAdminUser', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('getLayers', function () {
            it('returns the ids of the selected layer checkboxes', function () {
                // hard code some layer checkboxes
                domConstruct.create('input', {
                    type: 'checkbox',
                    value: '1',
                    checked: true
                }, widget.layersContainer);
                domConstruct.create('input', {
                    type: 'checkbox',
                    value: '2',
                    checked: false
                }, widget.layersContainer);
                domConstruct.create('input', {
                    type: 'checkbox',
                    value: '3',
                    checked: true
                }, widget.layersContainer);

                expect(widget.getLayers()).toEqual(['1', '3']);
            });
        });
        describe('isValid', function () {
            beforeEach(function () {
                widget.emailTxt.value = 'blah';
            });
            it('requires geographic region', function () {
                spyOn(widget, 'getLayers').and.returnValue(['1']);

                expect(widget.isValid()).toBe(false);

                $(widget.countiesSelect).val('DAVIS');

                expect(widget.isValid()).toBe(true);
            });
            it('requires at least one layer', function () {
                $(widget.countiesSelect).val('DAVIS');

                expect(widget.isValid()).toBe(false);

                spyOn(widget, 'getLayers').and.returnValue(['1']);

                expect(widget.isValid()).toBe(true);
            });
            it('is valid on layers change', function () {
                var widget2 = new WidgetUnderTest({
                    first: 'Scott',
                    last: 'Davis',
                    email: 'stdavis@utah.gov',
                    role: 'viewer',
                    roles: ['publisher', 'viewer', 'admin'],
                    agency: 'AGRC',
                    lastLogin: 1412283976527,
                    adminToken: 'blah',
                    userId: 'asdlfkjasdasdf',
                    appName: 'unittests',
                    additional: {
                        address: '123 e main',
                        city: 'salt lake city',
                        state: 'Utah',
                        phone: '801-699-1234',
                        zip: '84124'
                    },
                    accessRules: {
                        endDate: Date.now(),
                        options: {
                            counties: ['BEAVER', 'DAVIS'],
                            locationTxt: 'this is a great description of a location that ' +
                                'leaves absolutely no room for mis-interpretation',
                            layers: [0, 1]
                        }
                    }
                }, domConstruct.create('div', null, document.body));

                // hard code some layer checkboxes
                domConstruct.create('input', {
                    type: 'checkbox',
                    value: '1',
                    checked: true
                }, widget2.layersContainer);
                domConstruct.create('input', {
                    type: 'checkbox',
                    value: '2',
                    checked: false
                }, widget2.layersContainer);
                domConstruct.create('input', {
                    type: 'checkbox',
                    value: '3',
                    checked: true
                }, widget2.layersContainer);

                query('ul input[type="checkbox"][value="2"]', widget2.domNode)[0].checked = true;

                expect(widget2.isValid()).toBe(true);

                destroy(widget2);
            });
        });
        describe('getData', function () {
            it('includes extra data fields', function () {
                expect(widget.getData().additional).toEqual(jasmine.objectContaining({
                    phone: phone
                }));
                expect(widget.getData().accessRules).toEqual(jasmine.objectContaining({
                    options: {
                        counties: null,
                        locationTxt: 'this is a great description of a location that ' +
                            'leaves absolutely no room for mis-interpretation',
                        layers: []
                    }
                }));
            });
        });
    });
});
