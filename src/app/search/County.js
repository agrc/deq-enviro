define([
    'dojo/text!./templates/County.html',

    'dojo/_base/declare',
    'dojo/topic',
    'dojo/dom-class',
    'dojo/Deferred',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',

    'agrc/modules/WebAPI',

    '../config',

    'esri/geometry/Polygon'
], function(
    template,

    declare,
    topic,
    domClass,
    Deferred,

    _WidgetBase,
    _TemplatedMixin,

    WebAPI,

    config,

    Polygon
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      County search controls and logic

        templateString: template,
        baseClass: 'county pad',

        // geometry: esri/geometry/Polygon
        //      The last zoomed to geometry
        geometry: null,

        // Properties to be sent into constructor

        constructor: function () {
            // summary:
            //      description
            console.log('app/search/County::constructor', arguments);

            this.api = new WebAPI({apiKey: config.apiKey});

            this.inherited(arguments);
        },
        onChange: function () {
            // summary:
            //      Fires when the user changes the select
            console.log('app/search/County::onChange', arguments);

            var value = this.select.value;
            var onSuccess = function (data) {
                if (data.length > 0) {
                    var geo = new Polygon(data[0].geometry);
                    geo.setSpatialReference(config.spatialReference);
                    topic.publish(config.topics.appMapMapController.zoomToSearchGraphic, geo);
                    that.geometry = geo;
                } else {
                    onFail('No feature found!');
                }
            };
            var that = this;
            var onFail = function (errMsg) {
                that.errMsg.innerHTML = errMsg;
                domClass.remove(that.errMsg, 'hidden');
            };
            var promise;

            domClass.add(that.errMsg, 'hidden');
            if (value === 'STATEWIDE') {
                promise = this.api.search(
                    config.featureClassNames.utah,
                    ['shape@'],
                    {predicate: config.fieldNames.utah.STATE + ' = \'Utah\''}
                );
            } else {
                promise = this.api.search(
                    config.featureClassNames.counties,
                    ['shape@'],
                    {predicate: config.fieldNames.counties.NAME + ' = \'' + value + '\''}
                );
            }
            return promise.then(onSuccess, onFail);
        },
        getGeometry: function () {
            // summary:
            //      returns last zoomed geometry
            // returns: Geometry
            console.log('app/search/County::getGeometry', arguments);

            var def = new Deferred();
            if (this.geometry) {
                def.resolve(this.geometry);
            } else {
                var that = this;
                this.onChange().then(
                    function () {
                        def.resolve(that.geometry);
                    },
                    function () {
                        def.reject('There was an error getting the search geometry!');
                    }
                );
            }

            return def.promise;
        },
        _onShow: function () {
            // summary:
            //      called when this widget becomes visable
            console.log('app.search.County::_onShow', arguments);

            if (!this.geometry) {
                this.onChange();
            }
        },
        clear: function () {
            // summary:
            //      clears the graphic and associated geometry
            console.log('app/search/County:clear', arguments);
        
            this.geometry = null;

            topic.publish(config.topics.appMapMapController.clearGraphics);

            this.select.selectedIndex = 0;
        }
    });
});