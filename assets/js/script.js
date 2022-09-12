// global variables
var artistNameInput = document.querySelector("#input-artist-name");
// variables used to split name and reconfigure to format last name, first name
var ArtistFirstName = "";
var ArtistLastName = "";
var artistNameSearchCriteria = "";
// artist id as brought back from  musicbrainz
var artistFullID = "";
// global variable for the artist name entered so it can be used in other functions
var artistFullName = "";
let artistFullNameButton = "";
let artistAmazonSearch = "";
// songkick APi Keys
var songkickAPIKey = "io09K9l3ebJxmxe2";
var youtubeKey = "AIzaSyAVipUFCUajMgvasF6xv_p18pu4uLXmhcE";

var youtubeUrl = 'https://www.youtube.com/watch?v=';
var search = "";

var photoUrl = "https://cors-anywhere.herokuapp.com/https://imsea.herokuapp.com/api/1?fmt=json";

var searchVideos = "";

// var youtubeKey2 = "AIzaSyDeq0kG7KnVPtEpNdA7e3FTalceIrNWU2o";


// function to get artist name from input and split and reformat to last name, first name
var getArtistName = function(event) {
    event.preventDefault();
    //if artist name null send an alert
    if (!artistNameInput.value.trim()) {
        return;
    } else {
        artistFullName = artistNameInput.value.trim();
        manipulateName(artistFullName);
        // function to load image 
        getImage();
        // remove hidden class to show results
        $("main").removeClass("hidden");
        $("header").removeClass("h-screen");
        $("footer").removeClass("hidden");
        // scroll to main content
        $('body, html').animate({ scrollTop: $("#main-content").offset().top });
    }
}

function manipulateName() {
    artistAmazonSearch = artistFullName;
    //clear the input text
    artistNameInput.value = "";
    // splitting the artist name entered at the space
    var artistNameSplit = artistFullName.split(" ");
    ArtistFirstName = artistNameSplit[0];
    ArtistLastName = artistNameSplit[1];
    // creating the musicbrainz required search query format of artist last name, first name
    artistNameSearchCriteria = (ArtistLastName + "," + ArtistFirstName);
    artistFullNameButton = (ArtistFirstName + "%20" + ArtistLastName);
    // calling the function to get youtube content and passing it the artist's full name
    getVideos(artistFullName);
    // calling the function to call teh musicbrainz api to get artist ID and info
    getArtistInformation();
    //function to set the artist name as search entered
    $("#artist-name").text(artistFullName)
        // function to save localStorage using the value within the function
    saveArtist(artistFullName);
}

// function to get artist information - mostly to grab ID so we can send it to get discography
var getArtistInformation = function() {
    // varible for URL that includes artist name in new format last name, first name and asking for JSON format
    var apiURL = "https://musicbrainz.org/ws/2/artist/?query=artist:" + artistNameSearchCriteria + "%20AND%20&fmt=json";
    fetch(apiURL).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                // setting id for artist name so we can pass it through the  get discopgraphy releases function
                artistFullID = data.artists[0].id;
                // calling function to get artist discography releases from musicbrainz API
                getArtistReleases();
            });
        }
    });
};

// photo API
function getImage() {
    var photoUrl = "https://cors-anywhere.herokuapp.com/https://imsea.herokuapp.com/api/1?fmt=json";
    let fullPhotoUrl = photoUrl + artistAmazonSearch;
    setTimeout(function() {
        fetch(fullPhotoUrl)
            .then(function(response) {
                response.json().then(function(data) {
                    var photoIDOne = data.results[0];
                    displayImage();

                    function displayImage() {
                        let imageLink = document.querySelector("#photolink");
                        imageLink.setAttribute("src", photoIDOne);
                    }
                })
            })
    }, 50);
}

function getTicketAndAlbum() {
    $("#ticketbtn").on("click", () => {
        window.open("https://www.stubhub.ca/secure/search?q=" + artistFullName, '_blank');
    });
    $("#albumbtn").on("click", () => {
        window.open("https://www.amazon.ca/s?k=" + artistAmazonSearch + "+albums&crid=98KX0UTYLA8M&sprefix=" + ArtistFirstName + ArtistLastName + "+albums%2Caps%2C93&ref=nb_sb_noss_1" + artistFullNameButton, "_blank");
    })
}

// function to get artist concerts from songkick api using the Artist ID obtained from musicbrainz
var getArtistConcerts = function() {
    var apiURL = "https://api.songkick.com/api/3.0/artists/mbid:" + artistFullID + "/calendar.json?apikey=" + songkickAPIKey;
    // fethcing data and returning in JSON format
    fetch(apiURL).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                var concertsLocation = document.querySelector("#concert-listings");
                // setting variable for location of UL for concerts, creating li element and giving it value, appending
                var concertsListings = parseInt(data.resultsPage.totalEntries);
                // if there are concert listings, clearing previous search results and adding new ones
                concertsLocation.innerHTML = "";
                if (concertsListings > 0) {
                    for (i = 0; i < concertsListings && i < 10; i++) {
                        // displaying the results returned from API
                        concertList = data.resultsPage.results.event[i].displayName;
                        var createLiItem = document.createElement("li");
                        createLiItem.innerHTML = concertList;
                        concertsLocation.appendChild(createLiItem);
                    }
                    // error control for if there are no concert listings returned from API
                } else if (concertsListings === 0) {
                    var createLiItemNone = document.createElement("li");
                    createLiItemNone.innerHTML = "Sorry looks like there are no upcoming concert dates";
                    concertsLocation.appendChild(createLiItemNone);
                }
            });
        }
    });
}

// function to get artist releases and set them as <li> DOM elements in the discography section
var getArtistReleases = function() {
    // api url includes artistfullID variable and search for albums and return JSON format
    var apiURL = "https://musicbrainz.org/ws/2/release-group?artist=" + artistFullID + "&type=album&!secondary-types&fmt=json";
    fetch(apiURL).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                var discographylocation = document.querySelector("#artist-discography");
                // clearing any <li> elements from previous search 
                discographylocation.innerHTML = "";
                var ArtistAlbums = parseInt(data["release-groups"].length);
                // for loop which will cycle through the array until it meets 10 or the length of the array
                for (i = 0; i < ArtistAlbums && i < 10; i++) {
                    var firstAlbumList = data["release-groups"][i].title;
                    var albumReleaseDate = data["release-groups"][i]["first-release-date"];
                    // creating <li> elements here and appending them to the discography location on page
                    var createLiItem = document.createElement("li");
                    createLiItem.innerHTML = firstAlbumList + " ( " + albumReleaseDate + ")";
                    discographylocation.appendChild(createLiItem);
                }
            })
        }
    });
    // function to call out and get artist concerts
    getArtistConcerts();
}

//get 3 videos based on the user's search
var getVideos = function(searchVideos) { //searchVideos
    var videoContainer = document.querySelector("#video-container");
    videoContainer.innerHTML = "";
    //if no valid input stop the function
    if (!searchVideos) {
        return
    } else {
        var url = `https://www.googleapis.com/youtube/v3/search?part=snippet&key=${youtubeKey}&q=${searchVideos}&maxResults=3`;
        fetch(url).then(function(response) {
            if (response.ok) {
                response.json().then(function(data) {
                    var videos = data.items;
                    //get video name, youtube link and video img
                    for (video of videos) {
                        videoContainer.innerHTML += `
                        <div class="grid-cols-1 h-auto rounded-md color-bg shadow-xl">
                            <a href="https://www.youtube.com/watch?v=${video.id.videoId}" class="video-link" target="_blank">
                            <img class="w-full rounded-t-md bg-cover bg-center" src="${video.snippet.thumbnails.default.url}" />
                            <p class="p-2">${video.snippet.title}</p>
                            </a>
                        </div>`
                    };
                });
            } else {
                return;
            }
        });
    }
};

// search history - pulls from local storage using the 'search' button and if it has no value, creates a new blank array
var searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
var search_results = document.querySelector(".list-search-history");

// function to save local storage data
var saveArtist = function(ArtistNameInput) {
    var searchHistoryEl = document.createElement("li");
    //this pushes the value of ... to the searchHistory array
    searchHistory.push(ArtistNameInput);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    // append new artist to the bottom of the list
    searchHistoryEl.innerHTML = ArtistNameInput;
    searchHistoryEl.setAttribute("id", ArtistNameInput);
    searchHistoryEl.classList.add("full-list");
    search_results.appendChild(searchHistoryEl);
    searchHistoryEl.onclick = reSearch;
}

// function to load local storage data
var loadPreviousArtist = function() {
    searchHistoryEl = "";
    // function to pull / create the list items on the page if there is data
    for (i = 0; i < searchHistory.length; i++) {
        var search_results = document.querySelector(".list-search-history");
        var searchHistoryEl = document.createElement("li");
        // when clicking on the searchHistoryEl (values from previous), the function reSearch is actioned
        searchHistoryEl.onclick = reSearch;
        searchHistoryEl.setAttribute("id", searchHistory[i]);
        searchHistoryEl.classList.add("full-list");
        // populating the values in the html
        searchHistoryEl.innerHTML = searchHistory[i];
        search_results.appendChild(searchHistoryEl);
    }
}

// function to search by previous search
function reSearch(event) {
    artistFullName = event.target.id;
    //if function triggered by search history
    if (artistFullName) {
        manipulateName();
        getImage();
    }
    // scroll to main content
    $('body, html').animate({ scrollTop: $("#main-content").offset().top });
}

loadPreviousArtist();

//get ticket and album links
getTicketAndAlbum();

// event listener to get artist name input by user in the input text box
$("#artist-name-form").on('submit', getArtistName);