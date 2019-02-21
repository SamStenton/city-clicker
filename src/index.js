import './style.css';
import MainLoop from 'mainloop.js';
import Resource from './resource.js';
import Unlock from './unlock'
import unlockConfig from './unlockConfig'
import moment from 'moment'
import pb from 'progressbar.js'
import cities from 'cities.json'

const gold = new Resource('Gold', 0);
const happiness = new Resource('Happiness', 1);
let userCircle
let map
var D2R = Math.PI/180.0; // value used for converting degrees to radians
let capturedCities = new Array()

Number.prototype.toRadians = function() {
  return this * D2R;
};

var happinessPb = new pb.SemiCircle(window.happinessProgress, {
  strokeWidth: 6,
  color: '#FFEA82',
  trailColor: '#eee',
  trailWidth: 2,
  easing: 'easeInOut',
  duration: 500,
  svgStyle: null,
  text: {
    color: 'rgb(255,55,100)',
    value: `Happiness: ${(calculateHappinessPercent() * 100).toFixed(2)}%`,
    alignToBottom: false
  },
  from: {color: '#FF738A'},
  to: {color: '#35FF57'},
  // Set default step function for all animate calls
  step: (state, bar) => {
    bar.path.setAttribute('stroke', state.color);
    if (bar.text) {
      bar.text.style.color = state.color;
      bar.text.textContent = `Happiness: ${(calculateHappinessPercent() * 100).toFixed(2)}%`;
      
    } 
  }
});
happinessPb.animate(50 / 100);

const unlocks = {
  goldMine: new Unlock('Gold Mine', unlockConfig.goldMine),
  solar: new Unlock('Solar', unlockConfig.solar),
  wind: new Unlock('Wind', unlockConfig.wind),
  transport: new  Unlock('Transport', unlockConfig.transport),
  school: new Unlock('School', unlockConfig.school),
  hospital: new Unlock('Hospital', unlockConfig.hospital)
}

const timeStarted = moment()
let goldPerSecond = 1;

// Settings
const timePerStep = 500;

/**
 * Load user data if exists, if not create. Then start.
 */
function load() {
  // window.gMapsApi.src.replace('YOUR_API_KEY', unlockConfig.other.gmapApi)
  const playedBefore = readStorage();
  if (playedBefore) {
    const id = playedBefore.id;
    // socket event to get data using id;
    //setUserData();
    initiate(); // Remove once setUserData is uncommented;
  } else {
    // Create user as first time playing
    createStorage();
    initiate();
  }
}


/**
 * Initiate the game
 */
function initiate() {
  // Get details about the users game if they have come back


  // Add listeners
  document.getElementById('city-clicker').addEventListener('click', (el) => {
    gold.add(1);
  });

  // Initial update for item costs + add event listeners 
  for (let key in unlocks) {
    const unlock = unlocks[key];
    const unlockName = unlock.id;
    document.getElementById(unlock.id).addEventListener('click', e => buyUnlock(unlockName))
    updateUnlockDiv(unlock);
  }

  // Start MainLoop
  MainLoop
    .setUpdate(update)
    .setDraw(draw)
    .setSimulationTimestep(timePerStep)
    .start();
}

/**
 * Update game logic
 */
function update() {
  gold.add((goldPerSecond * happiness.getValue()) / (1000 / timePerStep));
  if (window.google && userCircle) {
    userCircle.setRadius(gold.getValue() * happiness.getValue())
    map.fitBounds(userCircle.getBounds(), 200)
  }
}

function getTimeDuration(){
  let now = moment()
  let duration = moment.duration( now.diff(timeStarted) )
  let hh = pad(duration.hours())
  let mm = pad(duration.minutes())
  let ss = pad(duration.seconds())
  return `${hh}:${mm}:${ss}`
}

function pad(n) { return n > 10 ? n : '0' + n }

/**
 * Draw content on page
 */
function draw() {
  window['gold-value'].textContent = Math.floor(gold.getValue());
  // window['happiness-value'].textContent = happiness.getValue().toFixed(2);
  window['time-since-started'].textContent = getTimeDuration()
  dynamicHappiness()
}

function dynamicHappiness() {
    
    if (changeHappinessRandomly()) {
      let goldMineHappiness = 0
      let otherHappiness = 0
      for (let key in unlocks) {
        const unlock = unlocks[key];
        if (unlock.id === 'goldMine') goldMineHappiness += unlock.numberTimesPurchased * unlock.happinessChange
        else otherHappiness += unlock.numberTimesPurchased * unlock.happinessChange
      }
      if (goldMineHappiness > otherHappiness) {
        happiness.setValue( happiness.getValue() - (goldMineHappiness / unlockConfig.other.dynamicHappiness.divider))
      } else {
        happiness.setValue( happiness.getValue() + (otherHappiness / unlockConfig.other.dynamicHappiness.divider))
      }
      happinessPb.animate(calculateHappinessPercent())
    }
}

function changeHappinessRandomly() { 
  let min = unlockConfig.other.dynamicHappiness.minRandom
  let max = unlockConfig.other.dynamicHappiness.maxRandom
  let num = rand(min, max)
  return unlockConfig.other.dynamicHappiness.runsWhenConatins.includes(num)
}

function buyUnlock(unlock) {
  const item = unlocks[unlock];
  const unlockCost = item.goldCost;
  if (gold.getValue() >= unlockCost) {
    let bought = item.buy()
    let newHappiness = bought.happiness * happiness.getValue()
    if (newHappiness <= unlockConfig.other.maxHappiness && newHappiness >= unlockConfig.other.minHappiness) {
      happiness.multiply(bought.happiness) 
    } else {
      if (newHappiness > unlockConfig.other.maxHappiness) happiness.value = unlockConfig.other.maxHappiness
      if (newHappiness < unlockConfig.other.minHappiness) happiness.value = unlockConfig.other.minHappiness
    }
    gold.remove(unlockCost)
    goldPerSecond = goldPerSecond + bought.goldPs;
    updateUnlockDiv(item);
    const happinessPercent = calculateHappinessPercent();
    happinessPb.animate(happinessPercent);
  } else {
    alert('Dont have enough gold')
  }
}

function updateUnlockDiv(item) {
  const parent = document.getElementById(item.id);
  parent.innerHTML = '';

  // Create Title
  createUnlockDiv(parent, 'div', 'unlock_title', item.name);

  // Create Gold price
  createUnlockDiv(parent, 'div', 'unlock_cost', `Cost: ${item.goldCost} Gold`);
  createUnlockDiv(parent, 'div', 'unlock_cost', `Purchased already: ${item.numberTimesPurchased}`)

  // Create Happiness multiplyer
  const sign = (item.happinessChange < 1) ? '-' : '+';

  // To 4 decimal places to keep screen clear
  const happinessChange = Math.round((item.happinessChange) * 10000) / 10000;
  createUnlockDiv(parent, 'div', 'unlock_modifier', `Effect on Happiness: ${happinessChange} (${sign})`);
}

function createUnlockDiv(parent, tag, className, textContent) {
  const el = document.createElement(tag);
  el.className = className;
  el.textContent = textContent;
  parent.appendChild(el);
}

function calculateHappinessPercent() {
  const h = happiness.getValue();
  const maxH = unlockConfig.other.maxHappiness;
  const midH = unlockConfig.other.midHappiness;
  const minH = unlockConfig.other.minHappiness;
  let percent = 0.5;
 if (h < midH) {
    percent = (((midH - minH) / 100) * h) * 100;
  } else if (h > midH) {
    percent = (((maxH - midH) / 100) * h) * 100 / 2;
  }
  return percent;
}

// Gathers the user data to be sent via Socket
function gatherUserData() {
  const data = {
    unlocks: unlocks,
    gold: gold.getValue(),
    happiness: happiness.getValue()
  }
  return data;
}

// Sets the user data received from Socket and starts the game
function setUserData(data) {
  for (let key in data.unlocks) {
    unlocks[key] = data.unlocks[key];
  }
  gold.setValue(data.gold);
  happiness.setValue(data.happiness);
  initiate();
}

function createStorage() {
  const data = {
    id: `${Math.floor((Math.random() * 100000000000) + 1)}`
  }
  window.localStorage.setItem('cityclicker', JSON.stringify(data))
}

function readStorage() {
  const data = JSON.parse(window.localStorage.getItem('cityclicker'));
  return data;
}

function distance(lat0,lng0,lat1,lng1){

  // convert degrees to radians
  var rlat0 = lat0.toRadians();
  var rlng0 = lng0.toRadians();
  var rlat1 = lat1.toRadians();
  var rlng1 = lng1.toRadians();

  // calculate the differences for both latitude and longitude (the deltas)
  var Δlat=(rlat1-rlat0);
  var Δlng=(rlng1-rlng0);

  // calculate the great use haversine formula to calculate great-circle distance between two points
  var a = Math.pow(Math.sin(Δlat/2),2) + Math.pow(Math.sin(Δlng/2),2)*Math.cos(rlat0)*Math.cos(rlat1);
  var c = 2*Math.asin(Math.sqrt(a));
  var d = c * 6378137;  // multiply by the radius of the great-circle (average radius of the earth in meters)

  return d;
}

 function hasIntersections(circle0,circle1){
   var center0 = circle0.getCenter();
   var center1 = circle1.getCenter();

   var maxDist = circle0.getRadius() + circle1.getRadius();
   var actualDist = distance( center0.lat(), center0.lng(), center1.lat(), center1.lng() );

   return maxDist >= actualDist;
 }

function rand(min,max) {
  return Math.floor(Math.random() * (max-min + 1) + min)
}

function getRandomCity() {
  let max = 128769
  let city = cities[ rand(0, max) ]
  return { 
    ...city,
    lat: parseFloat(city.lat),
    lng: parseFloat(city.lng),
  }
}

function arePointsNear(checkPoint, centerPoint, m) { // credits to user:69083
  var km = m/1000;
  var ky = 40000 / 360;
  var kx = Math.cos(Math.PI * centerPoint.lat / 180.0) * ky;
  var dx = Math.abs(centerPoint.lng - checkPoint.lng) * kx;
  var dy = Math.abs(centerPoint.lat - checkPoint.lat) * ky;
  return Math.sqrt(dx * dx + dy * dy) <= km;
}

function getListOfCountriesUserHasGot() {

  setInterval(() => {

    let radius = userCircle.getRadius()
    let circleCenter = { lat: userCircle.getCenter().lat(), lng: userCircle.getCenter().lng() }
    console.log(radius, circleCenter)
    cities.forEach( city => {

      let cityCenter = { lat: parseFloat(city.lat), lng: parseFloat(city.lng) }
      let cityCaptured = arePointsNear(circleCenter, cityCenter, radius)
      if (cityCaptured) {
        if (!capturedCities.some( obj => obj.city === city)) capturedCities.push({city: city, captureTime: new Date()})
      }
    })

    window['city-count'].textContent = capturedCities.length
    console.log(capturedCities)

  }, 1000 * 20)
}

function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 14,
      mapTypeId: 'terrain'
    });

    let randomCity = getRandomCity()
    window.city.textContent = `${randomCity.name}, ${randomCity.country}`

    userCircle = new google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      title: 'yourname',
      map: map,
      center: {lat: randomCity.lat, lng: randomCity.lng},
      radius: gold.getValue() * happiness.getValue()
    });

    getListOfCountriesUserHasGot()


    var myOptions = {
      content: "Somebody",
      boxStyle: {
        background: '#FFFFFF',
        color: '#000000',
        textAlign: "center",
        fontSize: "8pt",
        width: "50px"
      },
      disableAutoPan: true,
      pixelOffset: new google.maps.Size(-25, -10), // left upper corner of the label
      position: new google.maps.LatLng(randomCity.lat, randomCity.lng),
      closeBoxURL: "",
      isHidden: false,
      pane: "floatPane",
      zIndex: 100,
      enableEventPropagation: true
    };
    var ib = new InfoBox(myOptions);

    ib.open(map);

    // var data = {
    //   type: "Feature",
    //   geometry: {
    //     "type": "Polygon",
    //     "coordinates": [
    //       [
    //         [-73.974228, 40.75597],
    //         [-73.983841, 40.742931],
    //         [-74.008133, 40.75307500000001],
    //         [-73.998131, 40.765915],
    //         [-73.974228, 40.75597]
    //       ]
    //     ]
    //   }
    // };

    // var mapProp = {
    //   center: new google.maps.LatLng(51.1871516,-0.754739060819892),
    //   zoom: 8,
    //   mapTypeId: google.maps.MapTypeId.ROADMAP
    // };
  
    // var map = new google.maps.Map(document.getElementById("map"), mapProp);

  
    // map.data.addGeoJson(unlockConfig.other.tiflfordBoundary);
    // area = unlockConfig.other.tiflfordBoundary
    // setInterval(() => {
    //   let newdata = area
    //   for (let i in newdata.geometry.coordinates[0]) {
    //     if (Math.random() > 0.5) {
    //       newdata.geometry.coordinates[0][i][0] = newdata.geometry.coordinates[0][i][0] - (gold.getValue() / 1000)
    //       newdata.geometry.coordinates[0][i][1] = newdata.geometry.coordinates[0][i][1] + (gold.getValue() / 1000)
    //     } else {
    //       newdata.geometry.coordinates[0][i][0] = newdata.geometry.coordinates[0][i][0] + (gold.getValue() / 1000)
    //       newdata.geometry.coordinates[0][i][1] = newdata.geometry.coordinates[0][i][1] - (gold.getValue() / 1000)
    //     }
        
    //   }
    //   map.data.addGeoJson(newdata)
    //   area = newdata
    // }, 5000)
}
// initialize()
window.addEventListener('load', e => initMap())
// Setup the main game and determine whether user has played before, then start
load();