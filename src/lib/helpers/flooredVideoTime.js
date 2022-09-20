/**
 * Copyright 2021-2022 Yuhui. All rights reserved.
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
 * Floor the specified video time to the nearest 0.5 seconds.
 * Used mainly for milestone tracking.
 *
 * @param {Number} videoTime The video's time in seconds to floor.
 *
 * @return {Number} The video time floored to the nearest 0.5 seconds.
 */
module.exports = function(videoTime) {
  var remainder = videoTime % 1;
  var flooredVideoTime = videoTime - remainder + (remainder >= 0.5 ? 0.5 : 0.0);
  return flooredVideoTime;
};
