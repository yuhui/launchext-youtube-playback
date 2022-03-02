/**
 * Copyright 2021 Yuhui. All rights reserved.
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
 * Return a base `event` object for use with data element unit testing.
 */
module.exports = function(optionalProperties) {
  var baseEvent = {
    state: 'video playing',
    youtube: {
      currentTime: 12.345,
      duration: 90210.90,
      muted: false,
      playbackRate: 25.0,
      playTime: 4.765,
      videoId: 'abc123_x',
      videoLoadedFraction: 0.6789,
      videoTitle: 'Something something video',
      videoType: 'video-on-demand',
      videoUrl: 'https://www.youtube.com/watch?v=abc123_x',
      volume: 100,
    },
  };

  if (optionalProperties) {
    optionalProperties.forEach(function(optionalProperty) {
      switch (optionalProperty) {
        case 'errorCode':
        case 'errorMessage':
          baseEvent.state = 'player error';
          baseEvent.youtube.errorCode = 2;
          baseEvent.youtube.errorMessage = 'Request contains an invalid parameter value (error 2)';
          break;
        case 'moduleNames':
          baseEvent.youtube.moduleNames = 'foo,bar';
          break;
        case 'playbackQuality':
          baseEvent.state = 'playback quality changed';
          baseEvent.youtube.playbackQuality = 'hd720';
          break;
        case 'videoMilestone':
          baseEvent.youtube.videoMilestone = '25%';
          break;
      }
    });
  }

  return baseEvent;
};
