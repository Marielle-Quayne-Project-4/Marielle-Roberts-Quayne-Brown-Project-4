// Created namespace object
const app = {};

app.isVisible = false;

// API Key
app.apiKey = 'e02f7bfd6a25d26426efce6d7b66eba1';

// Base End Points
app.baseEndpoint = 'https://developers.zomato.com/api/v2.1';

app.location = {};

app.cuisines = [];

app.selectedCuisineName;
app.selectedLocation;

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

//'search restaurants' API Call
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
            cuisines: cuisineID,
            sort: 'rating'
        }
    })
}

app.displayRestaurants = (restaurant) => {

    let {
        name, timings, cuisines, phone_numbers, featured_image, events_url
    } = restaurant;

    const address = restaurant.location.address;
    const rating = restaurant.user_rating.aggregate_rating;

    // if featured_image has empty then replace with our local image replacer
    if(featured_image == '') {
        featured_image = '../assets/brooke-lark-IDTEXXXfS44-unsplash.jpg'
    }

    //Error handling: included an if statement, so that the user does not experience an empty image with alt text
    const tiles = `
    <li class="resto-tile">
        <div>
            <figure>
                <img src="${featured_image}" alt="${name}'s image">
            </figure>
            <div class="resto-title-container">
                <h3>${name}</h3>
                <h4>Rating:${rating}</h4>
            </div>
            <ul class="resto-info">
                <li>- Address: ${address}</li>
                <li>- Hours: ${timings}</li>
                <li>- Telephone: ${phone_numbers}</li>
                <li>- Cuisines: ${cuisines}</li>
            </ul>
        </div>
        <div class="read-more-container">
            <a href="${events_url}" class="read-more">READ MORE</a>
        </div>`
    $('.restaurant-list').append(tiles);
}

app.getRestaurantSearchResults = (id) => {
    const finalPromise = app.searchRestaurants(id);
    finalPromise.done((result) => {
        if(result.restaurants.length > 0){
            result.restaurants.forEach((item) => {
            app.displayRestaurants(item.restaurant)
            })
        }else{
            $('.restaurant-list').append(`<p class="err">We did not find any ${app.selectedCuisineName} restaurants in ${app.selectedLocation}. Please select another option</p>`)
        }
    })
}

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
        const { entity_id, title, latitude, longitude } = result.location_suggestions[0];
        app.location = {
            EntityId :entity_id,
            cityName: title,
            lat: latitude,
            lon: longitude
        }
    }).fail((err) => {
        console.log(err);
    })
}

//Event Listener 'on change'
app.eventListeners = function(){
    const $cuisineDropdown = $('#food');
    const $cuisineSection = $('#cuisine')

    // enable dropdown for the user to select a cuisine only if a location is selected

    // 
    $('#city').on('change', function () {
        const isCitySelected = $('#city option:selected').val() !== 'city-choice'

            if(app.isVisible  == false){
                if (!isCitySelected) {

                    $cuisineSection.slideUp('fast',function() {
                        $cuisineSection.addClass('hide')
                           .slideDown(0);
                           app.isVisible = false
                    });
                  } else {
                    $cuisineSection.slideUp(0,function() {
                        $cuisineSection.removeClass('hide')
                           .slideDown('fast');
                        app.isVisible = true
                    });
                  }                  
            }else if (app.isVisible && !isCitySelected){
                $cuisineSection.slideUp('fast',function() {
                    $cuisineSection.addClass('hide')
                       .slideDown(0);
                       app.isVisible = false
                });
            }

        app.selectedLocation = $(this).val();
    
        // pass the name of a city the cities latitude and longitude
        const locationRes = app.makeLocationApiRequest(app.selectedLocation);
    
        app.getLocationDetails(locationRes);
    })

    // Event Listener
    $cuisineDropdown.on('change', function () {
        $('.restaurant-list').empty();
        const $selectedOption = $(this).find('option:selected');
        const cuisineID = $selectedOption.data('cuisine');
        app.selectedCuisineName = $selectedOption.val();
        app.getRestaurantSearchResults(cuisineID);
    })
}


//Initialize our app - left our console log there to confirm it is working each time
app.init = () => {
    app.eventListeners();

    // store the response from the cuisine API call
    const cuisinePromiseObj = app.makeCuisineApiRequest();

    // do some stuff when the promise is fulfill
    app.getCuisinesDetail(cuisinePromiseObj);
}

// Document Ready Function
$(() => {
    app.init()
})