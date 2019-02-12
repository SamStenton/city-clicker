class Unlock {
    constructor(name, config) {
        this.name = name
        this.id = config.id
        this.goldCost = config.goldCost
        this.happinessChange = config.happinessChange
        this.initialGps = config.initialGps
        this.additionalItemCost = config.additionalItemCost
        this.isFirstPurchase = true
    }
    
    buy() {
        this.goldCost = Math.round(this.goldCost * this.additionalItemCost);
        const goldCost = this.goldCost;
        let happiness = this.happinessChange
        let goldPs = this.initialGps
        this.isFirstPurchase = false
        return { goldCost, happiness, goldPs }
    }
  
    prop(prop) { return this[prop] }
}
  
export default Unlock;