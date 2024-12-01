/**
 * Copyright 2023-2024 Yuhui. All rights reserved.
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
module.exports = ({
  nodeName = 'IFRAME',
  includeId = false,
  includeSrc = true,
  srcUrl = 'https://www.youtube.com/embed/abc123_x-',
  parameters = [],
  attribute = {},
  launchextSetup = null,
} = {}) => {
  const element = {
    dataset: {
      launchextSetup,
    },
    nodeName,
  };

  if (includeId) {
    element.id = 'foobar';
  }

  if (includeSrc) {
    let src = srcUrl;
    if (parameters.length > 0) {
      const parametersToAdd = parameters.map((parameter) => {
        const { name, value } = parameter;
        return `${name}=${value}`;
      }).join('&');
      src = `${srcUrl}${srcUrl.includes('?') ? '&' : '?'}${parametersToAdd}`;
    }
    element.src = src;
  }

  element.getAttribute = () => attribute.name ? attribute.value : null;

  return element;
};
