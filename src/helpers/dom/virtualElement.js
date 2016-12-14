import {
  empty,
  fastInnerText
} from './element';
import {ClassList} from './classList';
import {Attr, VirtualAttributes} from './virtualAttributes';

const htmlWrapper = document.createElement('DIV');

/**
 * @class VirtualElement
 */
class VirtualElement {
  /**
   * Constructor
   *
   * @param {string} [nodeName='DIV'] - tag name.
   */
  constructor(nodeName) {
    this.classList = new ClassList(this);
    this.attributes = new VirtualAttributes(this);

    this.isVirtual = true;
    this.nodeName = nodeName || 'DIV';
    this.nodeType = 1;
    this.textContent = '';
    this.firstChild = null;
    this.lastChild = null;
    this.children = [];
    this.childNodes = this.children;
    this.style = {};
    // private properties must be not enumerable
    Object.defineProperty(this, '_className', {
      writable: true,
      value: ''
    });
    Object.defineProperty(this, '_innerHTML', {
      writable: true,
      value: ''
    });
    Object.defineProperty(this, '_htmlWrapper', {
      value: htmlWrapper
    });
  }

  set className(value) {
    this._className = value;
    if (this.attributes.class) {
      this.attributes.class.value = value;
    } else {
      this.attributes.setNamedItem(new Attr('class', value));
    }
  }

  get className() {
    return this._className;
  }

  set innerHTML(value) {
    let children, i, len;

    this._innerHTML = value;
    this._htmlWrapper.innerHTML = value;
    this.children.length = 0;
    children = this._htmlWrapper.children;
    i = 0;
    len = children.length;
    while (i < len) {
      this.children.push(children[i++]);
    }
    this.firstChild = this.children[0];
    this.lastChild = this.children[len - 1];
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerText(value) {
    this.textContent = value;
  }

  get innerText() {
    return this.textContent;
  }

  get firstElementChild() {
    return this.firstChild;
  }

  get lastElementChild() {
    return this.lastChild;
  }

  /**
   * Reset this element
   *
   * @param {string} [nodeName] - default 'DIV'
   */
  reset(nodeName) {
    this.nodeName = nodeName || 'DIV';
    this._className = '';
    this.textContent = '';

    this.style = {};

    this.firstChild = null;
    this.lastChild = null;

    this.children.length = 0;
    this.attributes = new VirtualAttributes(this);
  }

  /**
   * Create a real node element from this virtual.
   *
   * @returns {Element}
   */
  createElement() {
    const element = document.createElement(this.nodeName);
    let i, len;

    // clone attributes
    for (i = 0, len = this.attributes.length; i < len; i++) {
      const attr = this.attributes[i];

      element.setAttribute(attr.name, attr.value);
    }

    // clone children
    for (i = 0, len = this.children.length; i < len; i++) {
      let child = this.children[i];

      if (child.isVirtual) {
        child = child.createElement();
      }
      element.appendChild(child);
    }
  }

  /**
   * Clone a real node element into this virtual.
   * Just copy all node attributes and text.
   *
   * @param {Element} node - element to clone attributes from.
   */
  cloneFrom(node) {
    const child = node.firstChild;

    this.nodeName = node.nodeName;
    this._className = '';
    if (child && child.nodeType === 3) {
      this.textContent = child.textContent;
    } else {
      this.textContent = '';
    }

    this.style = {};

    this.firstChild = null;
    this.lastChild = null;

    this.children.length = 0;
    this.attributes = new VirtualAttributes(this);

    // clone attributes
    if (node.attributes.length) {
      for (let i = 0, len = attrs.length, attr; i < len; i++) {
        attr = node.attributes[i];
        this.attributes.setNamedItem(new Attr(attr.name, attr.value));
      }
    }
  }

  /**
   * Apply the attributes of this virtual element into a real node element.
   *
   * @param {Element} node - a real node element.
   * @param {VirtualElement|Element} [etalon] - an element to apply attributes from.
   *     It allows to copy attributes between the real nodes.
   */
  applyTo(node, etalon) {
    const el = etalon || this;
    const attrs = el.attributes;
    let isNodeText = node.firstChild && node.firstChild.nodeType === 3;
    let i, len, name, value, nodeAttrs;

    if (el.className !== node.className) {
      node.className = el.className;
    }

    // remove redundant attributes
    for (nodeAttrs = node.attributes, i = nodeAttrs.length - 1; i >= 0; i--) {
      name = nodeAttrs[i].name;

      if (!el.attributes[name]) {
        node.removeAttribute(name);
      }
    }

    // apply attributes
    for (i = 0, len = attrs.length; i < len; i++) {
      let attr = attrs[i];

      name = attr.name;
      if (name !== 'class') {
        value = attr.value;
        if (node.getAttribute(name) !== value) {
          node.setAttribute(name, value);
        }
      }
    }

    if (el.isVirtual && !el.firstChild ||
        !el.isVirtual && !el.firstElementChild) {
      fastInnerText(node, el.textContent);
    } else if (el.firstChild) {
      if (isNodeText) {
        node.removeChild(node.firstChild);
      }
      for (i = 0, len = el.children.length; i < len; i++) {
        const child = el.children[i];
        let nodeChild = node.children[i];

        while (nodeChild && nodeChild.nodeName !== child.nodeName) {
          node.removeChild(nodeChild);
          nodeChild = node.children[i];
        }
        if (nodeChild) {
          this.applyTo(nodeChild, child);
        } else {
          node.appendChild(child.isVirtual ? child.createElement() : child);
        }
      }
    } else {
      empty(node);
    }
  }

  /**
   * Remove child node.
   *
   * @param {Element|VirtualElement} node - to remove.
   * @returns {Element|VirtualElement} removed node.
   */
  removeChild(node) {
    let children = this.children;
    let i = -1;

    if (children[0] === node) {
      this.firstChild = children[1] || null;
      if (!this.firstChild) {
        this.lastChild = null;
      }
      return children.length === 1 ? children.pop() : children.shift();
    }
    if (children.length > 1) {
      i = children.indexOf(node);
    }
    if (i < 0) {
      return null;
    }
    if (i + 1 === children.length) {
      this.lastChild = children[i - 1];
      return children.pop();
    }
    return this.children.splice(i, 1);
  }

  /**
   * Append child node.
   *
   * @param {Element|VirtualElement} node - to append.
   */
  appendChild(node) {
    if (node.nodeType === 3) {
      this.textContent = node.textContent;
    } else {
      this.children.push(node);
      this.lastChild = node;
      if (this.children.length === 1) {
        this.firstChild = node;
      }
    }
  }

  setAttribute(name, value) {
    const attrs = this.attributes;

    if (attrs[name]) {
      attrs[name].value = value;
    } else {
      attrs.setNamedItem(new Attr(name, value));
    }
  }

  removeAttribute(name) {
    this.attributes.removeNamedItem(name);
  }

  getAttribute(name) {
    return this.attributes[name] || null;
  }
}

export {VirtualElement};

window.VirtualElement = VirtualElement;
