define([
    'agrc/widgets/map/BaseMap',

    'app/config',
    'app/map/MapButton',
    'app/map/MapController',
    'app/map/MapLayersPopover',
    'app/map/MeasureTool',
    'app/map/Print',
    'app/search/IdentifyPane',
    'app/search/ResultsGrid',
    'app/search/Search',

    'dijit/registry',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/Deferred',
    'dojo/dom',
    'dojo/dom-class',
    'dojo/dom-style',
    'dojo/text!./templates/App.html',
    'dojo/topic',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'dojox/fx',

    'esri/geometry/Extent',

    'ijit/widgets/authentication/LoginRegister',

    'layer-selector',

    'lodash'
], function (
    BaseMap,

    config,
    MapButton,
    MapController,
    MapLayersPopover,
    MeasureTool,
    Print,
    IdentifyPane,
    ResultsGrid,
    Search,

    registry,
    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    Deferred,
    dom,
    domClass,
    domStyle,
    template,
    topic,
    array,
    declare,
    lang,

    coreFx,

    Extent,

    LoginRegister,

    LayerSelector,

    _
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //      The main widget for the app

        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'app',

        // childWidgets: Object[]
        //      container for holding custom child widgets
        childWidgets: null,

        // map: agrc.widgets.map.Basemap
        map: null,

        // mapLayersBtn: MapButton
        mapLayersBtn: null,

        // measureToolsBtn: MapButton
        measureToolsBtn: null,

        // printToolBtn: MapButton
        printToolBtn: null,

        // login: LoginRegister
        login: null,

        // resultsGrid: ResultsGrid
        resultsGrid: null,

        // identifyPane: IdentifyPane
        identifyPane: null,


        constructor: function () {
            // summary:
            //      first function to fire after page loads
            console.info('app.App::constructor', arguments);

            config.app = this;

            this.setUpListeners();

            this.inherited(arguments);

            this.childWidgets = [];
        },
        setUpListeners: function () {
            // summary:
            //      sets up the publish/subscribes
            console.log('app/App::setUpListeners', arguments);

            var that = this;
            this.own(
                topic.subscribe(config.topics.appSearch.identify, function () {
                    that.switchBottomPanel(that.identifyPane.domNode);
                }),
                topic.subscribe(config.topics.appSearch.clear, function () {
                    that.switchBottomPanel(that.resultsGrid.domNode);
                }),
                topic.subscribe(config.topics.appSearch.searchStarted, function () {
                    that.switchBottomPanel(that.resultsGrid.domNode);
                }),
                topic.subscribe(config.topics.appSearchIdentifyPane.backToResults, function () {
                    that.switchBottomPanel(that.resultsGrid.domNode);
                })
            );
        },
        postCreate: function () {
            // summary:
            //      Fires when
            console.log('app.App::postCreate', arguments);

            // set version number
            this.version.innerHTML = config.version;

            var that = this;
            config.getAppJson().then(function (json) {
                that.disclaimerLink.href = json.otherLinks[1].url;
                that.hotLinksLink.href = json.otherLinks[2].url;
            });

            this.initMap();
            this.childWidgets = [
                this.mapLayersBtn = new MapButton({
                    title: 'Map Reference Layers',
                    iconName: 'list'
                }, this.layersBtnDiv),
                this.measureToolsBtn = new MapButton({
                    title: 'Measure Tools',
                    iconName: 'resize-horizontal'
                }, this.measureBtnDiv),
                this.printToolBtn = new MapButton({
                    title: 'Print',
                    iconName: 'print'
                }, this.printBtnDiv),
                new Search({
                    app: this
                }, this.searchDiv),
                this.login = new LoginRegister({
                    appName: config.appName,
                    logoutDiv: this.logoutDiv,
                    showOnLoad: false,
                    securedServicesBaseUrl: config.urls.secure
                }),
                this.resultsGrid = new ResultsGrid({}, this.resultsGridDiv),
                this.identifyPane = new IdentifyPane({}, this.identifyPaneDiv),
                new MapLayersPopover({
                    popoverBtn: this.mapLayersBtn.domNode
                })
            ];
            this.switchBottomPanel(this.resultsGridDiv);

            var onMapLoad = function () {
                var tool = new MeasureTool({
                    popoverBtn: that.measureToolsBtn.domNode,
                    map: that.map
                });
                that.own(tool);
                tool.startup();

                var print = new Print({
                    popoverBtn: that.printToolBtn.domNode,
                    map: that.map
                });
                that.own(print);
                print.startup();
            };
            if (this.map.loaded) {
                onMapLoad();
            } else {
                this.map.on('load', onMapLoad);
            }

            this.own(topic.subscribe(this.login.topics.signInSuccess, function (loginResult) {
                config.user = loginResult.user;
            }));

            this.inherited(arguments);
        },
        startup: function () {
            // summary:
            //
            console.log('app/App:startup', arguments);

            this.inherited(arguments);

            var that = this;
            array.forEach(this.childWidgets, function (widget) {
                that.own(widget);
                widget.startup();
            });

            this.buildAnimations();

            // for functional tests to know when app is loaded
            domClass.add(document.body, 'loaded');
        },
        initMap: function () {
            // summary:
            //      Sets up the map
            console.info('app.App::initMap', arguments);

            this.map = new BaseMap(this.mapDiv, {
                useDefaultBaseMap: false,
                showLabels: true,
                showAttribution: false,
                extent: new Extent({
                    xmax: -11762120.612131765,
                    xmin: -13074391.513731329,
                    ymax: 5225035.106177688,
                    ymin: 4373832.359194187,
                    spatialReference: {
                        wkid: 3857
                    }
                })
            });
            this.childWidgets.push(
                new LayerSelector({
                    map: this.map,
                    quadWord: config.quadWord,
                    baseLayers: ['Lite', 'Hybrid', 'Terrain', 'Topo']
                })
            );

            MapController.init({ map: this.map });
        },
        buildAnimations: function () {
            // summary:
            //      builds the animations used for this widget
            console.log('app/App:buildAnimations', arguments);

            var that = this;
            var initialCenter;
            var open;
            var onEnd = function (opened) {
                that.currentAnimationPromise.resolve();
                open = opened;
                // delay because sometimes resize was being called a bit too early
                const delay = 50;
                window.setTimeout(function () {
                    that.map.resize(true);
                    that.map.centerAt(initialCenter, true);
                }, delay);
            };
            var openGridAnimation = coreFx.combine([
                coreFx.animateProperty({
                    node: this.gridIdentifyContainer,
                    properties: {
                        height: config.gridIdentifyHeight + 1,
                        borderWidth: 1
                    },
                    onEnd: _.partial(onEnd, true)
                }),
                coreFx.animateProperty({
                    node: this.mapDiv,
                    properties: {
                        bottom: config.gridIdentifyHeight
                    }
                })
            ]);

            var closeGridAnimation = coreFx.combine([
                coreFx.animateProperty({
                    node: this.gridIdentifyContainer,
                    properties: {
                        height: 0,
                        borderWidth: 0
                    },
                    onEnd: _.partial(onEnd, false)
                }),
                coreFx.animateProperty({
                    node: this.mapDiv,
                    properties: {
                        bottom: 0
                    }
                })
            ]);

            var toggle = function (animation) {
                // don't re-open if it's already open
                if (animation === openGridAnimation && open) {
                    return true;
                }
                that.currentAnimationPromise = new Deferred();

                // don't try to animation if the map is currently zooming
                MapController.mapIsZoomingOrPanning().then(function () {
                    initialCenter = that.map.extent.getCenter();
                    animation.play();
                });
            };
            this.own(
                topic.subscribe(config.topics.app.showGrid, _.partial(toggle, openGridAnimation)),
                topic.subscribe(config.topics.app.hideGrid, _.partial(toggle, closeGridAnimation))
            );
        },
        switchBottomPanel: function (node) {
            // summary:
            //      shows the passed in node and hides the other
            // node: DomNode
            console.log('app/App:switchBottomPanel', arguments);

            domClass.remove(node, 'hidden');

            var otherNode = (node === this.identifyPane.domNode) ?
                this.resultsGrid.domNode : this.identifyPane.domNode;

            domClass.add(otherNode, 'hidden');
        }
    });
});
