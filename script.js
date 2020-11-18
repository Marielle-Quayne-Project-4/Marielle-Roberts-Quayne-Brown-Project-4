// initialize app object
const app = {};

// API Key
app.apiKey = 'e02f7bfd6a25d26426efce6d7b66eba1';
// base endPoint
app.baseEndpoint = 'https://developers.zomato.com/api/v2.1';

// function to call the location API
app.getLocationInfo = (city) => {
    return $.ajax({
        url: `${app.baseEndpoint}/locations`,
        method: 'get',
        dataType: 'json',
        headers: {
            'user-key': app.apiKey
        },
        data: {
            query: city
        }
    })
}

// initialize our app
app.init = () => {
    console.log("app is initialized!")
}

// document ready
$(() => {
    // call init function
    app.init()
})