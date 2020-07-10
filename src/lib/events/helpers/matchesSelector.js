/**
 * Copyright 2020 Yuhui. All rights reserved.
 *
 * Licensed under the GNU General Public License, Version 3.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.gnu.org/licenses/gpl-3.0.html
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// Original source: https://github.com/adobe/reactor-extension-core/blob/master/src/lib/events/helpers/matchesSelector.js

var log = require('../../helpers/log');

/**
 * Returns whether an element matches a selector.
 * @param {HTMLElement} element The HTML element being tested.
 * @param {string} selector The CSS selector.
 * @returns {boolean}
 */
module.exports = function(element, selector) {
  var matches = element.matches || element.msMatchesSelector;

  if (matches) {
    try {
      return matches.call(element, selector);
    } catch (error) {
      log(
        'warn',
        'Matching element failed. ' + selector + ' is not a valid selector.'
      );
      return false;
    }
  }

  return false;
};
