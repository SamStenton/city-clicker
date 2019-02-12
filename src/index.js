import './style.css';
import MainLoop from 'mainloop.js';
import Resource from './resource.js';
import Unlock from './unlock'
import unlockConfig from './unlockConfig'

const gold = new Resource('Gold', 0);
const happiness = new Resource('Happiness', 1);

const unlocks ={
  goldMine: new Unlock('Gold Mine', unlockConfig.goldMine),
  solar: new Unlock('Solar', unlockConfig.solar),
  wind: new Unlock('Wind', unlockConfig.wind),
  transport: new  Unlock('Transport', unlockConfig.transport),
  school: new Unlock('Schools', unlockConfig.school),
  hospital: new Unlock('Hospitals', unlockConfig.hospital)
}



let goldPerSecond = 1;


// Settings
const timePerStep = 500;

/**
 * Initiate the game
 */
function initiate() {
  // Get details about the users game if they have come back


  // Add listeners
  document.getElementById('city-clicker').addEventListener('click', (el) => {
    gold.add(1);
  });

  window.goldMine.addEventListener('click', e => buyUnlock('goldMine'))
  window.solar.addEventListener('click', e => buyUnlock('solar'))
  window.transport.addEventListener('click', e => buyUnlock('transport'))
  window.wind.addEventListener('click', e => buyUnlock('wind'))
  window.school.addEventListener('click', e => buyUnlock('school'))
  window.hospital.addEventListener('click', e => buyUnlock('hospital'))

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

/**
 * Draw content on page
 */
function draw() {
  document.getElementById('gold-value').textContent = Math.floor(gold.getValue());
  document.getElementById('happiness-value').textContent = happiness.getValue();
}

function buyUnlock(unlock) {
  if (gold.getValue() > unlockConfig[unlock].goldCost) {
    let bought = unlocks[unlock].buy()
    happiness.add( bought.happiness )
    gold.remove( unlockConfig[unlock].goldCost )
    goldPerSecond = goldPerSecond + bought.goldPs
  } else {
    alert('Dont have enough gold')
  }
}

// Launch the main game loop
initiate();