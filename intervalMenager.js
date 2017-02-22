module.exports = class intervalMenager {
  constructor() {
    this.intervalId = null;
    this.function = function () {
      console.log("Somethink should be here");
    };
    this.interval = 1000;
    this.id = 0;
    return this;
  }
  setFunction(fn){
    if(typeof fn !== "function"){
      throw new TypeError("fn should be a function");
    }
    this.function = fn;
    return this;
  }
  setInterval(int){
    if (typeof int !== "number") {
      throw new TypeError("int should be a number");
    }
    this.interval = int;
    return this;
  }
  start(){
    var self = this;
    this.intervalId = setInterval(function () {
      self.function(++self.id);
    }, this.interval);
    return this;
  }
  stop(){
    clearInterval(this.intervalId);
    return this;
  }
};
