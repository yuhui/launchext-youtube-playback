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

var flooredVideoTime = require('./flooredVideoTime');

/**
 * Calculate the equivalent video time (in seconds) for a given fraction.
 * Used mainly for milestone tracking.
 *
 * @param {Number} duration The video's duration in seconds.
 * @param {Number} fraction The fraction of the video's duration, e.g. 0.25.
 *
 * @return {Number} The calculated video time for the given fraction.
 */
module.exports = function(duration, fraction) {
  var videoTime = duration * fraction;
  videoTime = flooredVideoTime(videoTime);
  return videoTime;
};
