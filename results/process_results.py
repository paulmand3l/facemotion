from collections import defaultdict
import csv

fundamental_emotions = ['joy', 'anger', 'sadness', 'surprise', 'disgust', 'fear']

word_map = {
  'joy': ['happy', 'happiness', 'smile', 'amusement', 'pleasure', 'pleased', 'hapiness', 'very happy', 'somewhat happy', 'slightly happy', 'neutral to a little happy', 'relaxed happiness', 'happt', 'mildly pleased', 'sort of happy', 'happy/content'],
  'surprise': ['surprised', 'suprise', 'mild surprise'],
  'sadness': ['sad', 'unhappy', 'not happy', 'sad (whyyyy?)', 'sad/disheartened', 'sad (""whyyyy?"")'],
  'upset': ['upset', 'upaet'],
  'anger': ['angry', 'mad'],
  'disgust': ['disgusted'],
  'shock': ['shocked'],
  'worry': ['worried'],
  'fear': ['afraid', 'scared'],
  'content': ['contentment'],
}

inverse_word_map = {}
for root, synonyms in word_map.items():
  for synonym in synonyms:
    inverse_word_map[synonym] = root

def normalize_response(response):
  response = response.lower().strip()
  if response in inverse_word_map:
    response = inverse_word_map[response]
  return response

fieldnames = []
with open('results.csv') as csvfile:
  reader = csv.DictReader(csvfile)
  fieldnames = reader.fieldnames
  data = list(reader)

response_histogram = {}
for item in data:
  item['response'] = normalize_response(item['response'])
  response = item['response']

  if response not in response_histogram:
    response_histogram[response] = {
      'count': 0,
      'points': [],
    }

  response_histogram[response]['points'].append(item)

with open('clean_results.csv', 'w') as csvfile:
  writer = csv.DictWriter(csvfile, fieldnames)
  writer.writeheader()
  writer.writerows(data)


for emotion in fundamental_emotions:
  info = response_histogram[emotion]

  sums = defaultdict(int)
  centroid = {}

  for point in info['points']:
    sums[point['emotion0']] += float(point['value0'])

    if point['emotion1'] != '':
      sums[point['emotion1']] += float(point['value1'])

  size = len(info['points'])

  for e, total in sums.items():
    centroid[e] = total / size

  print(emotion, centroid)




