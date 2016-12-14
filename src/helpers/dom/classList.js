/**
 * @class ClassList
 */
class ClassList {
  constructor(element) {
    this._element = element;
  }

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

  add(value) {
    if (!this.contains(value)) {
      this._element.className += (this._element.className ? ' ' : '') + value;
    }
  }

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

  toggle(value) {
    if (this.contains(value)) {
      this.remove(value);
    } else {
      this._element.className += ' ' + value;
    }
  }
}

export {ClassList};
