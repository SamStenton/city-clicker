class Unlock {
    constructor(name, config) {
        this.name = name
        this.id = config.id
        this.goldCost = config.goldCost
        this.happinessChange = config.happinessChange
        this.initialGps = config.initialGps
        this.additionalItemCost = config.additionalItemCost
        this.numberTimesPurchased = 0;
    }
    
    buy() {
        this.goldCost = Math.round(this.goldCost * this.additionalItemCost);
        const goldCost = this.goldCost;
        let happiness = this.happinessChange;
        let goldPs = this.initialGps;
        this.numberTimesPurchased++;
        return { goldCost, happiness, goldPs }
    }
}
  
export default Unlock;

// gold = 1000
// goldmine purchase = 2 happiness change is 0.95
// hospital = 4 happiness change is 1.05
// 2 * 0.95 = 1.90
// 4 * 1.05 = 4.20
// 