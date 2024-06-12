class Area {
  constructor(name) {
    this.name = name;
  }

  enter() {
    console.log(`Entering ${this.name}...`);
  }

  exit() {
    console.log(`Leaving ${this.name}...`);
  }
}
