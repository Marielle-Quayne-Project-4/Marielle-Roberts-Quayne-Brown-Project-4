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
app.searchRestaurants = () => {
    return $.ajax({
        url: `${app.baseEndpoint}/search`,
        method: 'get',
        dataType: 'json',
        headers: {
            'user-key': app.apiKey
        },
        data: {
            lat: `${app.location.lat}`,
            lon: `${app.location.lon}`,
            cuisines: `${55}`
        }
    })
}

app.getRestaurantSearchResults = () => {
    const finalPromise = app.searchRestaurants();
    finalPromise.done((result) => {
        // console.log(result.restaurants[0]);
        console.log(result.restaurants[0]);
        console.log(result.restaurants[0].restaurant.name);
        // console.log(result.restaurants[0].cuisines.featured_image);
        // console.log(result.restaurants[0].name);
    })
}

$('#food').on('change', function() {
    const cuisineName = $(this).val();
    // const test = $(this).data("cuisine_id");
    // console.log(test);
    $('#food option:selected').data("cuisine-id");
    // console.log($(this).find("option"));
})

app.populateCuisineDropdown = () => {
    app.cuisines.forEach((cuisine) => {
        // console.log(cuisine);
        const option = `<option value="${cuisine.name}" data-cuisine-id="${cuisine.id}">${cuisine.name}</option>`;
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
        app.getRestaurantSearchResults();
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