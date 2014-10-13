import requests

host = 'localhost'
configuration = 'Debug'
service_name = 'DEQEnviro/MapService'

token_url = 'http://{}:6080/arcgis/admin/generateToken'.format(host)
update_soe_url = 'http://{}:6080/arcgis/admin/services/types/extensions/update'.format(
    host)
upload_url = 'http://{}:6080/arcgis/admin/uploads/upload?token={}'.format(
    host, '{}')
start_service_url = 'http://{}:6080/arcgis/admin/services/{}.MapServer/start'.format(
    host, service_name)

file_name = r'C:\Projects\GitHub\deq-enviro\api\Deq.Search.Soe\bin\{}\Deq.Search.Soe.soe'.format(
    configuration)

data = {'username': '',
        'password': '',
        'client': 'requestip',
        'f': 'json'}

r = requests.post(token_url, data=data)
data = {'f': 'json'}

print 'got token'

files = {'itemFile': open(file_name, 'rb'),
         'f': 'json'}

data['token'] = r.json()['token']

print 'uploading'
r = requests.post(upload_url.format(data['token']), files=files)

print r.status_code, r.json()['status']

data['id'] = r.json()['item']['itemID']

print 'updating', data['id']
r = requests.post(update_soe_url, params=data)

print r.status_code, r.json()['status']

print 'starting service'
r = requests.post(
    start_service_url, params={'f': 'json', 'token': data['token']})

print r.status_code, r.json()['status']

print 'done'
