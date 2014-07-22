define([
    'dojo/text!./templates/App.html',

    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',

    'dojo/dom',
    'dojo/dom-style',
    'dojo/dom-class',
    'dojo/topic',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/registry',

    'dojox/fx',

    'agrc/widgets/map/BaseMap',

    './config',
    './map/MapButton',
    './map/MapLayersPopover',
    './Wizard',
    './search/Search',
    './search/ResultsGrid',
    './search/IdentifyPane',
    './map/MapController',

    'ijit/widgets/authentication/LoginRegister'
], function(
    template,

    declare,
    array,
    lang,

    dom,
    domStyle,
    domClass,
    topic,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    registry,

    coreFx,

    BaseMap,

    config,
    MapButton,
    MapLayersPopover,
    Wizard,
    Search,
    ResultsGrid,
    IdentifyPane,
    MapController,

    LoginRegister
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

        // login: LoginRegister
        login: null,

        // resultsGrid: ResultsGrid
        resultsGrid: null,

        // identifyPane: IdentifyPane
        identifyPane: null,


        constructor: function() {
            // summary:
            //      first function to fire after page loads
            console.info('app.App::constructor', arguments);

            config.app = this;

            this.setUpListeners();

            this.inherited(arguments);
        },
        setUpListeners: function () {
            // summary:
            //      sets up the publish/subscribes
            console.log('app/App::setUpListeners', arguments);

            var that = this;
            this.own(
                topic.subscribe(config.topics.appWizard.requestAccess, function () {
                    that.login.goToPane(that.login.requestPane);
                    that.login.show();
                }),
                topic.subscribe(config.topics.appSearch.identify, function () {
                    that.switchBottomPanel(that.identifyPane.domNode);
                }),
                topic.subscribe(config.topics.appSearch.searchStarted, function () {
                    that.switchBottomPanel(that.resultsGrid.domNode);
                }),
                topic.subscribe(config.topics.appSearchIdentifyPane.backToResults, function () {
                    that.switchBottomPanel(that.resultsGrid.domNode);
                })
            );
        },
        postCreate: function() {
            // summary:
            //      Fires when
            console.log('app.App::postCreate', arguments);

            // set version number
            this.version.innerHTML = config.version;

            var that = this;
            config.getAppJson().then(function (json) {
                that.disclaimerLink.href = json.otherLinks[1].url;
            });

            this.initMap();
            this.childWidgets = [
                this.mapLayersBtn = new MapButton({
                    title: 'Map Reference Layers',
                    iconName: 'list'
                }, this.layersBtnDiv),
                new MapButton({
                    title: 'Measure Tool',
                    iconName: 'resize-horizontal'
                }, this.measureBtnDiv),
                new MapButton({
                    title: 'Print Map',
                    iconName: 'print'
                }, this.printBtnDiv),
                new Wizard({}, this.wizardDiv),
                new Search({}, this.searchDiv),
                this.login = new LoginRegister({
                    appName: config.appName,
                    logoutDiv: this.logoutDiv,
                    showOnLoad: false,
                    securedServicesBaseUrl: config.urls.securedServicesBaseUrl
                }),
                this.resultsGrid = new ResultsGrid({}, this.resultsGridDiv),
                this.identifyPane = new IdentifyPane({}, this.identifyPaneDiv),
                new MapLayersPopover({
                    btn: this.mapLayersBtn.domNode
                })
            ];
            this.switchBottomPanel(this.resultsGridDiv);

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
        },
        initMap: function() {
            // summary:
            //      Sets up the map
            console.info('app.App::initMap', arguments);

            this.map = new BaseMap(this.mapDiv, {
                useDefaultBaseMap: false
            });

            MapController.init({map: this.map});
        },
        buildAnimations: function () {
            // summary:
            //      builds the animations used for this widget
            console.log('app/App:buildAnimations', arguments);

            var that = this;
            this.openGridAnimation = coreFx.combine([
                coreFx.animateProperty({
                    node: this.gridIdentifyContainer,
                    properties: {
                        height: config.gridIdentifyHeight + 1,
                        borderWidth: 1
                    },
                    onEnd: function () {
                        that.map.resize();
                        // TODO: preserve map extent
                    }
                }),
                coreFx.animateProperty({
                    node: this.mapDiv,
                    properties: {
                        bottom: config.gridIdentifyHeight
                    }
                })
            ]);
            this.own(topic.subscribe(config.topics.appSearch.searchStarted,
                lang.hitch(this.openGridAnimation, 'play')));

            this.closeGridAnimation = coreFx.combine([
                coreFx.animateProperty({
                    node: this.gridIdentifyContainer,
                    properties: {
                        height: 0,
                        borderWidth: 0
                    },
                    onEnd: function () {
                        that.map.resize();
                        // TODO: preserve map extent
                    }
                }),
                coreFx.animateProperty({
                    node: this.mapDiv,
                    properties: {
                        bottom: 0
                    }
                })
            ]);
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
