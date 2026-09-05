class Parameter {
  constructor() {
    this.values = [];
    this.history = {};
  }

  add(value, tag) {
    if (tag && this.history[tag]) return this.history[tag];

    if (value instanceof Date) this.values.push(value.toISOString());
    else this.values.push(value);

    if (tag) this.history[tag] = this.values.length;
    return this.values.length;
  }

  i(value, tag) {
    return `$${this.add(value, tag)}`;
  }

  clear() {
    this.values = [];
    this.history = {};
  }
}

module.exports = Parameter;
