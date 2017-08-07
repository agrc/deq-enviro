import arcpy

table_id_map = '{"VCP": ["C004"], "BFTARGETED": ["3"], "UICFacility": ["UTU35F04CBB9F3"]}'

#: using .py file (only way I could get pdb to work)
# import DeqEnviro
# tool = DeqEnviro.Tool()
# map_param = arcpy.Parameter()
# map_param.value = table_id_map
# type_param = arcpy.Parameter()
# type_param.value = 'csv'
#
# data_param = arcpy.Parameter()
# data_param.value = r'C:\MapData\deqquerylayers.gdb'
#
# output_param = arcpy.Parameter()
# output_param.value = r'C:\temp'
#
# tool.execute([map_param, type_param, output_param, data_param], None)


#: using .pyt


print('importing toolbox')
arcpy.ImportToolbox(r'\\Mac\Documents\Projects\deq-enviro\scripts\download\DeqEnviro.pyt')

print('running tool')
arcpy.DeqEnviro.Tool(table_id_map, 'csv', r'C:\MapData\deqquerylayers.gdb')
