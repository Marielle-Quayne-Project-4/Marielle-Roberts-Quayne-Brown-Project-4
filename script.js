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
            city_id: app.location.cityId,
            lat: app.location.lat,
            lon: app.location.lon
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
            entity_id: app.location.EntityId,
            lat: app.location.lat,
            lon: app.location.lon,
            cuisines: cuisineID,
            radius: 2000, // 2000 meters
            count: 50,
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
            $('.restaurant-heading-container').html(`<h2>Here is a list of <span class="capitalize">${app.selectedCuisineName}</span> restaurants in and around <span class="capitalize">${app.selectedLocation}</span></h2>`)
            result.restaurants.forEach((item) => {
            app.displayRestaurants(item.restaurant)
            })
        }else{
            $('.restaurant-list').append(`<p class="err">We did not find any ${app.selectedCuisineName} restaurants in ${app.selectedLocation}. Please select another option</p>`)
        }
    })
}

app.populateCuisineDropdown = () => {
    $('#food').empty();
    $('#food').html('<option value="cuisine-choice" selected="selected">PICK YOUR CUISINE!</option>')
    app.cuisines.forEach((cuisine) => {
        const option = `<option value="${cuisine.name}" data-cuisine="${cuisine.id}">${cuisine.name}</option>`;
        $('#food').append(option);
    })
}

app.getCuisinesDetail = (promiseRes) => {
    promiseRes.done((result) => {
        app.cuisines = [];
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
            EntityId :entity_id,
            cityId: city_id,
            cityName: title,
            lat: latitude,
            lon: longitude
        }
        console.log(app.location.EntityId, app.location.cityName, app.location.lat, app.location.lon)
        // store the response from the cuisine API call
        const cuisinePromiseObj = app.makeCuisineApiRequest();
        // do some stuff when the promise is fulfill
        app.getCuisinesDetail(cuisinePromiseObj);
    }).fail((err) => {
        console.log(err);
    })
}

// hide cuisine drop down menu when no city is selected
app.hideCuisineSection = ($cuisineSection) => {
    $cuisineSection.slideUp('fast', function () {
        $cuisineSection.addClass('hide')
            .slideDown(0);
        app.isVisible = false
    });
}

// show cuisine drop down menu when a city is selected
app.showCuisineSection = ($cuisineSection) => {
    $cuisineSection.slideUp(0, function () {
        $cuisineSection.removeClass('hide')
            .slideDown('fast');
        app.isVisible = true
    });
}

//Event Listener 'on change'
app.eventListeners = function(){
    const $cuisineDropdown = $('#food');
    const $locationSection = $('#location');
    const $cuisineSection = $('#cuisine');
    const $getStarted = $('header a');
    const $restaurants = $('#restaurants');

    $getStarted.on('click', () => {
        $locationSection.removeClass('hide-section');
        $cuisineSection.addClass('hide-section');
        $('.restaurant-heading-container').empty();
        $('.restaurant-list').empty();
        $('html, body').animate({
            scrollTop: $locationSection.offset().top
        }, 1000);
    })

    // Event Listener for when the location/cities dropdown menu changes
    $('#city').on('change', function () {
        
        $locationSection.addClass('hide-section');
        $cuisineSection.removeClass('hide-section');

        $('html, body').animate({
            scrollTop: $cuisineSection.offset().top
        }, 1500);

        const isCitySelected = $('#city option:selected').val() !== 'city-choice'

            if(app.isVisible  == false){
                !isCitySelected ?  app.hideCuisineSection($cuisineSection) :                 
                    app.showCuisineSection($cuisineSection);         
            }else if (app.isVisible && !isCitySelected){
                app.hideCuisineSection($cuisineSection);
            }

        app.selectedLocation = $(this).val();
    
        // pass the name of a city the cities latitude and longitude
        const locationRes = app.makeLocationApiRequest(app.selectedLocation);
    
        app.getLocationDetails(locationRes);
    })

    // Event Listener for when the cuisine dropdown menu changes
    $cuisineDropdown.on('change', function () {
        $('.restaurant-list').empty();
        const $selectedOption = $(this).find('option:selected');
        const cuisineID = $selectedOption.data('cuisine');
        app.selectedCuisineName = $selectedOption.val();
        app.getRestaurantSearchResults(cuisineID);

        $('html, body').animate({
            scrollTop: $restaurants.offset().top
        }, 2000);
    })
}


//Initialize our app - left our console log there to confirm it is working each time
app.init = () => {
    app.eventListeners();
}

// Document Ready Function
$(() => {
    app.init()
})