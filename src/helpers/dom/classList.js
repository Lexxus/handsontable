/**
 * @class ClassList.
 */
class ClassList {
  constructor(element) {
    this._element = element;
  }

  /**
   * Checks if specified class value exists in class attribute of the element.
   *
   * @params {string} value - class name to check.
   * @returns {boolean} true if class value is exists.
   */
  contains(value) {
    const className = this._element.className;
    const classLen = className.length;
    const valueLen = value.length;
    const isLenDiffer = classLen >= valueLen;
    let index = classLen > 0 && valueLen > 0 && isLenDiffer ? className.indexOf(value) : -1;
    let result = index > -1;
    let nextChar, prevChar;

    while (result && isLenDiffer) {
      prevChar = className[index - 1];
      nextChar = className[index + valueLen];
      result = (!prevChar || prevChar === ' ') && (!nextChar || nextChar === ' ');
      if (result || !nextChar) {
        break;
      }
      index = className.indexOf(value, index + valueLen);
      result = index > -1;
    }
    return result;
  }

  /**
   * Return class value by index in collection.
   *
   * @param {number} i - index.
   * @returns {string} class value.
   */
  item(i) {
    var classes = this._element._className.split(' ');

    return classes[i] || null;
  }

  /**
   * Add specified class values. If these classes already exist in attribute of the element, then they are ignored.
   *
   * @param {string} value - to add.
   */
  add(value) {
    if (!this.contains(value)) {
      this._element.className += (this._element.className ? ' ' : '') + value;
    }
  }

  /**
   * Remove specified class values.
   *
   * @param {string} value - class value to remove.
   */
  remove(value) {
    const className = this._element.className;
    let names, index;

    if (className && className.length > value.length) {
      names = className.split(' ');
      index = names.indexOf(value);
      if (index > -1) {
        if (index === names.length - 1) {
          names.pop();
        } else if (index === 0) {
          names.shift();
        } else {
          names.splice(index, 1);
        }
        this._element.className = names.length === 0 ? '' : names.join(' ');
      }
    }
  }

  /**
   * When only one argument is present: Toggle class value; i.e., if class exists then remove it
   * and return false, if not, then add it and return true.
   * When a second argument is present: If the second argument evaluates to true, add specified class value,
   * and if it evaluates to false, remove it.
   *
   * @param {string} value - to toggle.
   * @param {boolean} [force] - true to set value, false to remove it.
   */
  toggle(value, force) {
    const toRemove = (force === false || this.contains(value));

    if (!toRemove) {
      this._element.className += ' ' + value;
    } else if (!force) {
      this.remove(value);
    }
  }
}

export {ClassList};
