import React, { Component } from "react";
import MySearch from "./MySearch";
import {mapCustomStyle} from './mapCustomStyle.js';

class App extends Component {
  constructor(props) {
    super();
    //to save object example when it using
    //https://github.com/manishbisht/Neighborhood-Map-React/blob/master/src/components/App.js
    this.initMap = this.initMap.bind(this);
    this.openInfoWindow = this.openInfoWindow.bind(this);
    this.closeInfoWindow = this.closeInfoWindow.bind(this);
    this.state = {
    myspots:
        [
          {"name": "Teide", "latitude": 28.26916559, "longitude": -16.636830786},
          {"name": "Punta de Teno", "latitude": 28.34270, "longitude": -16.92050},
          {"name": "Loritaly", "latitude": 28.408382, "longitude": -16.564236},
          {"name": "Playa de la Tejita", "latitude": 28.03176, "longitude": -16.55657},
          {"name": "Playa de Las Teresitas", "latitude": 28.50971, "longitude": -16.18474}
        ]
    };

  }
  componentDidMount() {
    window.initMap = this.initMap;
    // https://www.klaasnotfound.com/2016/11/06/making-google-maps-work-with-react/
    function loadJS(src) {
        var ref = window.document.getElementsByTagName("script")[0];
        var script = window.document.createElement("script");
        script.src = src;
        script.async = true;
        ref.parentNode.insertBefore(script, ref);
    }
    loadJS(
      "https://maps.googleapis.com/maps/api/js?libraries=places,drawing,geometry&key=AIzaSyAxvlUJa8lIo1GIldft5bAwrxFXLJZq70M&callback=initMap"
    );
  }

  initMap() {
  //set map parameters
  //stackoverflow.com/questions/17720202/set-div-height-to-window-innerheight-in-javascript/17720681
    document.getElementById('mymap').style.height = window.innerHeight + "px";
    var bounds = new window.google.maps.LatLngBounds();
    var mapinit = this;
    var InfoWindow = new window.google.maps.InfoWindow({});
    var map = new window.google.maps.Map(document.getElementById('mymap'), {
    center: { lat: 28.291565, lng: -16.629129 },
    zoom: 10,
    styles:mapCustomStyle
    });
    window.google.maps.event.addListener(InfoWindow, "closeclick", function() {
    mapinit.closeInfoWindow();
    });

    this.setState({
      map: map,
      bounds: null,
      infowindow: InfoWindow
    });

    window.google.maps.event.addListener(map, "click", function() {
      mapinit.closeInfoWindow();
    });
//Create a marker per location
//https://github.com/udacity/ud864/blob/master/Project_Code_6_StaticMapsAndStreetViewImagery.html
    var myspots = [];
    this.state.myspots.forEach(function(location) {
      var attribute = location.name;
      const loc = new window.google.maps.LatLng(location.latitude, location.longitude)
      const marker = new window.google.maps.Marker({
        position: loc,
        animation: window.google.maps.Animation.DROP,
        draggable: false,
        map: map
      });

      marker.addListener("click", function() {
      mapinit.openInfoWindow(marker);
      });
      bounds.extend(marker.position);
      location.attribute = attribute;
      location.marker = marker;
      location.display = true;
      myspots.push(location)

    });
    map.fitBounds(bounds);
    this.setState({
      myspots: myspots
    });
  }
// open/close infowindow: https://github.com/blurdylan/neighborhood-map-react/blob/master/src/components/App.js
  openInfoWindow(marker) {
    this.closeInfoWindow();
    this.state.infowindow.open(this.state.map, marker);
    this.setState({
      markers: marker
    });
    marker.setAnimation(window.google.maps.Animation.BOUNCE);
    this.state.infowindow.setContent("Please, wait a second");
    this.state.map.setCenter(marker.getPosition());
    this.markerAtt(marker);
  }

   markerAtt(marker) {
    var mapinit = this;
 // Foursquare API key
    var clientId = "DBWXRADK3ZCXI4LLB0I1QUPYQPTCD5RU3LI2IW1C0QZLZ1VE";
    var clientSecret = "FZAFRM34A4LDN0X4OPEGRHTZQKHGSQFEHDJJEDX4VVWYVCHI";

// make call to the link
//https://examples.javacodegeeks.com/android/android-foursquare-api-example/
    var link = "https://api.foursquare.com/v2/venues/search?client_id=" + clientId + "&client_secret=" + clientSecret + "&v=20130815&ll=" + marker.getPosition().lat() + "," + marker.getPosition().lng() + "&limit=1";

//check the status of response
//https://javascript.info/async-await
fetch(link)
 .then(function(response) {
   if (response.status !== 200) {
     mapinit.state.infowindow.setContent("There is something with conection");
     return;
         }
         // Return body text as json
         //https://developer.mozilla.org/en-US/docs/Web/API/Body/json
         response.json().then(function(data) {
           var results = data.response.venues[0];
           var place = `<h2>${results.name}</h2>`;
           var street = `<h3>${results.location.formattedAddress[0]}</h3>`;
           var readMore =
             '<a href="https://foursquare.com/v/' +
             results.id +
             '" target="_blank">More information you will find on <b>Foursquare</b></a>';
           mapinit.state.infowindow.setContent(place + street + readMore);
         });
       })
       .catch(function(err) {
         mapinit.state.infowindow.setContent("Error");
       });
   }

  closeInfoWindow() {
    if (this.state.markers) {
      this.state.markers.setAnimation(null);
    }
    this.setState({
      markers: ""
    });
    this.state.infowindow.close();
  }

  render() {
    return (
      <div>
        <MySearch key="mymap" myspots={this.state.myspots} openInfoWindow={this.openInfoWindow} closeInfoWindow={this.closeInfoWindow}/>
        <div id="mymap" />
      </div>
    );
  }
}

export default App;
