import re


def sortbyText(x: int) -> str:
    return [
        'BestMatch',
        'CurrentPriceHighest',
        'PricePlusShippingHighest',
        'PricePlusShippingLowest'
    ][x]


def sortByNum(x: str) -> int:
    return [
        'BestMatch',
        'CurrentPriceHighest',
        'PricePlusShippingHighest',
        'PricePlusShippingLowest'
    ].index(x)


def parse(request):
    param_dict = {"keywords": request.pop(
        "keywords"), "sortOrder": sortbyText(int(request.pop("sortby")))}

    filter_cnt = 0
    filter_list = []
    print(request)
    min_price = request.pop("minimumprice")
    try:
        min_price = float(min_price)
    except ValueError:
        pass

    max_price = request.pop("maximumprice")
    try:
        max_price = float(max_price)
    except ValueError:
        pass
    # print(max_price, type(max_price), min_price, type(min_price))
    if type(min_price) is float and type(max_price) is str:
        filter_list.append(
            {"name": "MinPrice", "value": min_price, "index": filter_cnt})
        filter_cnt += 1
    elif type(max_price) is float and type(min_price) is str:
        filter_list.append(
            {"name": "MaxPrice", "value": max_price, "index": filter_cnt})
        filter_cnt += 1
    elif type(max_price) is float and type(min_price) is float and min_price < max_price and min_price >= 0 and max_price >= 0:
        filter_list.append(
            {"name": "MinPrice", "value": min_price, "index": filter_cnt})
        filter_cnt += 1
        filter_list.append(
            {"name": "MaxPrice", "value": max_price, "index": filter_cnt})
        filter_cnt += 1

    for k in request.keys():
        if k == 'returnacceptable':
            filter_list.append(
                {"name": "ReturnsAcceptedOnly", "value": "true", "index": filter_cnt})
            filter_cnt += 1
        elif k == 'free':
            filter_list.append({"name": "FreeShippingOnly",
                                "value": "true", "index": filter_cnt})
            filter_cnt += 1
        elif k == 'expedited':
            filter_list.append(
                {"name": "ExpeditedShippingType", "value": "Expedited", "index": filter_cnt})
            filter_cnt += 1
    condition_dict = {}
    condition_cnt = 0
    for k in request.keys():
        if k == 'new':
            condition_dict.update(
                {f"itemFilter({filter_cnt}).value({condition_cnt})": "1000"})
            condition_cnt += 1
        elif k == 'used':
            condition_dict.update(
                {f"itemFilter({filter_cnt}).value({condition_cnt})": "3000"})
            condition_cnt += 1
        elif k == 'verygood':
            condition_dict.update(
                {f"itemFilter({filter_cnt}).value({condition_cnt})": "4000"})
            condition_cnt += 1
        elif k == 'good':
            condition_dict.update(
                {f"itemFilter({filter_cnt}).value({condition_cnt})": "5000"})
            condition_cnt += 1
        elif k == 'acceptable':
            condition_dict.update(
                {f"itemFilter({filter_cnt}).value({condition_cnt})": "6000"})
            condition_cnt += 1
    if condition_cnt > 0:
        condition_dict.update({f"itemFilter({filter_cnt}).name": "Condition"})

    for filter_dict in filter_list:
        param_dict.update({f"itemFilter({filter_dict.get('index')}).name": filter_dict.get(
            "name"), f"itemFilter({filter_dict.get('index')}).value": filter_dict.get("value")})
        if filter_dict.get("name") == 'MinPrice' or filter_dict.get("name") == 'MaxPrice':
            param_dict.update({f"itemFilter({filter_dict.get('index')}).paramName": "Currency",
                               f"itemFilter({filter_dict.get('index')}).paramValue": "USD"})

    param_dict.update(condition_dict)
    return param_dict


def encode(queryList):
    encode_dict_list = []
    for query in queryList:
        query_param = dict()
        defatul_query_param_dict = {}
        pattern = re.compile("^itemFilter\((\d+)\)\.(.*)$")
        for key in query.keys():
            # print(key)
            result = pattern.search(key)
            if result is not None:
                index = result.group(1)
                prop = result.group(2)
                # print(index, prop)
                if index in query_param:
                    # print("----------------------")
                    # print(query_param.get(index))
                    query_param.get(index).update({prop: query.get(key)})
                else:
                    query_param.update({index: dict({prop: query.get(key)})})
            else:
                if key == 'sortOrder':
                    defatul_query_param_dict.update(
                        {'sortby': sortByNum(query.get(key))})
                else:
                    defatul_query_param_dict.update({key: query.get(key)})
        encode_dict = dict()
        encode_dict.setdefault('minimumprice', '')
        encode_dict.setdefault('maximumprice', '')
        for key in query_param.keys():
            target = query_param.get(key)
            name = target.get('name')
            if name != 'Condition':
                if name == 'MinPrice':
                    encode_dict.update({'minimumprice': target.get('value')})
                elif name == 'MaxPrice':
                    encode_dict.update({'maximumprice': target.get('value')})
                elif name == 'ReturnsAcceptedOnly':
                    encode_dict.update({'returnacceptable': 'on'})
                elif name == 'FreeShippingOnly':
                    encode_dict.update({'free': 'on'})
                elif name == 'ExpeditedShippingType':
                    encode_dict.update({'expedited': 'on'})
            else:
                for condition_key in target.keys():
                    if condition_key != 'name':
                        value = target.get(condition_key)
                        if value == '1000':
                            encode_dict.update({'new': 'on'})
                        elif value == '3000':
                            encode_dict.update({'used': 'on'})
                        elif value == '4000':
                            encode_dict.update({'verygood': 'on'})
                        elif value == '5000':
                            encode_dict.update({'good': 'on'})
                        elif value == '6000':
                            encode_dict.update({'acceptable': 'on'})

        encode_dict.update(defatul_query_param_dict)
        encode_dict_list.append(encode_dict)
    return encode_dict_list
