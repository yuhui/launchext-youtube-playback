/**
 * Copyright 2021-2023 Yuhui. All rights reserved.
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

const mockPlayer = require('./mockPlayer');

/**
 * Return a base `event` object for use with data element unit testing.
 */
module.exports = (dataElement, playerState) => {
  const player = mockPlayer;
  const { isMuted, launchExt } = player;
  const {
    isLiveEvent,
    playSegmentTime,
    playTotalTime,
    videoCurrentTime,
    videoDuration,
    videoId,
    videoLoadedFraction,
    videoPlaybackQuality,
    videoPlaybackRate,
    videoTitle,
    videoUrl,
    videoVolume,
  } = launchExt;

  const event = {
    youtube: {
      videoCurrentTime: videoCurrentTime,
      videoDuration: videoDuration,
      videoId: videoId,
      videoLoadedFraction: videoLoadedFraction,
      videoMuted: isMuted(),
      videoPlaybackRate: videoPlaybackRate,
      videoTitle: videoTitle,
      videoType: isLiveEvent ? 'live' : 'video-on-demand',
      videoUrl: videoUrl,
      videoVolume: videoVolume,
    },
  };

  let defaultPlayerState = 'video playing';
  switch (dataElement) {
    case 'errorCode':
    case 'errorMessage':
      defaultPlayerState = 'player error';
      event.youtube.errorCode = 2;
      event.youtube.errorMessage = 'Request contains an invalid parameter value (error 2)';
      break;
    case 'moduleNames':
      defaultPlayerState = 'module with exposed API changed';
      event.youtube.moduleNames = 'foo,bar';
      break;
    case 'videoMilestone':
      defaultPlayerState = 'video milestone';
      event.youtube.videoMilestone = '25%';
      break;
    case 'videoPlayedSegmentTime':
    case 'videoPlayedTotalTime':
      defaultPlayerState = 'video paused';
      event.youtube.videoPlayedSegmentTime = playSegmentTime;
      event.youtube.videoPlayedTotalTime = playTotalTime;
      break;
    case 'videoPlaybackQuality':
      defaultPlayerState = 'playback quality changed';
      event.youtube.videoPlaybackQuality = videoPlaybackQuality;
      break;
  }

  const eventPlayerState = playerState || defaultPlayerState;
  event.youtube.playerState = eventPlayerState;
  event.$type = `youtube-playback.${eventPlayerState.replace(/\s/g, '-')}`;

  return event;
};
