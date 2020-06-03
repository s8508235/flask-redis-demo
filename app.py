from flask import Flask, send_from_directory, request, jsonify
import redis
from dotenv import load_dotenv
from pathlib import Path
import urllib
from requests import Request, get
import os
import json
from util import query_param

load_dotenv()

app = Flask(__name__)
redis_url = f"redis://:{os.getenv('PASSWORD')}@{os.getenv('HOST', '127.0.0.1')}:{os.getenv('PORT', '6379')}/0"
redis_client = redis.from_url(redis_url)


@app.route('/', methods=["GET"])
def index():
    return app.send_static_file('index.html')


@app.route('/query', methods=["GET"])
def query_ebay():
    if request.method == 'GET':
        print(request.args)
        req_obj = {"OPERATION-NAME": "findItemsAdvanced",
                   "SERVICE-VERSION": "1.0.0", "SECURITY-APPNAME": os.getenv("API_KEY"), "RESPONSE-DATA-FORMAT": "JSON"}
        parsed = query_param.parse(request.args.copy())
        req_obj.update(parsed)
        parsed_redis_key = json.dumps(parsed)

        if redis_client.exists(parsed_redis_key):
            return redis_client.get(parsed_redis_key)
        else:
            r = get(
                'https://svcs.ebay.com/services/search/FindingService/v1', params=req_obj)
            json_text = r.json()
            json_text["request"] = request.args.get("keywords")
            redis_client.set(parsed_redis_key, json.dumps(json_text), ex=5 * 60)
            # remove if exist 
            redis_client.lrem('latest-three', 0 , parsed_redis_key)
            if redis_client.llen('latest-three') == 3:
                redis_client.ltrim('latest-three', 1, -1)
            elif redis_client.llen('latest-three') > 3:
                redis_client.ltrim('latest-three', -3, -1)
            redis_client.rpush('latest-three', parsed_redis_key)
            return jsonify(json_text)


@app.route('/latest')
def latest():
    if redis_client.exists("latest-three"):
        latest_three_query = redis_client.lrange("latest-three", 0, -1)
        latest_three = [] # [ json.loads(query) for query in latest_three_query]
        for latest_query in latest_three_query:
            query = json.loads(latest_query)
            latest_three.append(query)
        
        return jsonify(query_param.encode(latest_three))
    return jsonify({})


if __name__ == "__main__":
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run()
