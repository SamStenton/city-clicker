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
  school: new Unlock('School', unlockConfig.school),
  hospital: new Unlock('Hospital', unlockConfig.hospital)
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

/**
 * Draw content on page
 */
function draw() {
  document.getElementById('gold-value').textContent = Math.floor(gold.getValue());
  document.getElementById('happiness-value').textContent = happiness.getValue();
}

function buyUnlock(unlock) {
  const item = unlocks[unlock];
  const unlockCost = item.goldCost;
  if (gold.getValue() >= unlockCost) {
    let bought = item.buy()
    happiness.multiply(bought.happiness)
    gold.remove(unlockCost)
    goldPerSecond = goldPerSecond + bought.goldPs;
    updateUnlockDiv(item);
  } else {
    alert('Dont have enough gold')
  }
}

function updateUnlockDiv(item) {
  const id = item.id;
  const parent = document.getElementById(id);
  parent.innerHTML = '';
  // Create Title
  let el = document.createElement('div');
  el.className = 'unlock_title';
  el.textContent = item.name;
  parent.appendChild(el);
  // Create Gold price
  el = document.createElement('div');
  el.className = 'unlock_cost';
  el.textContent = `Cost: ${item.goldCost} Gold`;
  parent.appendChild(el);
  // Create Happiness multiplyer
  el = document.createElement('div');
  el.className = 'unlock_modifier';
  let sign = '+';
  if (item.happinessChange < 1) sign = '-';
  // To 4 decimal places to keep screen clear
  const happinessChange = Math.round((item.happinessChange) * 10000) / 10000;
  el.textContent = `Effect on Happiness: ${happinessChange} (${sign})`;
  parent.appendChild(el);
}

// Launch the main game loop
initiate();