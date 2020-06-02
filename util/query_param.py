def sortbyText(x: int) -> str:
    return [
        'BestMatch',
        'CurrentPriceHighest',
        'PricePlusShippingHighest',
        'PricePlusShippingLowest'
    ][x]


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
