
var videoContainer = document.querySelector(".video-container");
var apiLink = "https://www.googleapis.com/youtube/v3/search?";
var youtubeKey = "AIzaSyAVipUFCUajMgvasF6xv_p18pu4uLXmhcE";
var youtubeUrl = 'https://www.youtube.com/watch?v=';
var search = "";
//console.log(apiLink)

//get 3 videos based on the user's serch
var getVideos = function(search){
    videoContainer.innerHTML = ""; 
    //if no entree on the user's input stop the function
    if(!search){
        return
    }else{
        var url= `https://www.googleapis.com/youtube/v3/search?part=snippet&key=${youtubeKey}&q=${search}&maxResults=3`;
        fetch(url).then(function(response){
            console.log(url)
            console.log(response)
            if(response.ok){
                response.json().then(function(data){
                    var videos = data.items;
                    //get video name, youtube link and video img. not adding video into the APP yet
                    for(video of videos){
                        videoContainer.innerHTML += `
                        <div class="video-item">
                            <a href="${youtubeUrl + video.id.videoId}" class="video-link" target="_blank"> 
                            ${video.snippet.title}</a>
                            <img class="video-img" src="${video.snippet.thumbnails.default.url}" />
                        </div>`
                    };
                });
                
            }
            else{
                console.log("error")
            }
        });
    }
};


// songkick APi Key
var songkickAPIKey = "io09K9l3ebJxmxe2";
// var BandsInTownAPIKey = "c07ff9edf944dbba92c7932ec1a7ee96";

// variables for document locatiions
var artistNameInput = document.querySelector("#input-artist-name");
var artistNameLocation = document.querySelector("#artist-name");
var artistDiscographyLocation = document.querySelector("#artist-discography");

// variables used to split name and reconfigure to format last name, first name
var artistNameSplit = [];
var ArtistFirstName = "";
var ArtistLastName = "";
var artistNameSearchCriteria = "";
var artistFullName = "";

// artist id as brought back from  musicbrainz
var artistFullID = "";
var ArtistName = "Jones,Grace";
var ArtistID = "";

// artist discography variables

var ArtistDiscogFirstAlbum = "";


// function to set data elements in HTML - so far Atist Name
var setDataToHTML = function() {
    document.getElementById("artist-name").innerHTML = artistFullName;


}

// function to get artist concerts from songkick api 
var getArtistConcerts = function (){
    var apiURL = "https://api.songkick.com/api/3.0/artists/mbid:"+ artistFullID + "/calendar.json?apikey=" + songkickAPIKey;

    // fethcing data and returning in JSON format
    fetch(apiURL).then(function(response) {
        if (response.ok) {
            console.log(response);
            response.json().then(function(data){
                console.log(data);
                // console.log("The first event is " + data.resultsPage.results.event[0].displayName)


                // variable for concerts UL location
                var Concertslocation = document.querySelector("#concert-listings");

               

                // setting variable for location of UL for concerts, creating li element and giving it value, appending
                
                var Concertlistings = parseInt(data.resultsPage.totalEntries);
                console.log("There are concert listings here " + Concertlistings);

                // var concertResultsLength = data.resultsPage.results.event.length;
                // console.log("There are this many concerts" + concertResultsLength);

                if (Concertlistings > 0){
                     // clearing previous search li elements
                Concertslocation.innerHTML = "";
                for (i=0; i < Concertlistings && i <11 ; i++) {
                ConcertList = data.resultsPage.results.event[i].displayName;
                var createLiItem = document.createElement("li");
                createLiItem.innerHTML = ConcertList;
                Concertslocation.appendChild(createLiItem);
                } 
                }    else if (Concertlistings === 0) {
                    console.log("there are no concert listings");
                     // clearing previous search li elements
                    Concertslocation.innerHTML = "";
                    var createLiItemNone = document.createElement("li");
                    createLiItemNone.innerHTML = "Sorry looks like there are no upcoming concert dates";
                    Concertslocation.appendChild(createLiItemNone);
                }
            })
            }
})
    }

    // calling function to set data to HMTL elements
    setDataToHTML();

// function to get artist releases and set them as list items
var getArtistReleases = function () {
    // api url includes artistfullID variable and search by album
    var apiURL = "https://musicbrainz.org/ws/2/release-group?artist=" + artistFullID + "&type=album&!secondary-types&fmt=json";
    
    // fetching data and returning response in JSON format
    fetch(apiURL).then(function(response) {
        if (response.ok) {
            console.log(response);
            response.json().then(function(data){
                console.log(data);

                // setting the albums in discography here 
                var firstAlbum = data["release-groups"][0].title;
                console.log("This is the first release " + firstAlbum);
                ArtistDiscogFirstAlbum = firstAlbum;
                console.log("the first album in discog is " + ArtistDiscogFirstAlbum);

               // variable for discography UL location 
               var discographylocation = document.querySelector("#artist-discography");
               
                // clear first set of search li elements
                discographylocation.innerHTML = "";

                var ArtistAlbums = parseInt(data["release-groups"].length);
                console.log ("The number of releases is " + ArtistAlbums );
                // setting variable for location of UL for discography, creating li element and giving it value, appending
                
                for (i=0; i< ArtistAlbums && i<11;  i++) {
                var firstAlbumList = data["release-groups"][i].title;
                var albumReleaseDate = data["release-groups"][i]["first-release-date"];
                var createLiItem = document.createElement("li");
                createLiItem.innerHTML = firstAlbumList + "(" + albumReleaseDate + ")";
                discographylocation.appendChild(createLiItem);
                }
            })
        }
    })
   
    // function to call out and get artist concerts
    getArtistConcerts();
}


// function to get artist information - mostly to grab ID so we can send it to get discography
var getArtistInformation = function () {
    // varible for URL that includes artist name in new format last name, first name
 var apiURL = "https://musicbrainz.org/ws/2/artist/?query=artist:" + artistNameSearchCriteria +"%20AND%20&fmt=json";
    
   

 // fetching data and JSON the data
 fetch(apiURL).then(function(response) {
     if (response.ok) {
    console.log(response);
    response.json().then(function(data){
        console.log(data);

        // setting id for artist name so we can pass it through the  get releases function
        var artistID = data.artists[0].id;
        console.log(artistID);
        artistFullID = artistID;

        getArtistReleases();

 });
}
 });
}

// function to get artist name from input and split and remormat to lasnt name, first name
var getArtistName = function() {
    var ArtistNameEntered = artistNameInput.value.trim();
    artistFullName = ArtistNameEntered;
    console.log(artistFullName);
    artistNameSplit = artistFullName.split(" ");
    console.log(artistNameSplit[0] + artistNameSplit[1]);
    ArtistFirstName = artistNameSplit[0];
    console.log("Artist first name is " + ArtistFirstName);
    ArtistLastName = artistNameSplit[1];
    console.log("Artist Last name is " + ArtistLastName);
    artistNameSearchCriteria = (ArtistLastName + "," + ArtistFirstName);
    console.log("artist search criteria is " + artistNameSearchCriteria);

   getVideos(artistFullName);



    getArtistInformation();





}

// getArtistConcerts();


artistNameInput.addEventListener("change", getArtistName);