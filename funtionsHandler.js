module.exports = class ClassName {
  constructor() {
    this.fun = {
      defaultHandler: function defaultHandler() {

      },
      query: {},
      game:{}
    };
  }

  registerDefault(fun){
    if(typeof(fun) !== "function"){
      throw new TypeError("First argument must be a function");
    }
    this.fun.defaultHandler = fun;
  }

  registerQuery(query, fun){
    if(typeof(query) !== "string"){
      throw new TypeError("First argument must be a string");
    }

    if(typeof(fun) !== "function"){
      throw new TypeError("Second argument must be a function");
    }
    this.fun.query[query] = fun;
  }

  registerGame(game, fun){
    if(typeof(game) !== "string"){
      throw new TypeError("First argument must be a string");
    }

    if(typeof(fun) !== "function"){
      throw new TypeError("Second argument must be a function");
    }
    this.fun.query[game] = fun;
  }

  getHandler(game, query){
    if(this.fun.game[game]){
      return this.fun.game[game];
    }else if(this.fun.query[query]){
      return this.fun.query[query];
    }else{
      return this.fun.defaultHandler;
    }
  }
};
