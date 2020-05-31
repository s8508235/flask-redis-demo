from flask import Flask, send_from_directory, request, jsonify
from dotenv import load_dotenv
from pathlib import Path
import urllib
from requests import Request, get
import os
import json
from util import enum, filter
load_dotenv()

app = Flask(__name__)


@app.route('/', methods=["GET"])
def hello_ebay():
    return app.send_static_file('index.html')


@app.route('/query', methods=["POST"])
def show_result():
    if request.method == 'POST':
        # print(request.form)
        req_obj = {"OPERATION-NAME": "findItemsAdvanced",
                   "SERVICE-VERSION": "1.0.0", "SECURITY-APPNAME": os.getenv("API_KEY"), "RESPONSE-DATA-FORMAT": "JSON"}

        req_obj.update({"keywords": (request.form.get(
            "keywords")), "sortOrder": enum.sortbyText(int(request.form.get("sortby")))})
        # r = get('https://svcs.ebay.com/services/search/FindingService/v1', params = req_obj)
        # p = Request(
        #     'GET', 'https://svcs.ebay.com/services/search/FindingService/v1', params=req_obj).prepare()
        # print(p.url)
        # print(r.text[:1000])
        # print(req_obj)
        # json_text = json.loads(r.text)
        with open('harry_porter.json', "r", encoding="utf-8") as json_file:
            json_text = json.load(json_file)
        json_text["request"] = request.form.get("keywords")
        print(json_text["findItemsAdvancedResponse"][0]["ack"])
        return jsonify(json_text)


if __name__ == "__main__":
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run()
