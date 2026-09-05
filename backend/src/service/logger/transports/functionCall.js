const Transport = require('winston-transport');

class functionCall extends Transport {
  constructor(opts) {
    super(opts);
    this.functionCall = opts.call;
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
      this.functionCall(info);
    });

    callback();
  }
}

module.exports = functionCall;
