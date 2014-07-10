function Process() {
    this.id;
    this.io;
    this.instructions;
    this.name;
    this.seconds;
    this.timeBlocked;

    this.getInfo = getInfo;
}

function getInfo() {
    return this.id + " " + this.io + " " + this.instructions + " " + this.priority;
}
