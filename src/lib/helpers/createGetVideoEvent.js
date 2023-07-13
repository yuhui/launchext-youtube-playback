/**
 * Copyright 2022-2023 Yuhui. All rights reserved.
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
 * Create a synthetic YouTube playback event that can be sent to an Extension event's trigger
 * callback.
 * This synthetic event *MUST* be bound to the calling YouTube IFrame DOM element.
 *
 * @param {Object or Event} nativeEvent The native video event object.
 * @param {Object} stateData Data about the current state of the YouTube player.
 * See `getVideoStateData` helper module.
 * @param {String} videoPlatform Name of the video player's platform.
 *
 * @return {Event} Event object that is specific to the video player's state.
 *
 * @this {DOMElement} The video IFrame DOM element that caused the event.
 *
 * @throws Will throw an error if nativeEvent is not a string.
 * @throws Will throw an error if stateData is not an object.
 * @throws Will throw an error if videoPlatform is not a string.
 */
module.exports = function(nativeEvent, stateData, videoPlatform) {
  var toString = Object.prototype.toString;
  if (!nativeEvent) {
    throw '"nativeEvent" argument not specified';
  }
  if (!/^\[object .*(Event|Object)\]$/.test(toString.call(nativeEvent))) {
    throw '"nativeEvent" argument is not an object or browser event';
  }
  if (!stateData) {
    throw '"stateData" argument not specified';
  }
  if (toString.call(stateData) !== '[object Object]') {
    throw '"stateData" argument is not an object';
  }
  if (!videoPlatform) {
    throw '"videoPlatform" argument not specified';
  }
  if (toString.call(videoPlatform) !== '[object String]') {
    throw '"videoPlatform" argument is not a string';
  }

  var event = {
    element: this,
    target: this,
    nativeEvent: nativeEvent,
  };
  event[videoPlatform] = stateData;

  return event;
};
