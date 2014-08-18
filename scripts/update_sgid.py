# handles updating data in SGID from the various data sources
# performs ETL process if necessary

import arcpy
import spreadsheet
import settings
from settings import fieldnames
from os import path
import scratch

excludeFields = {'GlobalID', 
                 'POSTTONET', 
                 'Shape', 
                 'OBJECTID', 
                 'Shape.len', 
                 'Shape.area', 
                 'Shape.STArea()',
                 'Shape.STLength()',
                 'Shape_Length',
                 'Shape_Area'}
latitudeLongitude = ['LONGITUDE', 'LATITUDE']
eastingNorthing = ['EASTING', 'NORTHING']
utm = arcpy.SpatialReference(26912)
wgs = arcpy.SpatialReference(4326)
truncateFields = [
                  #[<field name>, <max length>]
                  ['PROJDESC', 2000]
                  ]
logger = None
errors = []


def run(logr, test_layer=None):
    global logger, errors
    logger = logr
    for dataset in spreadsheet.get_datasets():
        if test_layer and dataset[fieldnames.sgidName] != test_layer:
            continue
        try:
            sgidName = dataset[fieldnames.sgidName]
            sgid = path.join(settings.sgid, sgidName)
            sourceName = dataset[fieldnames.sourceData]
            source = path.join(settings.dbConnects, sourceName)
            
            # only try to update rows with valid sgid names and data sources
            if sgidName.startswith('SGID10.ENVIRONMENT') and not sourceName.startswith('<'):
                sgidType = arcpy.Describe(sgid).datasetType
                sourceType = arcpy.Describe(source).datasetType
                
                logger.logMsg('\n\nupdating: {}({}) \n    from: {}({})'.format(sgidName,
                                                                           sgidType, 
                                                                           sourceName,
                                                                           sourceType))
                
                fields = compare_field_names(get_field_names(source), get_field_names(sgid))
                commonFields = fields[0]
                mismatchFields = fields[1]
                
                if len(mismatchFields) > 0:
                    logger.logMsg('Field mismatches: {}'.format(mismatchFields))
                    errors.append('Field mismatches between {} & {}: \n{}'.format(sgidName,
                                                                                  sourceName,
                                                                                  mismatchFields))
                
                if sgidType == sourceType:
                    logger.logMsg('No ETL needed, copying data')
                    update_sgid_data(source, sgid)
                else:
                    # bring on the ETL, should always be table -> point feature class
                    sgidScratch = arcpy.CreateFeatureclass_management(scratch.scratchGDB, 
                                                                      r'/{}'.format(sgidName.split('.')[-1]), 
                                                                      "#", 
                                                                      sgid)
                    sgidFields = ['SHAPE@XY'] + commonFields
                    sourceFields = get_source_fields(commonFields)
                    
                    etl(sgidScratch, sgidFields, source, sourceFields)
                    
                    update_sgid_data(sgidScratch, sgid)
        except:
            errors.append('Execution error trying to update {}:\n{}'.format(sgidName, logger.logError().strip()))
    return errors

def etl(dest, destFields, source, sourceFields):
    logger.logMsg('ETL needed')
    where = '{} IS NOT NULL AND {} IS NOT NULL'.format(sourceFields[0], sourceFields[1])
    with arcpy.da.InsertCursor(dest, destFields) as icursor, arcpy.da.SearchCursor(source, sourceFields, where) as scursor:
        for row in scursor:
            # conver to list so that we can modify and index
            row = list(row)
            
            # use xy fields to create the point in feature class
            if sourceFields[0] == latitudeLongitude[0]:
                # project points from ll to utm
                lng = float(row[0])
                lat = float(row[1])
                if lng < 0 and lat > 0:
                    pnt = arcpy.Point()
                    pnt.X = lng
                    pnt.Y = lat
                    pntGeo = arcpy.PointGeometry(pnt, wgs)
                    pntGeo.projectAs(utm)
                    x = pntGeo.firstPoint.X
                    y = pntGeo.firstPoint.Y
                else:
                    continue
            else:
                x = row[0]
                y = row[1]
                
            # some fields need to be truncated
            for tf in truncateFields:
                fName = tf[0]
                maxLength = tf[1]
                if fName in sourceFields:
                    i = sourceFields.index(fName)
                    value = row[i]
                    if not value is None:
                        row[i] = row[i][:maxLength]
            
            icursor.insertRow([(x, y)] + row[2:])

def get_source_fields(commonFields):
    # add duplicate xy fields to the start of the list so that we can 
    # use them to create points later
    upper = [f.upper() for f in commonFields]
    
    if set(eastingNorthing).issubset(upper):
        xy = [commonFields[upper.index(eastingNorthing[0])],
              commonFields[upper.index(eastingNorthing[1])]]
    else:
        xy = latitudeLongitude
    return list(xy) +  commonFields
    
def update_sgid_data(source, destination):
    arcpy.TruncateTable_management(destination)
    arcpy.Append_management(source, destination, 'NO_TEST')
    
def compare_field_names(source, sgid):
    # returns a list containing:
    # [<source fields>, <sgid fields>, <mismatches>]
    mismatchedFields = list((sgid ^ source) - excludeFields)
    
    l = list(set(sgid & source))
    
    return (l, mismatchedFields)

def get_field_names(ds):
    return set([f.name for f in arcpy.ListFields(ds)])
    
if __name__ == "__main__":
    from agrc import logging
    import sys
    
    logger = logging.Logger()
    run(logger, sys.argv[1])
    print('done')