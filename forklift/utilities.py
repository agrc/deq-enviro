'''
utilities.py
'''


def parse_fields(fieldTxt):
    fields = []
    for txt in fieldTxt.split(', '):
        splitIndex = txt.find(' (')
        fieldname = txt[:splitIndex].strip()
        alias = txt[splitIndex + 2:-1].strip()
        if fieldname is not None and fieldname != '' and alias is not None and alias != '':
            fields.append([fieldname, alias])

    return fields
