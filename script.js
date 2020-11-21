// initialize app object
const app = {};

// API Key
app.apiKey = 'e02f7bfd6a25d26426efce6d7b66eba1';
// base endPoint
app.baseEndpoint = 'https://developers.zomato.com/api/v2.1';

app.location = {};

app.cuisines = [];

// 1st API Call / function to call the location API
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

app.getRestaurantSearchResults = (id) => {
    const finalPromise = app.searchRestaurants(id);
    finalPromise.done((result) => {
        // console.log(result.restaurants[0]);
        const {
            name, timings, cuisines, phone_numbers, featured_image, events_url
        } = result.restaurants[0].restaurant; 
        const address = result.restaurants[0].restaurant.location.address;
        const rating = result.restaurants[0].restaurant.user_rating.aggregate_rating;

        // display tiles
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
                <a href="${events_url}" class="read-more">READ MORE</a>
                    </li>`;
        
        
    })
}

$('#food').on('change', function() {
    const selectedOption = $(this).find('option:selected');
    const cuisineID = selectedOption.data('cuisine');
    app.getRestaurantSearchResults(cuisineID);
})

app.populateCuisineDropdown = () => {
    app.cuisines.forEach((cuisine) => {
        // console.log(cuisine);
        const option = `<option value="${cuisine.name}" data-cuisine="${cuisine.id}">${cuisine.name}</option>`;
        $('#food').append(option);
    })
    // console.log(app.cuisines.id);
}

app.getCuisinesDetail = (promiseRes) => {
    promiseRes.done((result) => {
        result.cuisines.forEach((item) => {
            app.cuisines.push({
                id: item.cuisine.cuisine_id,
                name: item.cuisine.cuisine_name
            });
            // // const {cuisine_id, cuisine_name} = item.cuisine
            // // console.log(cuisine_id, cuisine_name)
            // console.log(result);
        })
        app.populateCuisineDropdown();
        // app.getRestaurantSearchResults();
    })
}

app.getLocationDetails = (promiseObj) => {
    promiseObj.done((result) => {
        // destructuring the location object
        const {city_id, entity_id, title, latitude, longitude} = result.location_suggestions[0];
        app.location =  {
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
    // console.log(app.location);
}


$('#city').on('change', function(){
    const city = $(this).val();

    const locationRes = app.makeLocationApiRequest(city);

    app.getLocationDetails(locationRes);
    // setTimeout(function(){
    //     app.populateCuisineDropdown();
    // },5000)
})

// initialize our app
app.init = () => {
    console.log("app is initialized!")
}

// document ready
$(() => {
    // call init function
    app.init()
})