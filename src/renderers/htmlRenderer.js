import {fastInnerHTML} from './../helpers/dom/element';
import {getRenderer, registerRenderer} from './../renderers';

/**
 * @private
 * @renderer HtmlRenderer
 * @param instance
 * @param TD
 * @param row
 * @param col
 * @param prop
 * @param value
 * @param cellProperties
 */
function htmlRenderer(instance, TD, row, col, prop, value, cellProperties) {
  // call is faster than apply http://docs.handsontable.com/tutorial-good-practices.html
  getRenderer('base').call(this, instance, TD, row, col, prop, value, cellProperties);

  if (value === null || value === void 0) {
    value = '';
  }

  fastInnerHTML(TD, value);
}

export {htmlRenderer};

registerRenderer('html', htmlRenderer);
