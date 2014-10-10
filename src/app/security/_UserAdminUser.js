define([
    'dojo/text!./templates/_UserAdminUser.html',

    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/query',

    'ijit/widgets/authentication/_UserAdminUser',

    'app/security/_LayersMixin',


    'selectpicker',
    'datepicker'
], function(
    template,

    declare,
    array,
    lang,
    query,

    _UserAdminUser,

    _LayersMixin
) {
    return declare([_UserAdminUser, _LayersMixin], {
        // description:
        //      Overriden to allow editing of addition properties specific to deq.

        templateString: template,
        widgetsInTemplate: true,

        // Properties to be sent into constructor

        // accessRules: Object
        //      props: startDate, endDate, options: layers, locationTxt
        accessRules: null,

        // additional: Object
        //      props: phone, address, city, state, zip
        additional: null,

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.security._UserAdminUser::postCreate', arguments);

            // update additional properties

            $(this.endDate).datepicker('update', new Date(this.accessRules.endDate));
            $(this.endDate).on('change', lang.hitch(this, 'validate'));

            // had to init this plugin via JS instead of data-provide
            // for some reason it wasn't being initialized via data-provide
            // quick enough to all setting the value within this method
            $(this.countiesSelect).selectpicker({
                size: 10,
                width: '100%'
            });
            $(this.countiesSelect).selectpicker('val', this.accessRules.options.counties);
            $(this.countiesSelect).on('change', lang.hitch(this, 'validate'));

            this.phoneTxt.value = this.additional.phone;
            this.addressTxt.value = this.additional.address;
            this.cityTxt.value = this.additional.city;
            this.stateTxt.value = this.additional.state;
            this.zipTxt.value = this.additional.zip;
            this.locationTxt.value = this.accessRules.options.locationTxt;

            var that = this;
            this.buildLayerCheckboxes().then(function () {
                array.forEach(that.accessRules.options.layers, function (index) {
                    var chbx = query('input[type="checkbox"][value="' + index + '"]', that.domNode)[0];
                    if (chbx) {
                        chbx.checked = true;
                    }
                });
            });

            this.inherited(arguments);
        },
        isValid: function () {
            // summary:
            //      overriden to require at least one layer and geographic region
            console.log('app/security/_UserAdminUser:isValid', arguments);
        
            var counties = $(this.countiesSelect).val();
            var endDate = $(this.endDate).datepicker('getDate').getTime();
            return (
                counties !== null &&
                this.getLayers().length > 0 &&
                endDate === endDate // not NaN
                ) &&
                !(
                    this.emailTxt.value === this.email &&
                    this.firstTxt.value === this.first &&
                    this.lastTxt.value === this.last &&
                    this.roleSelect.value === this.role &&
                    this.agencyTxt.value === this.agency &&
                    this.phoneTxt.value === this.additional.phone &&
                    this.addressTxt.value === this.additional.address &&
                    this.cityTxt.value === this.additional.city &&
                    this.stateTxt.value === this.additional.state &&
                    this.zipTxt.value === this.additional.zip &&
                    this.getLayers() === this.accessRules.options.layers &&
                    endDate === this.accessRules.endDate
                ) && (
                    this.emailTxt.value.length > 0 &&
                    this.firstTxt.value.length > 0 &&
                    this.lastTxt.value.length > 0 &&
                    this.roleSelect.value.length > 0 &&
                    this.agencyTxt.value.length > 0 &&
                    counties !== null && counties.length > 0 &&
                    this.getLayers().length > 0
                );
        },
        getData: function () {
            // summary:
            //      overriden from inherited to add additional properties
            console.log('app/security/_UserAdminUser:getData', arguments);
        
            var data = this.inherited(arguments);
            data.additional = {
                phone: this.phoneTxt.value,
                address: this.addressTxt.value,
                city: this.cityTxt.value,
                state: this.stateTxt.value,
                zip: this.zipTxt.value
            };
            data.accessRules = {
                endDate: $(this.endDate).datepicker('getDate').getTime(),
                options: {
                    counties: $(this.countiesSelect).val(),
                    locationTxt: this.locationTxt.value,
                    layers: this.getLayers()
                }
            };

            return data;
        }
    });
});