module.exports = class intervalMenager {
  constructor() {
    this.intervalId = null;
    this.function = function () {
      console.log("Somethink should be here");
    };
    this.interval = 1000;
    this.id = 0;
    this.lastInterval = null;
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
  getLast(){
    if (this.lastInterval === null) {
      return 0;
    }
    return (new Date()) - this.lastInterval;
  }
  start(){
    if (this.intervalId === null) {
      var fun = function () {
        self.function(++self.id);
        self.lastInterval = new Date();
      };
      var self = this;
      this.intervalId = setInterval(fun, this.interval);
      setTimeout(fun, 1);
      return this;
    }else{
      throw new Error("Interval already started");
    }
  }
  stop(){
    if(this.intervalId !== null){
      clearInterval(this.intervalId);
      this.intervalId = null;
      return this;
    }else{
      throw new Error("No interval to stop");
    }
  }
};
