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

/**
 * Log a message to Launch's logger.
 * @param {string} level The log level to use.
 * @param {string} message The message to log.
 * @param {DOMElement} element (optional) The DOM element to associate the log
 * message with.
 */
module.exports = function(level, message, element) {
  // prefix the message with the element's ID
  var elementId = element ? ('Player ID ' + element.id + ': ') : '';

  if (!/\.$/.test(message)) {
    // add a full stop at the end of the message
    // ...because it looks nice 😉
    message = message + '.';
  }

  turbine.logger[level](elementId + message);
};
