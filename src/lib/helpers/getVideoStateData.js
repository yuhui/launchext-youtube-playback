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

var VIDEO_TYPE_LIVE = 'live';
var VIDEO_TYPE_VOD = 'video-on-demand';

/**
 * Get data about the current video player's state.
 *
 * @param {Object} player The video player object.
 * @param {String} eventType The Event Type that has been triggered.
 *
 * @return {Object} Data about the current state of the video player.
 *
 * @throws Will throw an error if player is not an object.
 * @throws Will throw an error if player.launchExt is not an object.
 * @throws Will throw an error if eventType is not a string.
 */
module.exports = function(player, eventType) {
  var toString = Object.prototype.toString;

  if (!player) {
    throw '"player" argument not specified';
  }
  if (toString.call(player) !== '[object Object]') {
    throw '"player" argument is not an object';
  }
  if (!player.launchExt || toString.call(player.launchExt) !== '[object Object]') {
    throw '"player" argument is missing "launchExt" object';
  }
  if (!eventType) {
    throw '"eventType" argument not specified';
  }
  if (toString.call(eventType) !== '[object String]') {
    throw '"eventType" argument is not a string';
  }

  var videoType = player.launchExt.isLiveEvent ? VIDEO_TYPE_LIVE : VIDEO_TYPE_VOD;

  var stateData = {
    player: player,
    playerState: eventType,
    videoCurrentTime: player.launchExt.videoCurrentTime,
    videoDuration: player.launchExt.videoDuration,
    videoId: player.launchExt.videoId,
    videoLoadedFraction: player.launchExt.videoLoadedFraction,
    videoMuted: player.isMuted(),
    videoPlaybackQuality: player.launchExt.videoPlaybackQuality,
    videoPlaybackRate: player.launchExt.videoPlaybackRate,
    videoTitle: player.launchExt.videoTitle,
    videoType: videoType,
    videoUrl: player.launchExt.videoUrl,
    videoVolume: player.launchExt.videoVolume,
  };

  return stateData;
};
