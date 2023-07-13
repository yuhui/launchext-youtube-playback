/**
 * Copyright 2023 Yuhui. All rights reserved.
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
 * Return a `element` object for use with helper unit testing.
 */
module.exports = function(includeId, includeParameters) {
  const element = {
    dataset: {},
    nodeName: 'IFRAME',
    src: 'https://www.youtube.com/embed/abc123_x-'
  };

  if (includeId) {
    element.id = 'foobar';
  }
  if (includeParameters) {
    const parametersToAdd = [];
    if (!includeParameters.includes('param1')) {
      parametersToAdd.push('param1=1');
    }
    if (!includeParameters.includes('param2')) {
      parametersToAdd.push('param2=https://www.mockmock.com');
    }
    if (parametersToAdd.length > 0) {
      element.src =
        `${element.src}${element.src.includes('?') ? '&' : '?'}${parametersToAdd.join('&')}`;
    }
  }

  return element;
};
