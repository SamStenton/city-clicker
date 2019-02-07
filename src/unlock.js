class Unlock {
    constructor(name, config) {
        this.name = name
        this.goldCost = config.goldCost
        this.happinessChange = config.happinessChange
        this.initialGps = config.initialGps
        this.additionalItemCost = config.additionalItemCost
        this.isFirstPurchase = true
    }
    
    buy() {
        let gold = this.isFirstPurchase ? this.goldCost : (this.goldCost + (this.goldCost * this.additionalItemCost))
        let happiness = this.happinessChange
        let goldPs = this.initialGps
        this.isFirstPurchase = false
        return { gold, happiness, goldPs }
    }
  
    prop(prop) { return this[prop] }
}
  
export default Unlock;