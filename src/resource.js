class Resource {
  constructor(name, initialValue = 0) {
    this.name = name;
    this.value = initialValue;
  }
  
  add(amount) {
    this.value = this.value + amount;
  }

  multiply(amount) {
    this.value = this.value * amount;
  }

  remove(amount) {
    this.value = this.value - amount;
  }

  getValue() {
    return this.value;
  }
}

export default Resource;