import './style.css';
import MainLoop from 'mainloop.js';
import Resource from './resource.js';

const gold = new Resource('Gold', 0);
const happiness = new Resource('Happiness', 1);
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
  document.getElementById('gold-value').innerHTML = Math.floor(gold.getValue());
  document.getElementById('happiness-value').innerHTML = happiness.getValue();
}

// Launch the main game loop
initiate();