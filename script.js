// Created namespace object
const app = {};

// API Key
app.apiKey = 'e02f7bfd6a25d26426efce6d7b66eba1';

// Base End Points
app.baseEndpoint = 'https://developers.zomato.com/api/v2.1';

app.location = {};

app.cuisines = [];

// 1st API Call
app.makeLocationApiRequest = (city) => {
    return $.ajax({
        url: `${app.baseEndpoint}/locations`,
        method: 'get',
        dataType: 'json',
        headers: {
            'user-key': app.apiKey
        },
        data: {
            query: `${city}, ON`, // 'ON' specify which province
            count: 1 //specify how many cities to return
        }
    })
}

//2nd API Call
app.makeCuisineApiRequest = () => {
    return $.ajax({
        url: `${app.baseEndpoint}/cuisines`,
        method: 'get',
        dataType: 'json',
        headers: {
            'user-key': app.apiKey
        },
        data: {
            lat: `${app.location.lat}`,
            lon: `${app.location.lon}`
        }
    })
}

//3rd API Call
app.searchRestaurants = (cuisineID) => {
    return $.ajax({
        url: `${app.baseEndpoint}/search`,
        method: 'get',
        dataType: 'json',
        headers: {
            'user-key': app.apiKey
        },
        data: {
            lat: app.location.lat,
            lon: app.location.lon,
            cuisines: cuisineID
        }
    })
}

app.displayRestaurants = (restaurant) => {

    const {
        name, timings, cuisines, phone_numbers, featured_image, events_url
    } = restaurant;

    const address = restaurant.location.address;
    const rating = restaurant.user_rating.aggregate_rating;

    //Error handling: included an if statement, so that the user does not experience an empty image with alt text
    if (featured_image !== '') {
        const tiles = `<li class="resto-tile">
        <img src="${featured_image}" alt="${name}'s image">
            <div class="resto-title-container">
                <h3>${name}</h3>
                <h4><i class="fas fa-star"></i>:${rating}</h4>
            </div>
            <ul class="resto-info">
                <li>Address: ${address}</li>
                <li>Hours: ${timings}</li>
                <li>Telephone: ${phone_numbers}</li>
                <li>Cuisines: ${cuisines}</li>
            </ul>
            <div class="read-more-container">
                <a href="${events_url}" class="read-more">READ MORE</a>
            </div>`
        $('.restaurant-list').append(tiles);
    }
}

app.getRestaurantSearchResults = (id) => {
    const finalPromise = app.searchRestaurants(id);
    finalPromise.done((result) => {
        result.restaurants.forEach((item) => {
        app.displayRestaurants(item.restaurant)
        })
    })
}

// Event Listener
$('#food').on('change', function () {
    const selectedOption = $(this).find('option:selected');
    const cuisineID = selectedOption.data('cuisine');
    app.getRestaurantSearchResults(cuisineID);
})

app.populateCuisineDropdown = () => {
    app.cuisines.forEach((cuisine) => {
        const option = `<option value="${cuisine.name}" data-cuisine="${cuisine.id}">${cuisine.name}</option>`;
        $('#food').append(option);
    })
}

app.getCuisinesDetail = (promiseRes) => {
    promiseRes.done((result) => {
        result.cuisines.forEach((item) => {
            app.cuisines.push({
                id: item.cuisine.cuisine_id,
                name: item.cuisine.cuisine_name
            });
        })
        app.populateCuisineDropdown();
    })
}

app.getLocationDetails = (promiseObj) => {
    promiseObj.done((result) => {
        // destructuring the location object
        const { city_id, entity_id, title, latitude, longitude } = result.location_suggestions[0];
        app.location = {
            cityID: city_id,
            entityID: entity_id,
            cityName: title,
            lat: latitude,
            lon: longitude
        }
        const cuisinePromiseObj = app.makeCuisineApiRequest();
        app.getCuisinesDetail(cuisinePromiseObj);
    }).fail((err) => {
        console.log(err);
    })
}

//Event Listener
$('#city').on('change', function () {
    const city = $(this).val();

    const locationRes = app.makeLocationApiRequest(city);

    app.getLocationDetails(locationRes);
    // setTimeout(function(){
    //     app.populateCuisineDropdown();
    // },5000)
})

//Initialize our app - left our console log there to confirm it is working each time
app.init = () => {
    console.log("app is initialized!")
}

// Document Ready Function
$(() => {
    app.init()
})