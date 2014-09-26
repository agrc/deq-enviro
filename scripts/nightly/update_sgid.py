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
                 'SHAPE',
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
            sourceName = dataset[fieldnames.sourceData]
            source = path.join(settings.dbConnects, sourceName)
            
            # only try to update rows with valid sgid names and data sources
            if sgidName.startswith('SGID10') and not sourceName.startswith('<'):
                sgid = path.join(settings.sgid[sgidName.split('.')[1]], sgidName)
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
    if source.split('\\')[-1].startswith('TEMPO'):
        where = None
    with arcpy.da.InsertCursor(dest, destFields) as icursor:
        # da.SearchCursor throws errors if we pass in sourceFields on data from daq.odc
        # this is my work-around
        scursor = arcpy.SearchCursor(source, where)
        for orig_row in scursor:
            # create new list with data in correct order
            row = []
            for fn in sourceFields:
                row.append(orig_row.getValue(fn))

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
                    pntProj = pntGeo.projectAs(utm)
                    x = pntProj.firstPoint.X
                    y = pntProj.firstPoint.Y
                else:
                    continue
            else:
                if row[0] is not None and row[1] is not None:
                    x = scrub_coord(row[0])
                    y = scrub_coord(row[1])
                else:
                    continue
                
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

        del scursor

def scrub_coord(value):
    if isinstance(value, (int, long, float)):
        return value
    else:
        return float(value.replace(',', '').strip())

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
    def upper(a):
        return set([s.upper() for s in a])
    mismatchedFields = list((upper(sgid) ^ upper(source)) - upper(excludeFields))
    
    l = list(set(sgid & source))
    
    return (l, mismatchedFields)

def get_field_names(ds):
    return set([f.name for f in arcpy.ListFields(ds)])
    
if __name__ == "__main__":
    from agrc import logging
    import sys
    
    logger = logging.Logger()

    # first argument is optionally the SGID feature class or table name
    if len(sys.argv) == 2:
        run(logger, sys.argv[1])
    else:
        run(logger)
    print('done')