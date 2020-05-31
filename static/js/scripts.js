document.addEventListener("DOMContentLoaded", () => {
    document.querySelector('.required-field').addEventListener("focus", () => document.querySelector('.required-field').classList.remove('black-border'));
    document.querySelector('.required-field').classList.add('black-border');
    document.getElementById('myForm').addEventListener('submit', (event) => event.preventDefault());
});

const ValidEnum = Object.freeze({ "Success": 1, "UnderZero": 2, "MinLargerThanMax": 3 });
function validatePriceRange() {
    const minimum = document.getElementById('minimumPrice').value;
    const maximum = document.getElementById('maximumPrice').value;
    if (minimum < 0 || maximum < 0) {
        return ValidEnum.UnderZero;
    }

    if (minimum <= maximum) {
        return ValidEnum.Success;
    } else {
        return ValidEnum.MinLargerThanMax;
    }
}

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
    fetch('/query', {
        body: formData,
        headers: {
            "Accept": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        mode: 'cors',
        method: "POST",
        referrer: 'no-referrer'
    })
        .then(data => data.json())
        .then((data) => {
            const localImagePath = "static/img";
            const findItemsAdvancedResponse = data.findItemsAdvancedResponse[0];
            const searchResult = findItemsAdvancedResponse.searchResult[0];
            console.log(findItemsAdvancedResponse);
            const content = document.getElementById('content');
            // clear previous
            while (content.firstChild) {
                content.firstChild.remove();
            }
            // header
            const header = document.createElement('h2');
            header.textContent = `${Reflect.get(findItemsAdvancedResponse['paginationOutput'][0], 'totalEntries')} Result found for `;
            const italic = document.createElement('i');
            italic.textContent = `${data.request}`;
            header.appendChild(italic);
            content.appendChild(header);

            // items
            const itemListContainer = document.createElement('div');
            itemListContainer.classList.add('item-list-container');

            cnt = 0
            console.log(searchResult);
            for (const item of Reflect.get(searchResult, 'item')) {
                // console.log(item);
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('item-container');
                if (cnt > 10) {
                    break
                }
                const img = document.createElement('img');
                // console.log(item.galleryURL);
                if (item.galleryURL.length > 0) {
                    img.src = item.galleryURL[0];
                } else {
                    img.alt = item.title;
                }
                cnt += 1;

                const link = document.createElement('a');
                link.classList.add('item-link');
                // console.log(item.viewItemURL);
                if (item.viewItemURL.length > 0) {
                    link.href = item.viewItemURL[0];
                } else {
                    link.href = '';
                }
                if (item.title.length > 0) {
                    link.textContent = item.title[0];
                } else {
                    link.textContent = '!!!!!!!!!!!No title!!!!!!!!!!!!!!';
                }

                const category = document.createElement('div');
                category.classList.add('item-category');
                if (item.primaryCategory.length > 0) {
                    if (item.primaryCategory[0]["categoryName"].length > 0) {
                        category.textContent = item.primaryCategory[0]["categoryName"][0];
                    } else {
                        category.textContent = '';
                    }
                } else {
                    category.textContent = '';
                }

                {

                    const categoryAnchor = document.createElement('img');
                    categoryAnchor.src = `${localImagePath}/redirect.png`;
                    categoryAnchor.alt = 'top rated';
                    // categoryAnchor.textContent = 
                    category.appendChild(categoryAnchor);
                }

                const condition = document.createElement('div');
                condition.classList.add('item-condition');
                if (item.condition && item.condition.length > 0) {
                    if (item.condition[0]["conditionDisplayName"].length > 0) {
                        condition.textContent = item.condition[0]["conditionDisplayName"][0];
                    } else {
                        condition.textContent = '';
                    }
                } else {
                    condition.textContent = '';
                }
                {
                    if (item.topRatedListing.length > 0) {
                        if (item.topRatedListing[0]) {
                            const topRated = document.createElement('img');
                            topRated.src = `${localImagePath}/topRatedImage.png`;
                        }
                    }
                }

                itemDiv.appendChild(img);
                itemDiv.appendChild(link);
                itemDiv.appendChild(category);
                itemDiv.appendChild(condition);
                itemListContainer.appendChild(itemDiv);
            }
            content.appendChild(itemListContainer);
        })
}