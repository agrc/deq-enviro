/* jshint maxlen: 2000 */
define([], function () {
    return {
        queryLayers: [{
            'metaDataUrl': 'http://168.178.6.35/DAQ/DaqPermitTitleMeta.htm',
            'index': 1,
            'name': 'Permitting and Compliance - Operating Permits/Title V Permits',
            'heading': 'Air',
            'description': 'The Permitting Branch is responsible for issuing two kinds of permits, construction and operating permits. Operating permits are issued, on an ongoing basis, through Title V of the CAA.  Major and Minor Source Compliance sections are responsible for ensuring that all regulatory requirements are met. This is done through inspections, audits, and enforcement.',
            'geometryType': 'point'
        }, {
            'metaDataUrl': 'http://168.178.6.35/DAQ/DaqPermitNSRMeta.htm',
            'index': 2,
            'name': 'Permitting and Compliance - Approval Orders/NSR',
            'heading': 'Air',
            'description': 'The Permitting Branch is responsible for issuing two kinds of permits, construction and operating permits. Construction permits are issued to new or modified sources of air pollution through the New Source Review program.  Major and Minor Source Compliance sections are responsible for ensuring that all regulatory requirements are met. This is done through inspections, audits, and enforcement..',
            'geometryType': 'point'
        }, {
            'metaDataUrl': 'http://168.178.6.35/DERR/DerrEnvirIncidMeta.htm',
            'index': 3,
            'name': 'Environmental Incidents',
            'heading': 'Petroleum Storage Tanks and CERCLA',
            'description': 'This data layer contains incident information submitted to the Division of Environmental Response and Remediation, and is provided as a service to the public.',
            'geometryType': 'polygon'
        }, {
            'metaDataUrl': 'http://168.178.6.35/DDW/DdwWSFacMeta.htm',
            'index': 4,
            'name': 'Public Water System Facilities',
            'heading': 'Division of Drinking Water',
            'description': 'Public water system facilities',
            'geometryType': 'point'
        }, {
            'metaDataUrl': 'http://168.178.6.35/DDW/DdwGWZonesMeta.htm',
            'index': 5,
            'name': 'Ground Water Protection Zones',
            'heading': 'Division of Drinking Water',
            'description': 'Drinking Water Source Protection zones for ground-water sources',
            'geometryType': 'point'
        }],
        links: [{
            id: 1,
            description: 'description text',
            url: 'helloUrl'
        }]
    };
});
