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

var logger = turbine.logger;

var EXTENSION_TYPE_PREFIX = 'youtube-playback.';
var VIDEO_TYPE_LIVE = 'live';
var VIDEO_TYPE_VOD = 'video-on-demand';

var VIDEO_DATA_SPECIFICATIONS = {
  errorCode: {
    expectedPlayerStates: [
      'player error',
    ],
    expectedType: {
      type: 'Number',
      rules: {
        type: 'integer',
        exclusiveMinimum: 0,
      },
    },
  },
  errorMessage: {
    expectedPlayerStates: [
      'player error',
    ],
    expectedType: {
      type: 'String',
    },
  },
  moduleNames: {
    expectedPlayerStates: [
      'module with exposed API changed',
    ],
    expectedType: {
      type: 'String',
    },
  },
  playerState: {
    expectedType: {
      type: 'String',
    },
  },
  videoCurrentTime: {
    expectedType: {
      type: 'Number',
      rules: {
        type: 'integer',
        minimum: 0,
      },
    },
  },
  videoDuration: {
    expectedType: {
      type: 'Number',
      rules: {
        type: 'integer',
        minimum: 0,
      },
    },
  },
  videoId: {
    expectedType: {
      type: 'String',
      rules: {
        type: 'regexp',
        pattern: /^[\w-]+$/,
      },
    },
  },
  videoLoadedFraction: {
    expectedType: {
      type: 'Number',
      rules: {
        type: 'float',
        minimum: 0,
      },
    },
  },
  videoMilestone: {
    expectedPlayerStates: [
      'video milestone',
    ],
    expectedType: {
      type: 'String',
      rules: {
        type: 'regexp',
        pattern: /(s|%)$/,
      },
    },
  },
  videoMuted: {
    expectedType: {
      type: 'Boolean',
    },
  },
  videoPlaybackQuality: {
    expectedPlayerStates: [
      'playback quality changed',
    ],
    expectedType: {
      type: 'String',
    },
  },
  videoPlaybackRate: {
    expectedType: {
      type: 'Number',
      rules: {
        type: 'float',
        minimum: 0,
      },
    },
  },
  videoPlayedSegmentTime: {
    expectedPlayerStates: [
      'video buffering',
      'video cued',
      'video paused',
      'video ended',
      'player removed',
    ],
    expectedType: {
      type: 'Number',
      rules: {
        type: 'integer',
        minimum: 0,
      },
    },
  },
  videoPlayedTotalTime: {
    expectedPlayerStates: [
      'video buffering',
      'video cued',
      'video paused',
      'video ended',
      'player removed',
    ],
    expectedType: {
      type: 'Number',
      rules: {
        type: 'integer',
        minimum: 0,
      },
    },
  },
  videoTitle: {
    expectedType: {
      type: 'String',
    },
  },
  videoType: {
    expectedType: {
      type: 'String',
      rules: {
        type: 'one of',
        values: [VIDEO_TYPE_LIVE, VIDEO_TYPE_VOD],
      },
    },
  },
  videoUrl: {
    expectedType: {
      type: 'String',
      rules: {
        type: 'regexp',
        pattern: /^https:\/\/www\.youtube\.com\/watch\?v=[\w-]+$/,
      },
    },
  },
  videoVolume: {
    expectedType: {
      type: 'Number',
      rules: {
        type: 'integer',
        minimum: 0,
        maximum: 100,
      },
    },
  },
};

/**
 * Get the requested video data from the video event.
 * Used by data elements.
 *
 * @param {String} videoDataName The video data being requested for.
 * @param {Object} event The event being passed to the data element.
 * @param {Object} event.youtube State data of the YouTube player.
 * @param {String} event.youtube.playerState The player state.
 *
 * @return {Any} Video data being requested.
 *
 * @throws Will throw an error if videoDataName is not a string.
 * @throws Will throw an error if event is not an object.
 * @throws Will throw an error if event.youtube property is missing.
 * @throws Will throw an error if event.youtube.playerState property is missing.
 * @throws Will throw an error if event.youtube[videoDataName] property is missing.
 * @throws Will throw an error if the video data is not an expected type.
 * @throws Will throw an error if the video data is not an expected value.
 */
module.exports = function(videoDataName, event) {
  var toString = Object.prototype.toString;

  try {
    if (!videoDataName) {
      throw '"videoDataName" argument not specified.';
    }
    if (toString.call(videoDataName) !== '[object String]') {
      throw '"videoDataName" argument is not a string.';
    }
    if (Object.keys(VIDEO_DATA_SPECIFICATIONS).indexOf(videoDataName) === -1) {
      throw '"videoDataName" argument is not a valid data element type.';
    }
    if (!event) {
      throw '"event" argument not specified. Use _satellite.getVar("data element name", event);.';
    }
    if (toString.call(event) !== '[object Object]') {
      throw (
        '"event" argument is not an object. Use _satellite.getVar("data element name", event);.'
      );
    }
    if (event.$type.indexOf(EXTENSION_TYPE_PREFIX) === -1) {
      throw (
        'Data element being used with an event that is not from the YouTube Playback extension.'
      );
    }
    if (!event.youtube || !event.youtube.playerState) {
      throw (
        'Data element being used with an event that is not from the YouTube Playback extension.'
      );
    }

    var videoDataSpecifications = VIDEO_DATA_SPECIFICATIONS[videoDataName];
    if (!videoDataSpecifications) {
      throw 'Something went wrong when getting ' + videoDataName + '.';
    }

    var expectedPlayerStates = videoDataSpecifications.expectedPlayerStates;
    if (expectedPlayerStates && expectedPlayerStates.indexOf(event.youtube.playerState) === -1) {
      var expectedPlayerStatesString = expectedPlayerStates.sort().join('", "');
      throw (
        'Trying to get "' + videoDataName + '" but video event "' + event.youtube.playerState + '"'
        + ' is not one of "' + expectedPlayerStatesString + '".'
      );
    }
  } catch (e) {
    logger.error(e);
    return;
  }

  var videoData = event.youtube[videoDataName];

  try {
    var expectedType = videoDataSpecifications.expectedType;
    var expectedVideoDataType = expectedType.type;
    var expectedTypeString = '[object ' + expectedVideoDataType + ']';
    if (toString.call(videoData) !== expectedTypeString) {
      throw videoDataName + ' is not of type ' + expectedVideoDataType + '.';
    }

    var expectedRules = expectedType.rules;
    if (toString.call(expectedRules) === '[object Object]') {
      var expectedRulesKeys = Object.keys(expectedRules);
      if (expectedRulesKeys.length > 0) {
        var expectedRuleType = expectedRules.type;

        switch (expectedVideoDataType) {
          case 'Number':
            switch (expectedRuleType) {
              case 'integer':
                if (videoData % 1 !== 0 && Math.round(videoData) !== Math.floor(videoData)) {
                  throw videoDataName + ' is not an integer.';
                }
                break;
            }
            expectedRulesKeys.forEach(function(expectedRuleKey) {
              if (expectedRuleKey === 'type') {
                // this has already been validated, so can ignore it
                return;
              }

              var expectedRuleValue = expectedRules[expectedRuleKey];
              switch (expectedRuleKey) {
                case 'exclusiveMinimum':
                  if (videoData <= expectedRuleValue) {
                    throw videoDataName + ' is not greater than ' + expectedRuleValue + '.';
                  }
                  break;
                case 'maximum':
                  if (videoData > expectedRuleValue) {
                    throw (
                      videoDataName + ' is not less than or equal to ' + expectedRuleValue + '.'
                    );
                  }
                  break;
                case 'minimum':
                  if (videoData < expectedRuleValue) {
                    throw (
                      videoDataName + ' is not greater than or equal to ' + expectedRuleValue + '.'
                    );
                  }
                  break;
              }
            });

            break;
          case 'String':
            if (videoData.length === 0) {
              throw videoDataName + ' is a blank string.';
            }

            switch (expectedRuleType) {
              case 'one of':
                if (expectedRules.values.indexOf(videoData) === -1) {
                  throw (
                    videoDataName + ' is not one of "' + expectedRules.values.join('", "') + '".'
                  );
                }
                break;
              case 'regexp':
                if (!expectedRules.pattern.test(videoData)) {
                  throw videoDataName + ' is not a valid string.';
                }
                break;
            }

            break;
        }
      }
    }
  } catch (e) {
    logger.error(e);
    return;
  }

  return videoData;
};
