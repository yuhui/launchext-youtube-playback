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

var videoTimeFromFraction = require('./videoTimeFromFraction');

var VIDEO_MILESTONE_PERCENT_UNIT = 'percent';
var VIDEO_MILESTONE_SECONDS_UNIT = 'seconds';
// not ES6
var VIDEO_MILESTONE_UNIT_ABBREVIATIONS = {};
VIDEO_MILESTONE_UNIT_ABBREVIATIONS[VIDEO_MILESTONE_PERCENT_UNIT] = '%';
VIDEO_MILESTONE_UNIT_ABBREVIATIONS[VIDEO_MILESTONE_SECONDS_UNIT] = 's';
// ES6: placeholder to be used when updating the code base to ES6
/*
var VIDEO_MILESTONE_UNIT_ABBREVIATIONS = {
  [VIDEO_MILESTONE_PERCENT_UNIT]: '%',
  [VIDEO_MILESTONE_SECONDS_UNIT]: 's',
};
*/

/**
 * Change
 *
 * [
 *   {
 *     milestone: {
 *       amount: <number>,
 *       type: <string "fixed", "every">,
 *       unit: <string "percent", "seconds">,
 *     },
 *     trigger: trigger,
 *   },
 * ]
 *
 * into
 *
 * {
 *   "fixed" : {
 *     <string seconds> : {
 *       <string amount + unit> : [ trigger, trigger ],
 *     },
 *   },
 * }
 *
 * @param {Array} milestoneTriggersArr The list of milestones and their triggers.
 * @param {Number} videoDuration The duration of the video.
 * @param {Number} videoStartTime The time of the video start.
 * @param {Boolean} isLiveEvent true if the video is a "live" video broadcast, false otherwise.
 *
 * @return {Object} Milestones object that collects the triggers per milestone, or null if there
 * are no milestones.
 *
 * @throws Will throw an error if milestoneTriggersArr is not an array.
 * @throws Will throw an error if videoDuration is not a number.
 * @throws Will throw an error if videoStartTime is not a number.
 * @throws Will throw an error if isLiveEvent is not a boolean.
 */
module.exports = function(milestoneTriggersArr, videoDuration, videoStartTime, isLiveEvent) {
  var toString = Object.prototype.toString;
  if (!milestoneTriggersArr) {
    throw '"milestoneTriggersArr" argument not specified';
  }
  if (!Array.isArray(milestoneTriggersArr)) {
    throw '"milestoneTriggersArr" argument is not an array';
  }
  if (milestoneTriggersArr.length === 0) {
    throw '"milestoneTriggersArr" array is empty';
  }
  if (!videoDuration) {
    throw '"videoDuration" argument not specified';
  }
  if (toString.call(videoDuration) !== '[object Number]') {
    throw '"videoDuration" argument is not a number';
  }
  if (!videoStartTime && videoStartTime !== 0) {
    throw '"videoStartTime" argument not specified';
  }
  if (toString.call(videoStartTime) !== '[object Number]') {
    throw '"videoStartTime" argument is not a number';
  }
  if (!isLiveEvent && isLiveEvent !== false) {
    throw '"isLiveEvent" argument not specified';
  }
  if (toString.call(isLiveEvent) !== '[object Boolean]') {
    throw '"isLiveEvent" argument is not a boolean';
  }

  var milestoneTriggersObj = {};

  milestoneTriggersArr.forEach(function(milestoneTrigger) {
    var amount = milestoneTrigger.milestone.amount;
    var type = milestoneTrigger.milestone.type;
    var unit = milestoneTrigger.milestone.unit;
    var trigger = milestoneTrigger.trigger;

    if (
      toString.call(amount) !== '[object Number]'
      || ['every', 'fixed'].indexOf(type) === -1
      || [VIDEO_MILESTONE_PERCENT_UNIT, VIDEO_MILESTONE_SECONDS_UNIT].indexOf(unit) === -1
      || !trigger
    ) {
      return;
    }

    if (unit === VIDEO_MILESTONE_PERCENT_UNIT && isLiveEvent) {
      /**
       * "live" video broadcasts don't have a duration
       * so percentage-based milestones can't be detected
       */
      return;
    }

    var seconds = amount;
    var label = amount + VIDEO_MILESTONE_UNIT_ABBREVIATIONS[unit];

    if (unit === VIDEO_MILESTONE_PERCENT_UNIT) {
      // convert percentage amount to seconds
      var percentage = amount / 100;
      seconds = videoTimeFromFraction(videoDuration, percentage);
    }

    if (isLiveEvent) {
      // update the milestones to be offset from videoStartTime
      seconds += videoStartTime;
    }

    milestoneTriggersObj[type] = milestoneTriggersObj[type] || {};
    milestoneTriggersObj[type][seconds] = milestoneTriggersObj[type][seconds] || {};
    milestoneTriggersObj[type][seconds][label] = (
      milestoneTriggersObj[type][seconds][label] || []
    );

    milestoneTriggersObj[type][seconds][label].push(trigger);
  });

  return Object.keys(milestoneTriggersObj).length === 0 ? null : milestoneTriggersObj;
};
