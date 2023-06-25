/**
 * Copyright 2020-2023 Yuhui. All rights reserved.
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

var getVideoData = require('../helpers/getVideoData');

var VIDEO_DATA_NAME = 'playerState';

/**
 * Player State data element.
 * This data element returns the state of the YouTube Player.
 *
 * @param {Object} settings The data element settings object.
 * @param {Object} event The event that triggered the evaluation of the data element.
 * @param {Object} event.youtube State data of the YouTube player.
 * @param {String} event.state The player state.
 *
 * @returns {String} The player state.
 */
module.exports = function(settings, event) {
  var videoData = getVideoData(VIDEO_DATA_NAME, event);
  return videoData;
};
