/**
 * Copyright 2026 Yuhui. All rights reserved.
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
 * Find a milestone between the previous update time and current time, and do something with it.
 *
 * @param {Object} player The video player object.
 * @callback callbackFunction
 * @param {Number} foundMilestoneSeconds Milestone that was found.
 *
 * @returns {Number} The milestone that was found, or undefined if no milestone was found.
 *
 * @throws Will throw an error if player is not an object.
 * @throws Will throw an error if player.launchExt is not an object.
 * @throws Will throw an error if callbackFunction is not a function.
 */
module.exports = function(player, callbackFunction) {
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
  if (!callbackFunction) {
    throw '"callbackFunction" argument not specified';
  }
  if (typeof callbackFunction !== 'function') {
    throw '"callbackFunction" argument is not a function';
  }

  var milestoneSeconds = player.launchExt.milestoneSeconds;
  var previousUpdateTime = player.launchExt.previousUpdateTime;
  var playStopTime = player.launchExt.playStopTime;

  var foundMilestoneSeconds = milestoneSeconds.find(function (milestoneTime) {
    return milestoneTime >= previousUpdateTime && milestoneTime <= playStopTime;
  });

  if (!foundMilestoneSeconds) {
    return;
  }

  callbackFunction(foundMilestoneSeconds);

  return foundMilestoneSeconds;
};
