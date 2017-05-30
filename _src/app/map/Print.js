define([
    'app/config',
    'app/_PopoverMixin',

    'bootstrap',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/aspect',
    'dojo/dom-class',
    'dojo/query',
    'dojo/text!./templates/Print.html',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'esri/tasks/LegendLayer',
    'esri/tasks/PrintParameters',
    'esri/tasks/PrintTask',
    'esri/tasks/PrintTemplate',

    'ijit/modules/_ErrorMessageMixin'
], function (
    config,
    _PopoverMixin,

    bootstrap,

    _TemplatedMixin,
    _WidgetBase,

    aspect,
    domClass,
    query,
    template,
    array,
    declare,
    lang,

    LegendLayer,
    PrintParameters,
    PrintTask,
    PrintTemplate,

    _ErrorMessageMixin
) {
    return declare([_WidgetBase, _TemplatedMixin, _PopoverMixin, _ErrorMessageMixin], {
        // description:
        //      Controls for printing the map. Uses the PrintTask

        templateString: template,
        baseClass: 'print',

        // btnText: String
        //      save the button text for hideLoader
        btnText: null,

        // params: PrintParameters
        params: null,

        // task: PrintTask
        task: null,


        // Properties to be sent into constructor

        // map: Map
        map: null,

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.map.Print::postCreate', arguments);

            this.btnText = this.printBtn.innerHTML;

            var printTemplate = new PrintTemplate();
            printTemplate.layout = 'Portrait';
            printTemplate.format = 'PDF';
            printTemplate.layoutOptions = {
                titleText: config.printMapTitle
            };

            this.params = new PrintParameters();
            this.params.map = this.map;
            this.params.template = printTemplate;
            this.params.extraParameters = {
                ExportWebMapService_URL: config.urls.exportWebMap // eslint-disable-line camelcase
            };

            this.task = new PrintTask(config.urls.printProxy);

            this.own(
                this.task.on('complete', lang.hitch(this, 'onComplete')),
                this.task.on('error', lang.hitch(this, 'onError'))
            );

            this.inherited(arguments);
        },
        print: function () {
            // summary:
            //      sends data to print service
            console.log('app/map/Print:print', arguments);

            this.showLoader('Processing');

            var legendLayers = [];
            array.forEach(this.map.graphicsLayerIds, function (id) {
                if (!/graphicsLayer/.test(id)) {
                    legendLayers.push({
                        layerId: id
                    });
                }
            });
            this.params.template.layoutOptions.legendLayers = legendLayers;
            this.task.execute(this.params);
        },
        onComplete: function (evt) {
            // summary:
            //      print completed successfully
            // evt: {result: {url: String}}
            console.log('app/map/Print:onComplete', arguments);

            this.downloadLink.href = evt.result.url;
            domClass.remove(this.downloadLinkAlert, 'hidden');

            this.hideLoader();

            $(this.popoverBtn).popover('show');
        },
        onError: function (evt) {
            // summary:
            //      print returned an error
            // evt: {error: Error}
            console.log('app/map/Print:onError', arguments);

            this.showErrMsg(evt.error.message);
            this.hideLoader();
        },
        showLoader: function (msg) {
            // summary:
            //      disables the print button and sets message text
            // msg: String
            console.log('app/map/Print:showLoader', arguments);

            this.printBtn.disabled = true;
            this.printBtn.innerHTML = msg;

            query('.alert', this.domNode).forEach(function (n) {
                domClass.add(n, 'hidden');
            });
            $(this.popoverBtn).popover('show');
        },
        hideLoader: function () {
            // summary:
            //      resets the button
            console.log('app/map/Print:hideLoader', arguments);

            this.printBtn.disabled = false;
            this.printBtn.innerHTML = this.btnText;
            $(this.popoverBtn).popover('show');
        },
        hideLink: function () {
            // summary:
            //      hides the link after the user clicks on it
            console.log('app/map/Print:hideLink', arguments);

            domClass.add(this.downloadLinkAlert, 'hidden');
            $(this.popoverBtn).popover('show');
        }
    });
});
