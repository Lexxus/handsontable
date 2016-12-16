/**
 * @class Attr
 */
class Attr {
  constructor(name, value) {
    this.name = name;
    this.value = value;
  }
}

/**
 * @class VirtualAttributes
 */
class VirtualAttributes {
  /**
   * Constructor
   *
   * @param {VirtualElement} element - instance.
   * @param {Object} [attributes] - default set of attributes.
   */
  constructor(element, attributes) {
    this._element = element;
    this.length = 0;

    if (typeof attributes === 'object') {
      const keys = Object.keys(attributes);
      const len = keys.length;

      for (let i = 0, n = 0, name; i < len; i++) {
        name = keys[i];
        if (typeof this[name] !== 'function') {
          this[n++] = this[name] = new Attr(name, attributes[name]);
          this.length++;
          if (name === 'class') {
            this._element._className = attributes.class;
          }
        }
      }
    }
  }

  /**
   *
   */
  item(i) {
    return this[i];
  }

  /**
   *
   */
  setNamedItem(attr, noClass) {
    const name = typeof attr === 'object' && attr.name;
    let i = this.length;

    if (name && typeof this[name] !== 'function') {
      if (!this[name]) {
        this.length++;
      } else {
        while (i-- > 0) {
          if (this[i].name === name) {
            break;
          }
        }
        if (i < 0) {
          i = this.length++;
        }
      }
      this[name] = attr;
      this[i] = attr;
      if (name === 'class' && !noClass && typeof attr.value === 'string') {
        this._element._className = attr.value;
      }
    }
  }

  /**
   *
   */
  removeNamedItem(name) {
    const attr = this[name];

    if (typeof attr === 'object') {
      let i = this.length;
      while (i-- > 0) {
        if (this[i].name === name) {
          break;
        }
      }
      if (i >= 0) {
        this[name] = undefined;
        this[i] = undefined;
        this.length--;
        if (name === 'class') {
          this._element._className = '';
        }
      }
    }
  }

  toJSON() {
    const json = {};
    let i = this.length;

    while (i-- > 0) {
      const attr = this[i];

      json[attr.name] = attr.value;
    }

    return json;
  }
}

export {Attr, VirtualAttributes};
