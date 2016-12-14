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
   */
  constructor(element) {
    this._element = element;
    this.length = 0;
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
        this._element.className = attr.value;
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
        this[name] = void 0;
        this[i] = void 0;
        if (name === 'class') {
          this._element.className = '';
        }
      }
    }
  }
}

export {Attr, VirtualAttributes};
