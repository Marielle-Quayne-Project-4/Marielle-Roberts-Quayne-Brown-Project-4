// initialize app object
const app = {};

// API Key
app.apiKey = 'e02f7bfd6a25d26426efce6d7b66eba1';
// base endPoint
app.baseEndpoint = 'https://developers.zomato.com/api/v2.1';

app.location = {};

// function to call the location API
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

app.getCuisinesDetail = (promiseRes) => {
    promiseRes.done((result) => {
        console.log(result.cuisines)
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
    console.log(app.location);
}


$('#city').on('change', function(){
    const city = $(this).val();

    const locationRes = app.makeLocationApiRequest(city);

    app.getLocationDetails(locationRes);
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