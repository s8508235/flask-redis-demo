from flask import Flask, send_from_directory, request, jsonify
from dotenv import load_dotenv
from pathlib import Path
import urllib
from requests import Request, get
import os
import json
from util import query_param
load_dotenv()

app = Flask(__name__)


@app.route('/', methods=["GET"])
def hello_ebay():
    return app.send_static_file('index.html')


@app.route('/query', methods=["GET"])
def show_result():
    if request.method == 'GET':
        print(request.args)
        req_obj = {"OPERATION-NAME": "findItemsAdvanced",
                   "SERVICE-VERSION": "1.0.0", "SECURITY-APPNAME": os.getenv("API_KEY"), "RESPONSE-DATA-FORMAT": "JSON"}
        parsed = query_param.parse(request.args.copy())
        req_obj.update(parsed)

        r = get(
            'https://svcs.ebay.com/services/search/FindingService/v1', params=req_obj)
        json_text = json.loads(r.text)
        return jsonify(json_text)


if __name__ == "__main__":
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run()
