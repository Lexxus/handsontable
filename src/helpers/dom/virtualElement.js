import {
  empty,
  fastInnerText
} from './element';
import {ClassList} from './classList';
import {Attr, VirtualAttributes} from './virtualAttributes';

const htmlWrapper = document.createElement('DIV');

/**
 * @class VirtualElement.
 */
class VirtualElement {
  /**
   * Constructor
   *
   * @param {string} [nodeName='DIV'] - tag name.
   * @param {string|Object} [className] - className value or set of attributes.
   * @param {Array|Object|string|DOMNode} [children] - the element content.
   */
  constructor(nodeName, className, children) {
    const classNameType = typeof className;
    const childrenType = typeof children;
    const attributes = classNameType === 'object' ? className : undefined;

    this.isVirtual = true;
    this.nodeName = nodeName ? nodeName.toUpperCase() : 'DIV';
    this.nodeType = 1;
    this.textContent = childrenType === 'string' ? children : '';
    if (childrenType === 'object') {
      this.children = Array.isArray(children) ? children : [children];
    } else {
      this.children = [];
    }
    this.childNodes = this.children;
    this.firstChild = this.children[0] || null;
    this.lastChild = this.children[this.children.length - 1] || null;
    this.style = {};

    // private properties must not be enumerable.
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

    this.classList = new ClassList(this);
    this.attributes = new VirtualAttributes(this, attributes);

    if (classNameType === 'string') {
      this.className = className;
    }
  }

  /**
   * Setter of className property.
   *
   * @params {string} value - value for "class" attribure.
   */
  set className(value) {
    this._className = value;
    if (this.attributes.class) {
      this.attributes.class.value = value;
    } else {
      this.attributes.setNamedItem(new Attr('class', value));
    }
  }

  /**
   * Getter of className property.
   *
   * @returns {string} value of "class" attribute.
   */
  get className() {
    return this._className;
  }

  /**
   * Setter of innerHTML property.
   *
   * @param {string} value - HTML string.
   */
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

  /**
   * Getter of innerHTML property.
   *
   * @returns {string} HTML string that isn't related to actual children set in the element.
   *   It just returns the last set value.
   */
  get innerHTML() {
    return this._innerHTML;
  }

  /**
   * Setter of innerText property.
   *
   * @param {string} value - text.
   */
  set innerText(value) {
    this.textContent = value;
  }

  /**
   * Getter of innerText property.
   *
   * @returns {string} text.
   */
  get innerText() {
    return this.textContent;
  }

  /**
   * Getter of firstElementChild peroperty.
   *
   * @returns {VirtualElement|DOMNode} the first children or null.
   */
  get firstElementChild() {
    return this.firstChild;
  }

  /**
   * Getter of lastElementChild peroperty.
   *
   * @returns {VirtualElement|DOMNode} the last children or null.
   */
  get lastElementChild() {
    return this.lastChild;
  }

  /**
   * Reset this element
   *
   * @param {string} [nodeName] - default 'DIV'
   */
  reset(nodeName) {
    this.nodeName = nodeName ? nodeName.toUpperCase() : 'DIV';
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

    return element;
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
    this.textContent = child && child.nodeType === 3 ? child.textContent : '';

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
      const attributes = node.attributes;
      let nodeAttr;

      name = attr.name;
      if (name !== 'class') {
        value = attr.value;
        // if (node.getAttribute(name) !== value) {
        //   node.setAttribute(name, value);
        // }
        nodeAttr = attributes[name];
        if (!nodeAttr) {
          node.setAttribute(name, value);
        } else if (nodeAttr.value !== value) {
          nodeAttr.value = value;
        }
      }
    }

    if (el.isVirtual && !el.firstChild ||
        !el.isVirtual && !el.firstElementChild) {
      if (el.textContent !== node.textContent) {
        fastInnerText(node, el.textContent);
      }
    } else if (el.firstChild) {
      if (isNodeText) {
        node.removeChild(node.firstChild);
      }
      for (i = 0, len = el.children.length; i < len; i++) {
        const child = el.children[i];
        let nodeChild = node.children[i];

        while (nodeChild && (nodeChild.nodeName !== child.nodeName ||
            nodeChild.children.length !== child.children.length)) {
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
   * Create a new virtual element as clone of current one.
   *
   * @param {boolean} withChildren - true to clone the children of the element.
   * @returns {VirtualElement} exact copy of the current object.
   */
  cloneNode(withChildren) {
    const node = new VirtualElement(this.nodeName, this.attributes.toJSON());
    let i, len;

    node.textContent = this.textContent;

    // clone children
    if (withChildren) {
      len = this.children.length;
      if (len) {
        for (i = 0; i < len; i++) {
          let child = this.children[i];
          node.children.push(child.cloneNode());
        }
        node.firstChild = node.children[0];
        node.lastChild = node.children[len - 1];
      }
    }

    return node;
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
   * @param {Element|VirtualElement|string} node - node to append or tag name to create a node on the fly.
   * @param {string|Object} [className] - className value or set of attributes if creating a node.
   * @param {Array|Object|string|Node} [children] - the element content if creating a node.
   */
  appendChild(node, attributes, children) {
    if (typeof node === 'string') {
      // create a child on the fly
      node = new VirtualElement(node, attributes, children);
    }
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

  /**
   * Create new attribute or update an exists attribute.
   *
   * @param {string} name - of the attribute.
   * @param {string} value - of the attribute.
   */
  setAttribute(name, value) {
    const attrs = this.attributes;

    if (attrs[name]) {
      attrs[name].value = value;
    } else {
      attrs.setNamedItem(new Attr(name, value));
    }
  }

  /**
   * Remove attribute.
   *
   * @param {string} name - of the attribute to remove.
   */
  removeAttribute(name) {
    this.attributes.removeNamedItem(name);
  }

  /**
   * Get value of an attribute.
   *
   * @param {string} name - of the attribute.
   * @returns {string|null} value of the attribute or null if attribute doesn't exist.
   */
  getAttribute(name) {
    return this.attributes[name] ? this.attributes[name].value : null;
  }

  /**
   * Get list of children elements by tag name.
   *
   * @param {string} tagName - tag name to search.
   * @returns {Array} list of elements.
   */
  getElementsByTagName(tagName) {
    const result = [];
    const tag = tagName.toUpperCase();
    const len = this.children.length;

    for (let i = 0; i < len; i++) {
      const node = this.children[i];
      if (node.nodeName === tag) {
        result.push(node);
      }
    }
    return result;
  }
}

export {VirtualElement};

window.VirtualElement = window.VirtualElement || VirtualElement;
