document.addEventListener("DOMContentLoaded", () => {
    document.querySelector('.required-field').addEventListener("focus", () => document.querySelector('.required-field').classList.remove('black-border'));
    document.querySelector('.required-field').classList.add('black-border');
    document.getElementById('myForm').addEventListener('submit', (event) => event.preventDefault());
});

const ValidEnum = Object.freeze({ "Success": 1, "UnderZero": 2, "MinLargerThanMax": 3 });
function validatePriceRange() {
    const minimum = parseFloat(document.getElementById('minimumPrice').value);
    const maximum = parseFloat(document.getElementById('maximumPrice').value);
    // console.log(typeof (minimum), typeof (maximum));

    if (isNaN(minimum) || isNaN(maximum)) {
        return ValidEnum.Success;
    }

    if (minimum < 0 || maximum < 0) {
        return ValidEnum.UnderZero;
    }

    if (minimum <= maximum) {
        return ValidEnum.Success;
    } else {
        return ValidEnum.MinLargerThanMax;
    }
}
var showMoreStatus = false;

function handleClick() {
    const formData = new FormData(document.getElementById('myForm'));
    if (!document.querySelector('input.required-field').checkValidity()) {
        return false;
    }
    switch (validatePriceRange()) {
        case ValidEnum.MinLargerThanMax:
            alert('Oops! Lower price limit cannot be greater than upper price limit! Please try again.')
            return false;
        case ValidEnum.UnderZero:
            alert('Price Range values cannot be negative! Please try a value greater than or equal to 0.0')
            return false;
    }
    showMoreStatus = false;
    const url = new URL('http://localhost:5000/query');
    url.search = new URLSearchParams(formData).toString();
    // console.log(url.toString());
    fetch(url.toString(), {
        // body: formData,
        // headers: new Headers({
        //     'Access-Control-Allow-Origin': '*'
        // }),
        // mode: 'cors',
        method: "GET",
        referrer: 'no-referrer'
    })
        .then(data => data.json())
        .then((data) => {
            const localImagePath = "static/img";
            const findItemsAdvancedResponse = data.findItemsAdvancedResponse[0];
            if (!findItemsAdvancedResponse?.ack?.length === 0 || findItemsAdvancedResponse?.ack[0] === 'Failure') {
                return console.error('Failure Fetch');
            }
            const searchResult = findItemsAdvancedResponse.searchResult[0];
            // console.log(findItemsAdvancedResponse);
            const content = document.getElementById('content');
            // clear previous
            while (content.firstChild) {
                content.firstChild.remove();
            }
            // header
            const header = document.createElement('h2');
            const totalResult = parseFloat(Reflect.get(findItemsAdvancedResponse['paginationOutput'][0], 'totalEntries'));
            // console.log(totalResult, typeof (totalResult));
            if (totalResult === 0) {
                header.classList.add('no-found-header');
                header.textContent = `No Result found`;
                content.appendChild(header);
                content.appendChild(itemListContainer);
                return;
            } else {
                header.classList.add('query-header');
                header.textContent = `${totalResult} Result found for `;
            }
            const italic = document.createElement('i');
            italic.textContent = `${data.request}`;
            header.appendChild(italic);
            content.appendChild(header);

            // items
            const itemListContainer = document.createElement('div');
            itemListContainer.classList.add('item-list-container');

            const buttonDiv = document.createElement('div');
            buttonDiv.classList.add('item-button-div');
            const showButton = document.createElement('button');
            showButton.classList.add('item-show-button');
            showButton.addEventListener('click', function () {
                const listItemContainer = document.querySelector('.item-list-container');
                if (!showMoreStatus) {
                    listItemContainer.classList.add('show-more');
                    this.textContent = 'Show Less';
                } else {
                    listItemContainer.classList.remove('show-more');
                    this.textContent = 'Show More';
                }
                showMoreStatus = !showMoreStatus;
            })
            showButton.textContent = 'Show More';
            buttonDiv.appendChild(showButton)

            cnt = 0
            // console.log(searchResult);
            for (const item of Reflect.get(searchResult, 'item')) {
                // console.log(item);
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('item-container');
                if (cnt > 2) {
                    itemDiv.classList.add('item-more');
                }
                if (cnt > 9) {
                    break
                }
                const imgContainer = document.createElement('div');
                imgContainer.classList.add('item-img-container');
                const img = document.createElement('img');
                // console.log(item.galleryURL);
                if (item?.galleryURL?.length > 0) {
                    img.src = item.galleryURL[0];
                } else {
                    img.alt = item.title;
                }
                imgContainer.appendChild(img);


                const textContainer = document.createElement('div');
                textContainer.classList.add('item-text-container');

                const title = document.createElement('a');
                title.rel = "nofollow";
                title.target = "_blank"
                title.classList.add('item-title');
                // console.log(item.viewItemURL);
                if (item?.viewItemURL?.length > 0) {
                    title.href = item.viewItemURL[0];
                } else {
                    title.href = '';
                }
                if (item?.title?.length > 0) {
                    title.textContent = item.title[0];
                } else {
                    title.textContent = '!!!!!!!!!!!No title!!!!!!!!!!!!!!';
                }

                const category = document.createElement('div');
                category.classList.add('item-category');
                if (item?.primaryCategory?.length > 0) {
                    if (item.primaryCategory[0]["categoryName"].length > 0) {
                        const categorySpan = document.createElement('span');
                        categorySpan.classList.add('item-category-span');
                        categorySpan.textContent = `Category: ${item.primaryCategory[0]["categoryName"][0]}`;
                        category.appendChild(categorySpan);
                        {
                            const categoryAnchor = document.createElement('img');
                            categoryAnchor.classList.add('item-category-img');
                            categoryAnchor.src = `${localImagePath}/redirect.png`;
                            categoryAnchor.alt = 'top-rated';
                            category.appendChild(categoryAnchor);
                        }
                    } else {
                        category.classList.add('display-none');
                    }
                } else {
                    category.classList.add('display-none');
                }


                const condition = document.createElement('div');
                condition.classList.add('item-condition');
                if (item?.condition?.length > 0) {
                    if (item.condition[0]["conditionDisplayName"].length > 0) {
                        const conditionSpan = document.createElement('span');
                        conditionSpan.classList.add('item-condition-span');
                        conditionSpan.textContent = `Condition: ${item.condition[0]["conditionDisplayName"][0]}`;
                        condition.appendChild(conditionSpan);
                        {
                            if (item.topRatedListing[0] === 'true') {
                                const topRated = document.createElement('img');
                                topRated.classList.add('item-top-rated-img');
                                topRated.src = `${localImagePath}/topRatedImage.png`;
                                condition.appendChild(topRated);
                            }
                        }
                    } else {
                        condition.classList.add('display-none');
                    }
                } else {
                    condition.classList.add('display-none');
                }

                const seller = document.createElement('div');
                seller.classList.add('item-seller');
                if (item?.returnsAccepted?.length > 0) {
                    const sellerText = item.returnsAccepted[0] === 'true' ? 'does not' : 'accepts';
                    seller.textContent = `Seller ${sellerText} returns`;
                } else {
                    seller.classList.add('display-none');
                }

                const shipping = document.createElement('div');
                const shippingCost = item?.shippingInfo?.length > 0 && item?.shippingInfo[0]?.shippingServiceCost?.length > 0 ? parseFloat(item.shippingInfo[0].shippingServiceCost[0]["__value__"]) : -1;
                // console.log(shippingCost);
                shipping.classList.add('item-shipping');
                if (item?.returnsAccepted?.length > 0) {
                    const freeText = shippingCost === 0 ? 'Free Shipping' : 'No Free Shipping';
                    shipping.textContent = `${freeText} ${item.shippingInfo[0]['expeditedShipping'][0] === 'true' ? '-- Expedited Shipping available' : ''}`;
                } else {
                    shipping.classList.add('display-none');
                }

                const price = document.createElement('div');
                const priceContent = document.createElement('span');
                priceContent.classList.add('item-price-content');
                price.classList.add('item-price');
                if (item?.sellingStatus?.length > 0) {
                    if (item.sellingStatus[0]["convertedCurrentPrice"].length > 0) {
                        let priceText = `Price: $${item.sellingStatus[0]["convertedCurrentPrice"][0]["__value__"]}`;
                        if (shippingCost > 0) {
                            priceText = `${priceText} (+ $${shippingCost} for shipping)`
                        }
                        priceContent.textContent = priceText;
                    } else {
                        price.classList.add('display-none');
                    }
                } else {
                    price.classList.add('display-none');
                }
                price.appendChild(priceContent);

                const shipFrom = document.createElement('span');
                shipFrom.classList.add('item-ship-from');
                if (item?.location?.length > 0) {
                    shipFrom.textContent = `from ${item.location[0]}`;
                } else {
                    shipFrom.classList.add('display-none');
                }
                price.appendChild(shipFrom);

                itemDiv.appendChild(imgContainer);
                textContainer.appendChild(title);
                textContainer.appendChild(category);
                textContainer.appendChild(condition);
                textContainer.appendChild(seller);
                textContainer.appendChild(shipping);
                textContainer.appendChild(price);
                itemDiv.appendChild(textContainer);

                const cancelButton = document.createElement('div');
                cancelButton.classList.add('cancel-button');
                cancelButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    textContainer.classList.remove('clicked');
                })
                textContainer.appendChild(cancelButton);
                cnt += 1;
                itemListContainer.appendChild(itemDiv);
                itemListContainer.appendChild(buttonDiv);
            }
            content.appendChild(itemListContainer);
        }).then(() => {
            const textContainers = document.querySelectorAll('.item-text-container');
            // const sellers = document.querySelectorAll('.item-text-container div.item-seller');
            // const shippings = document.querySelectorAll('.item-text-container div.item-shipping');
            textContainers.forEach((textContainer, index) => {
                textContainer.addEventListener('click', () => {
                    if (!textContainer.classList.contains('clicked')) {
                        textContainer.classList.add('clicked');
                    }
                })
            })
        })
}