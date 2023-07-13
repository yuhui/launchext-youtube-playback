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
 * Return a `player` object for use with helper unit testing.
 */
module.exports = {
  isMuted: () => {
    return false;
  },
  launchExt: {
    isLiveEvent: false,
    playStartTime: 3,
    playStopTime: 12,
    playSegmentTime: 9,
    playTotalTime: 53703,
    videoCurrentTime: 12,
    videoDuration: 90210,
    videoId: 'abc123_x-',
    videoLoadedFraction: 0.6789,
    videoPlaybackQuality: 'hd720',
    videoPlaybackRate: 25.0,
    videoTitle: 'Something something video',
    videoUrl: 'https://www.youtube.com/watch?v=abc123_x-',
    videoVolume: 100,
  },
};
