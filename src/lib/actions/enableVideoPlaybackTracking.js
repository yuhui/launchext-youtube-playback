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

var youtubeIframeApi = require('../helpers/youtubeIframeApi');

var logger = turbine.logger;

/**
 * Enable Video Playback Tracking action.
 * This action enables the selected YouTube players to work with the YouTube IFrame API.
 *
 * @param {Object} settings The settings object.
 * @param {Object} event The underlying event object that triggered the rule.
 */
module.exports = function(settings, event) {
  logger.debug('Enabling YouTube playback tracking on ' + event.$type);
  youtubeIframeApi.enableVideoPlaybackTracking(settings);
};
