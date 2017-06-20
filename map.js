var map;

var largeInfowindow;

var locations = [
    {title: 'Jolly Pumpkin', location: {lat: 42.2791363, lng: -83.7483896}, fsquare_id: '4abd676cf964a5201b8a20e3', selected: ko.observable(false)},
    {title: 'Zingerman\'s', location: {lat: 42.2846429, lng: -83.7451163}, fsquare_id: '4aaa6549f964a520d25520e3', selected: ko.observable(false)},
    {title: 'Nagomi Downtown', location: {lat: 42.2796722, lng: -83.746569}, fsquare_id: '5679b1dc498eb7ab3f698088', selected: ko.observable(false)},
    {title: 'Afternoon Delight', location: {lat: 42.279604, lng: -83.7462971}, fsquare_id: '4af2e1bcf964a520f4e821e3', selected: ko.observable(false)},
    {title: 'Umi Sushi', location: {lat: 42.3050516, lng: -83.6946148}, fsquare_id: '4b5b5c26f964a520a5f728e3', selected: ko.observable(false)},
    {title: 'Nagomi Sushi', location: {lat: 42.2978917, lng: -83.7229744}, fsquare_id: '4bae9dbef964a5201fc73be3', selected: ko.observable(false)}
];

function main(){
        //highlight while hovering
    $('.listview').on('mouseenter', '.listViewItem', function(evt){
        $(this).toggleClass('highlighted');
    });
    $('.listview').on('mouseleave', '.listViewItem', function(evt){
        $(this).toggleClass('highlighted');
    });

}

listViewModel = function(){

    this.locationFilter = ko.observable('');

    this.listView = ko.observableArray(locations);

    this.filteredList = ko.computed(function() {
            var filterWords = locationFilter().toLowerCase().split(' ');
            if (locationFilter() === '') {
                for(var i = 0; i < locations.length; i++){
                    locations[i].marker.setVisible(true);
                }
                map.zoom = 13;
                map.fitBounds(bounds);
                return listView();
            } 
            for(var i = 0; i < filterWords.length; i++){

                if(filterWords[i] === '')
                   filterWords.splice(i,i+1);
            }            
            
            return ko.utils.arrayFilter(listView(), function(location) {
                    
                        //partial match check
                        var wordArray = location.title.toLowerCase().split(' ');
                        for(x = 0; x < wordArray.length; x++){
                            for(w = 0; w < filterWords.length; w++){
                                for(c = 0; c+filterWords[w].length <= wordArray[x].length; c++){
                                    if(wordArray[x].substr(c, filterWords[w].length) === filterWords[w]){
                                        locations[location.marker.id].marker.setVisible(true);
                                        return true;
                                    }
                                }
                            }
                        }
                        locations[location.marker.id].marker.setVisible(false);
                        if(location.selected()){
                           largeInfowindow.close();
                           location.selected(false); 
                        }
                        return false;
                });
        });
};


function itemClicked(item){
    //unselect other locations
    for(var i = 0; i < locations.length; i++){
        if(item !== locations[i] && locations[i].selected()){
            locations[i].selected(false);
            //stop the bouncing
            locations[i].marker.setAnimation(null);
        }
    }

    if(item.selected()){ //unselect clicked item
        item.marker.setAnimation(null);
        item.selected(false);
        largeInfowindow.close();
    }
    else{  //select clicked
        item.marker.setAnimation(google.maps.Animation.BOUNCE);
        item.selected(true);
        populateInfoWindow(item.marker, largeInfowindow);
    }
}

function setMarkers(){
    largeInfowindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
        // Get the position from the location array.
        var position = locations[i].location;
        var title = locations[i].title;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
                map: map,
                position: position,
                title: title,
                animation: google.maps.Animation.DROP,
                id: i
        });

        locations[i].marker = marker;
        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function() {
            itemClicked(locations[this.id]);
        });
        bounds.extend(marker.position);

    }
    // Extend the boundaries of the map for each marker
    map.fitBounds(bounds);
}

function initMap() {
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 42.2870276, lng: -83.7315948},
            zoom: 13
        });

        setMarkers();

ko.applyBindings(listViewModel);
}

function mapLoadError(){
    alert('Map failed to load');
}
        // This function populates the infowindow when the marker is clicked. We'll only allow
        // one infowindow which will open at the marker that is clicked, and populate based
        // on that markers position.
function populateInfoWindow(marker, infowindow) {


    infowindow.marker = marker;
                
    venueURL = 'https://api.foursquare.com/v2/venues/' + locations[marker.id].fsquare_id + '?v=20131016&client_id=AU4WMBTXEUWNI0GO0VAGBWL3ZN3WMLBMQ0Z0YXSCWO3LW1KR&client_secret=4GMPD10DPZ4I1LF1VUSSEZNW512E3KBUIVWUSYNBMCWXYVWQ';
    $.getJSON(venueURL,
        function(data){
                infowindow.setContent('<h3>' + marker.title + '</h3>' + '<div>' + 'Rating: ' + data.response.venue.rating + '</div>');
            }
        ).fail(function(){
                infowindow.setContent('<h3>' + marker.title + '</h3>' + '<div>' + 'Failed to load data' + '</div>');
        }
    );

    infowindow.setContent('<h3>' + marker.title + '</h3>' + '<div>' + 'Retrieving Data...' + '</div>');
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick',function(){
        itemClicked(locations[marker.id]);
        infowindow.close();
    });       

}

$(document).ready(main);