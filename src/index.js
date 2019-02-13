import './style.css';
import MainLoop from 'mainloop.js';
import Resource from './resource.js';
import Unlock from './unlock'
import unlockConfig from './unlockConfig'
import moment from 'moment'
import pb from 'progressbar.js'

const gold = new Resource('Gold', 0);
const happiness = new Resource('Happiness', 1);

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


// Setup the main game and determine whether user has played before, then start
load();