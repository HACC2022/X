import json
import urllib.request
url = 'https://opendata.hawaii.gov/api/3/action/datastore_search?resource_id=3f4f7a2b-9b62-4028-ae08-a3bfdadb6587&format=csv'
fileobj = urllib.request.urlopen(url)
response_dict = json.loads(fileobj.read())
print(response_dict)