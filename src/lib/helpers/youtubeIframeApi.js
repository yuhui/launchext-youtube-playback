/**
 * Copyright 2020-2022 Yuhui. All rights reserved.
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

var window = require('@adobe/reactor-window');
var document = require('@adobe/reactor-document');
var loadScript = require('@adobe/reactor-load-script');

var createGetYoutubeEvent = require('./createGetYoutubeEvent');
var flooredVideoTime = require('./flooredVideoTime');
var videoTimeFromFraction = require('./videoTimeFromFraction');

var logger = turbine.logger;

// constants related to Event Types used in this extension
var API_CHANGED = 'module with exposed API changed';
var PLAYBACK_QUALITY_CHANGED = 'playback quality changed';
var PLAYBACK_RATE_CHANGED = 'playback rate changed';
var PLAYER_ERROR = 'player error';
var PLAYER_READY = 'player ready';
var PLAYER_REMOVED = 'player removed'; // Extension-specific event
var PLAYER_STATE_CHANGE = 'player state change'; // fake event type
var VIDEO_BUFFERING = 'video buffering';
var VIDEO_CUED = 'video cued';
var VIDEO_ENDED = 'video ended';
var VIDEO_MILESTONE = 'video milestone'; // Extension-specific event
var VIDEO_PAUSED = 'video paused';
var VIDEO_PLAYING = 'video playing';
var VIDEO_REPLAYED = 'video replayed'; // no Extension trigger
var VIDEO_RESUMED = 'video resumed'; // no Extension trigger
var VIDEO_STARTED = 'video started'; // no Extension trigger
var VIDEO_UNSTARTED = 'video unstarted';
var ALL_EVENT_TYPES = [
  API_CHANGED,
  PLAYBACK_QUALITY_CHANGED,
  PLAYBACK_RATE_CHANGED,
  PLAYER_ERROR,
  PLAYER_READY,
  PLAYER_REMOVED,
  PLAYER_STATE_CHANGE,
  VIDEO_BUFFERING,
  VIDEO_CUED,
  VIDEO_ENDED,
  VIDEO_MILESTONE,
  VIDEO_PAUSED,
  VIDEO_PLAYING,
  VIDEO_REPLAYED,
  VIDEO_RESUMED,
  VIDEO_STARTED,
  VIDEO_UNSTARTED,
];

// set of Event Types related to video playback
var VIDEO_EVENT_TYPES = [
  VIDEO_BUFFERING,
  VIDEO_CUED,
  VIDEO_ENDED,
  VIDEO_PAUSED,
  VIDEO_PLAYING,
  VIDEO_REPLAYED,
  VIDEO_RESUMED,
  VIDEO_STARTED,
  VIDEO_UNSTARTED,
];

// set of Event Types when video had been playing but is stopped temporarily
var VIDEO_STOPPED_EVENT_TYPES = [
  VIDEO_BUFFERING,
  VIDEO_CUED,
  VIDEO_PAUSED,
];

// constants related to YouTube error codes
var ERROR_CODES = {
  2: 'Request contains an invalid parameter value (error 2)',
  5: 'Requested content cannot be played in an HTML5 player (error 5)',
  100: 'Requested video was not found (error 100)',
  101: 'Owner of the requested video does not allow it to be played in ' +
    'embedded players (error 101)',
  150: 'Owner of the requested video does not allow it to be played in ' +
    'embedded players (error 150)'
};

// lookup of YouTube playback events to Event Types
var PLAYBACK_EVENTS = {
  API_CHANGE: API_CHANGED,
  ERROR: PLAYER_ERROR,
  READY: PLAYER_READY,
  PLAYBACK_QUALITY_CHANGE: PLAYBACK_QUALITY_CHANGED,
  PLAYBACK_RATE_CHANGE: PLAYBACK_RATE_CHANGED,
  STATE_CHANGE: PLAYER_STATE_CHANGE,
};

// constants related to setting up the YouTube IFrame API
var YOUTUBE_NAME_PREFIX = 'youTubePlayback';
var YOUTUBE_IFRAME_API_URL = 'https://www.youtube.com/iframe_api';
var YOUTUBE_PLAYING_STATE = 1;
var ENABLE_JSAPI_PARAMETER = 'enablejsapi';
var ENABLE_JSAPI_VALUE = '1';
var ORIGIN_PARAMETER = 'origin';
var LAUNCHEXT_INIT_PARAMETER = 'launchextinit';
var YOUTUBE_IFRAME_SELECTOR = 'iframe[src*=youtube]';
var YOUTUBE_PLAYER_SETUP_STARTED_STATUS = 'started';
var YOUTUBE_PLAYER_SETUP_MODIFIED_STATUS = 'modified';
var YOUTUBE_PLAYER_SETUP_COMPLETED_STATUS = 'completed';
var MAXIMUM_ATTEMPTS_TO_WAIT_FOR_YOUTUBE_IFRAME_API = 5;

// constants related to video milestone tracking
var VIDEO_MILESTONE_PERCENT_UNIT = 'percent';
var VIDEO_MILESTONE_SECONDS_UNIT = 'seconds';
var VIDEO_MILESTONE_UNITS = [VIDEO_MILESTONE_PERCENT_UNIT, VIDEO_MILESTONE_SECONDS_UNIT];
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

// constants related to this Extension's settings
var EXTENSION_SETTINGS = turbine.getExtensionSettings();
var USE_LEGACY_SETTINGS = EXTENSION_SETTINGS.useLegacySettings || 'yes';
var WINDOW_EVENT = EXTENSION_SETTINGS.windowEvent || 'window-loaded';

/**
 * Registry of Event Types that have been configured in the Launch property.
 * {
 *   matchingSelector: {
 *     eventType: [
 *       {
 *         milestone: {
 *           amount: <number>,
 *           type: <string "fixed", "every">,
 *           unit: <string "percent", "seconds">,
 *         },
 *         trigger: trigger,
 *       },
 *     ],
 *   },
 * }
 */
var eventRegistry = {};

/**
 * Registry of players that have been enabled.
 * {
 *   playerId: player
 * }
 */
var playerRegistry = {};

/**
 * Get data about the current YouTube player's state.
 *
 * @param {Object} player The YouTube player object.
 *
 * @return {Object} Data about the current state of the YouTube player.
 */
var getYoutubeStateData = function(player) {
  var currentTime = player.getCurrentTime();
  var duration = player.launchExt.duration;
  var isLiveEvent = player.launchExt.isLiveEvent;
  if (isLiveEvent) {
    duration = player.getDuration();
  }

  var videoType = isLiveEvent ? 'live' : 'video-on-demand';

  var stateData = {
    player: player,
    currentTime: currentTime,
    duration: duration,
    muted: player.isMuted(),
    playbackRate: player.getPlaybackRate(),
    videoId: player.launchExt.videoId,
    videoLoadedFraction: player.getVideoLoadedFraction(),
    videoTitle: player.launchExt.videoTitle,
    videoType: videoType,
    videoUrl: player.launchExt.videoUrl,
    volume: player.getVolume(),
  };

  return stateData;
};


/**
 * Handle an Event Type.
 *
 * @param {String} eventType The Event Type that has been triggered.
 * @param {Object} player The YouTube player object.
 * @param {Object} nativeEvent The native YouTube event object.
 * @param {Object} eventTriggers Array of triggers for this Event Type, or Object of milestones.
 * @param {Object} options (optional) Any options for this Event Type, e.g. error message,
 * milestone labels, etc.
 */
var processEventType = function(eventType, player, nativeEvent, eventTriggers, options) {
  if (!eventTriggers || Object.keys(eventTriggers) === 0) {
    // don't continue if there are no triggers for this Event Type
    return;
  }

  var stateData = getYoutubeStateData(player);

  // perform additional tasks based on the Event Type
  var element = player.getIframe();
  var elementId = element.id;
  var logInfoMessage = 'Player ID ' + elementId + ': ';

  switch (eventType) {
    case API_CHANGED:
      var moduleNames = player.getOptions();
      if (moduleNames && moduleNames.length > 0) {
        stateData.moduleNames = moduleNames.join(',');
      }

      logInfoMessage += 'Module with API methods changed';
      break;
    case PLAYBACK_QUALITY_CHANGED:
      stateData.playbackQuality = nativeEvent.data;

      logInfoMessage += 'Playback quality changed';
      break;
    case PLAYBACK_RATE_CHANGED:
      logInfoMessage += 'Playback rate changed';
      break;
    case PLAYER_ERROR:
      stateData.errorCode = nativeEvent.data;
      stateData.errorMessage = ERROR_CODES[nativeEvent.data];

      logInfoMessage += 'Player error';
      break;
    case PLAYER_READY:
      logInfoMessage += 'Player ready';
      break;
    case PLAYER_REMOVED:
      stateData.playTotalTime = player.launchExt.playTotalTime;

      logInfoMessage += 'Player removed';
      break;
    case VIDEO_BUFFERING:
    case VIDEO_CUED:
    case VIDEO_ENDED:
    case VIDEO_PAUSED:
    case VIDEO_PLAYING:
    case VIDEO_REPLAYED:
    case VIDEO_RESUMED:
    case VIDEO_STARTED:
    case VIDEO_UNSTARTED:
      logInfoMessage += 'Player state changed: ' + eventType;

      /**
       * update the following:
       * 1. currentTime to be the time when the Event Type got detected
       * because some milliseconds could have passed already.
       * 2. playTotalTime -- but only with events where the video has stopped playing.
       */
      switch (eventType) {
        case VIDEO_ENDED:
          stateData.currentTime = player.launchExt.duration;
          stateData.playTotalTime = player.launchExt.playTotalTime;
          break;
        case VIDEO_PAUSED:
          stateData.playTotalTime = player.launchExt.playTotalTime;
          break;
        case VIDEO_PLAYING:
        case VIDEO_RESUMED:
          stateData.currentTime = player.launchExt.playStartTime;
          break;
        case VIDEO_REPLAYED:
        case VIDEO_STARTED:
          var isLiveEvent = player.launchExt.isLiveEvent;
          stateData.currentTime = isLiveEvent
            ? player.launchExt.videoStartTime
            : 0.0;
          if (isLiveEvent && stateData.duration < stateData.currentTime) {
            stateData.duration = stateData.currentTime;
          }
          break;
      }
      break;
    case VIDEO_MILESTONE:
      if (player.launchExt && player.launchExt.playStopTime) {
        /**
         * replace currentTime with the one from the heartbeat
         * because the playhead could have changed since the milestone event was triggered
         */
        stateData.currentTime = player.launchExt.playStopTime;
      }
      stateData.videoMilestone = options.label;
      logInfoMessage += 'Milestone reached';
      break;
  }

  stateData.currentTime = Math.floor(stateData.currentTime);
  stateData.duration = Math.floor(stateData.duration);
  if (stateData.playTotalTime) {
    stateData.playTotalTime = Math.floor(stateData.playTotalTime);
    stateData.playSegmentTime = Math.floor(
      player.launchExt.playTotalTime - player.launchExt.playPreviousTotalTime
    );
    player.launchExt.playPreviousTotalTime = stateData.playTotalTime;
  }

  logger.info(logInfoMessage);

  // handle each Rule trigger for this Event Type
  var getYoutubeEvent = createGetYoutubeEvent.bind(element);
  eventTriggers.forEach(function(trigger) {
    trigger(
      getYoutubeEvent(eventType, nativeEvent, stateData)
    );
  });
};

/**
 * Handle a YouTube playback event.
 *
 * @param {Object} playbackEventType Event Type based on the YouTube player's playback event.
 * @param {Object} player The YouTube player object.
 * @param {Object} nativeEvent The native YouTube event object.
 */
var processPlaybackEvent = function(playbackEventType, player, nativeEvent) {
  // get the Event Type for this playback event
  if (!playbackEventType) {
    return;
  }

  // don't continue if this player hasn't been setup by this extension
  var element = player.getIframe();
  var elementIsSetup = element.dataset.launchextSetup === YOUTUBE_PLAYER_SETUP_COMPLETED_STATUS;
  if (!elementIsSetup) {
    return;
  }

  var eventType = playbackEventType;
  var previousEventType = player.launchExt.previousEventType;
  var triggers = player.launchExt.triggers;
  var options = {};


  // ALWAYS start or stop the player's heartbeat based on the Event Type
  switch (eventType) {
    case VIDEO_PLAYING:
    case VIDEO_REPLAYED:
    case VIDEO_RESUMED:
    case VIDEO_STARTED:
      startHeartbeat(player, nativeEvent);
      break;
    case PLAYER_REMOVED:
    case VIDEO_BUFFERING:
    case VIDEO_PAUSED:
    case VIDEO_ENDED:
      stopHeartbeat(player);
      break;
  }

  /**
   * for video playing Event Types:
   * check that the previous Event Type is not the same as this Event Type
   */
  if (VIDEO_EVENT_TYPES.indexOf(eventType) > -1) {
    if (previousEventType && previousEventType === eventType) {
      // don't continue if this Event Type is the same as the previous one
      return;
    }
  }

  var eventTriggers = triggers[eventType];
  processEventType(eventType, player, nativeEvent, eventTriggers, options);

  /**
   * for video playing Event Types:
   * update the previous Event Type with this Event Type
   * to use with the next time a video playing event gets triggered
   */
  if (VIDEO_EVENT_TYPES.indexOf(eventType) > -1) {
    player.launchExt.previousEventType = eventType;
  }

  /**
   * update video playing states
   * IMPORTANT! this must be run AFTER the eventType has been processed
   */
  switch (eventType) {
    case VIDEO_ENDED:
      player.launchExt.hasEnded = true;
      break;
    case VIDEO_PLAYING:
    case VIDEO_REPLAYED:
    case VIDEO_RESUMED:
    case VIDEO_STARTED:
      if (player.launchExt.hasEnded) {
        /**
         * when a video is replayed, YouTube changes states in this order:
         * 1. YT.PlayerState.PLAYING (VIDEO_PLAYING)
         * 2. YT.PlayerState.BUFFERING (VIDEO_BUFFERING)
         * 3. YT.PlayerState.PLAYING (VIDEO_PLAYING)
         * so remember that a replay has occurred,
         * then the second YT.PlayerState.PLAYING will trigger the VIDEO_REPLAYED Event Type
         */
        player.launchExt.hasReplayed = true;
      } else if (player.launchExt.hasReplayed) {
        /**
         * the replay has occurred with the second YT.PlayerState.PLAYING
         * so clear the flag that remembers the replay
         */
        player.launchExt.hasReplayed = false;
      } else if (!player.launchExt.hasStarted) {
        /**
         * the video has started for the very first time
         * (player.launchExt.hasStarted is set to "true" a few lines down)
         */
        compileMilestones(player);
      }

      // if the video is playing, then it has started and hasn't ended
      player.launchExt.hasStarted = true;
      player.launchExt.hasEnded = false;

      break;
  }
};

/**
 * Change
 *
 * player.launchExt.triggers[VIDEO_MILESTONE] = [
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
 * player.launchExt.triggers[VIDEO_MILESTONE] = {
 *   "fixed" : {
 *     <string seconds> : {
 *       <string amount + unit> : [ trigger, trigger ],
 *     },
 *   },
 * }
 *
 * @param {Object} player The YouTube player object.
 */
var compileMilestones = function(player) {
  if (
    !player.launchExt
    || !player.launchExt.triggers
    || !Object.getOwnPropertyDescriptor(player.launchExt.triggers, VIDEO_MILESTONE)
  ) {
    return;
  }

  var milestoneTriggersArr = player.launchExt.triggers[VIDEO_MILESTONE];
  if (!Array.isArray(milestoneTriggersArr)) {
    delete player.launchExt.triggers[VIDEO_MILESTONE];
    return;
  }

  var duration = player.launchExt.duration;
  var isLiveEvent = player.launchExt.isLiveEvent;
  var videoStartTime = player.launchExt.videoStartTime;

  var milestoneTriggersObj = {};

  milestoneTriggersArr.forEach(function(milestoneTrigger) {
    var trigger = milestoneTrigger.trigger;
    var amount = milestoneTrigger.milestone.amount;
    var type = milestoneTrigger.milestone.type;
    var unit = milestoneTrigger.milestone.unit;

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
      seconds = videoTimeFromFraction(duration, percentage);
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

  player.launchExt.triggers[VIDEO_MILESTONE] = milestoneTriggersObj;
};

/**
 * Check if a video milestone for the specified YouTube player has been reached.
 *
 * @param {Object} player The YouTube player object.
 * @param {Object} nativeEvent The native YouTube event object.
 * @param {Number} currentTime The video's current time when checking for a milestone.
 */
var findMilestone = function(player, nativeEvent, currentTime) {
  if (
    !player.launchExt
    || !player.launchExt.triggers
    || !Object.getOwnPropertyDescriptor(player.launchExt.triggers, VIDEO_MILESTONE)
  ) {
    return;
  }

  var fixedMilestoneTriggers = player.launchExt.triggers[VIDEO_MILESTONE].fixed;
  var flooredCurrentTime = flooredVideoTime(currentTime);
  var currentMilestones = fixedMilestoneTriggers[flooredCurrentTime];
  if (!currentMilestones) {
    return;
  }

  var currentMilestonesLabels = Object.keys(currentMilestones);
  currentMilestonesLabels.forEach(function(label) {
    var triggers = currentMilestones[label];
    var options = {
      label: label,
    };

    processEventType(VIDEO_MILESTONE, player, nativeEvent, triggers, options);
  });
};

/**
 * Start beating the player's heart.
 * With every heartbeat, check if a milestone has been reached. If so, process it.
 *
 * @param {Object} player The YouTube player object.
 * @param {Object} nativeEvent The native YouTube event object.
 */
var startHeartbeat = function(player, nativeEvent) {
  if (!player || !player.launchExt) {
    return;
  }
  if (player.launchExt.heartbeatInterval.id) {
    // heart is already beating
    return;
  }

  var currentTime = player.getCurrentTime();
  player.launchExt.playStartTime = currentTime;
  player.launchExt.playStopTime = currentTime;
  player.launchExt.playTime = 0;

  player.launchExt.heartbeatInterval.id = setInterval(function() {
    if (player.getPlayerState() !== YOUTUBE_PLAYING_STATE) {
      // video is not being played
      stopHeartbeat(player);
      return;
    }

    var currentTime = player.getCurrentTime();

    /**
     * update the player's stop time using the current time
     * because if the stop time were recorded during a video pause event,
     * getCurrentTime() _at that moment_ will be wherever the playhead is
     * which can be bad if the user had skipped forward/backward!
     */
    player.launchExt.playStopTime = currentTime;

    // record how long the video has been playing since the last time it started playing
    var playStartTime = player.launchExt.playStartTime;
    var playStopTime = player.launchExt.playStopTime;
    player.launchExt.playTime = playStopTime >= playStartTime
      ? (playStopTime - playStartTime)
      : 0;

    findMilestone(player, nativeEvent, currentTime);

  }, player.launchExt.heartbeatInterval.time);
};

/**
 * Stop beating the player's heart that had been started in startHeartbeat().
 *
 * @param {Object} player The YouTube player object.
 */
var stopHeartbeat = function(player) {
  if (!player || !player.launchExt) {
    return;
  }

  clearInterval(player.launchExt.heartbeatInterval.id);
  player.launchExt.heartbeatInterval.id = null;
  player.launchExt.playTotalTime += player.launchExt.playTime;
};

/**
 * Callback function when the player has loaded (or unloaded) a module with
 * exposed API methods.
 *
 * @param {Object} event The YouTube event object.
 * @param {Object} event.target The YouTube player object.
 */
// eslint-disable-next-line no-unused-vars
var apiChanged = function(event) {
  var player = event.target;
  processPlaybackEvent(API_CHANGED, player, event);
};

/**
 * Callback function when the video playback quality changes.
 *
 * @param {Object} event The YouTube event object.
 * @param {Object} event.target The YouTube player object.
 */
// eslint-disable-next-line no-unused-vars
var playbackQualityChanged = function(event) {
  var player = event.target;
  processPlaybackEvent(PLAYBACK_QUALITY_CHANGED, player, event);
};

/**
 * Callback function when the video playback rate changes.
 *
 * @param {Object} event The YouTube event object.
 * @param {Object} event.target The YouTube player object.
 */
// eslint-disable-next-line no-unused-vars
var playbackRateChanged = function(event) {
  var player = event.target;
  processPlaybackEvent(PLAYBACK_RATE_CHANGED, player, event);
};

/**
 * Callback function when an error occurs in the player.
 *
 * @param {Object} event The YouTube event object.
 * @param {Object} event.target The YouTube player object.
 */
// eslint-disable-next-line no-unused-vars
var playerError = function(event) {
  var player = event.target;
  processPlaybackEvent(PLAYER_ERROR, player, event);
};

/**
 * Callback function when the player has finished loading and is ready to begin receiving API calls.
 *
 * @param {Object} event The YouTube event object.
 * @param {Object} event.target The YouTube player object.
 */
var playerReady = function(event) {
  // set a data attribute to indicate that this player has been setup
  var player = event.target;
  var element = player.getIframe();
  if (!element.dataset.launchextSetup) {
    // this player wasn't setup by this extension
    return;
  }
  element.dataset.launchextSetup = YOUTUBE_PLAYER_SETUP_COMPLETED_STATUS;

  // update static metadata
  player.launchExt = player.launchExt || {};

  var videoData = player.getVideoData();
  player.launchExt.videoId = videoData.video_id;
  player.launchExt.videoTitle = videoData.title;

  // create the YouTube video URL from the video ID
  player.launchExt.videoUrl = 'https://www.youtube.com/watch?v=' + videoData.video_id;

  var duration = player.getDuration();
  player.launchExt.duration = duration;

  var isLiveEvent = duration === 0;
  player.launchExt.isLiveEvent = isLiveEvent;

  processPlaybackEvent(PLAYER_READY, player, event);
};

/**
 * Callback function when the player has been removed from the DOM tree.
 * 
 * ALERT! There is no such event in the YouTube IFrame API.
 * Instead, a "remove" event listener is added to each YouTube IFrame DOM element.
 *
 * This is also why there is an additional "player" parameter. Since the "remove" event is not a
 * native YouTube event, there is no YouTube player object found at event.target. So a player needs
 * to be passed in for subsequent functions to utilise.
 *
 * @see registerYoutubePlayers()
 *
 * @param {Object} event The native browser event object.
 * @param {Object} player The YouTube player object.
 */
var playerRemoved = function(event, player) {
  processPlaybackEvent(PLAYER_REMOVED, player, event);
};

/**
 * Callback function when the player's state changes.
 *
 * @param {Object} event The native YouTube event object.
 * @param {Object} event.target The YouTube player object.
 * @param {Object} event.data The YouTube player's state.
 */
var playerStateChanged = function(event) {
  // get the actual video playing Event Type
  var playbackState = event.data;
  var eventType;
  switch (playbackState) {
    case window.YT.PlayerState.BUFFERING:
      eventType = VIDEO_BUFFERING;
      break;
    case window.YT.PlayerState.CUED:
      eventType = VIDEO_CUED;
      break;
    case window.YT.PlayerState.ENDED:
      eventType = VIDEO_ENDED;
      break;
    case window.YT.PlayerState.PAUSED:
      eventType = VIDEO_PAUSED;
      break;
    case window.YT.PlayerState.PLAYING:
      eventType = VIDEO_PLAYING;
      break;
    case window.YT.PlayerState.UNSTARTED:
      eventType = VIDEO_UNSTARTED;
      break;
  }

  var player = event.target;
  processPlaybackEvent(eventType, player, event);
};

/**
 * Create the registry of YouTube player elements that need processing.
 * When the YouTube IFrame API is ready, the players that are in here will be processed to allow
 * for video playback tracking.
 */
var pendingPlayersRegistry = [];
/**
 * Save a YouTube player element for processing later.
 *
 * @param {DOMElement} playerElement A YouTube IFrame DOM element.
 */
var registerPendingPlayer = function(playerElement) {
  pendingPlayersRegistry.push(playerElement);
};
/**
 * Determine if any YouTube player elements have been registered for setup.
 *
 * @return {boolean} true if there are elements in pendingPlayersRegistry, false otherwise.
 */
var pendingPlayersRegistryHasPlayers = function() {
  return pendingPlayersRegistry.length > 0;
};

/**
 * Setup a YouTube IFrame player to work with the YouTube IFrame API.
 * Assumes that the YouTube IFrame API has been loaded successfully already.
 *
 * @param {DOMElement} element A YouTube IFrame DOM element.
 */
var setupYoutubePlayer = function(element) {
  // merge the triggers from all matching selectors into one
  var triggers = {};
  /**
   * triggers = {
   *   <string eventType> : [ trigger, trigger ],
   *   VIDEO_MILESTONE : [
   *     {
   *       milestone: {
   *         amount: <number>,
   *         unit: <string "percent", "seconds">,
   *       },
   *       trigger: trigger,
   *     },
   *   ],
   * }
   */

  var eventRegistryMatchingSelectors = Object.keys(eventRegistry);
  eventRegistryMatchingSelectors.forEach(function(matchingSelector) {
    if (matchingSelector !== 'no selector' && !element.matches(matchingSelector)) {
      return;
    }

    var eventTypes = Object.keys(eventRegistry[matchingSelector]);
    eventTypes.forEach(function(eventType) {
      var eventTriggers = eventRegistry[matchingSelector][eventType];

      if (eventType !== VIDEO_MILESTONE) {
        /**
         * VIDEO_MILESTONE triggers will be processed later in playerReady()
         * for all other eventTypes, concatenate only their triggers into one big array
         */
        eventTriggers = eventTriggers.map(function(eventTrigger) {
          return eventTrigger.trigger;
        });
      }

      triggers[eventType] = triggers[eventType] || [];
      triggers[eventType] = triggers[eventType].concat(eventTriggers);
    });
  });

  var elementId = element.id;

  var player = new window.YT.Player(elementId, {
    events: {
      onApiChange: apiChanged,
      onError: playerError,
      onPlaybackQualityChange: playbackQualityChanged,
      onPlaybackRateChange: playbackRateChanged,
      onReady: playerReady,
      onStateChange: playerStateChanged,
    },
  });

  // add additional properties for this player
  player.launchExt = {
    duration: null,
    hasEnded: false,
    hasReplayed: false,
    hasStarted: false,
    heartbeatInterval: {
      id: null,
      time: 500, // milliseconds between heartbeats
    },
    isLiveEvent: false,
    playedMilestones: {},
    playPreviousTotalTime: 0,
    playSegmentTime: 0,
    playStartTime: null,
    playStopTime: null,
    playTime: null,
    playTotalTime: 0,
    previousEventType: null,
    triggers: triggers,
    videoId: null,
    videoStartTime: 0,
    videoTitle: null,
    videoUrl: null,
  };

  playerRegistry[elementId] = player;
};

/**
 * Check if the YouTube IFrame Player API has been loaded.
 */
var youtubeIframeApiIsLoaded = function() {
  return !!window.YT;
};

/**
 * Check if the YouTube IFrame Player API has been loaded and is ready.
 */
var youtubeIframeApiIsReady = function() {
  return youtubeIframeApiIsLoaded()
    && !!window.YT.Player
    && Object.prototype.toString.call(window.YT.Player) === '[object Function]';
};

/**
 * Setup YouTube player elements to work with the YouTube IFrame API.
 * Returns with an error log if YouTube's YT object is unavailable.
 *
 * @param {integer} attempt The number of times that this function has been called. Default: 1.
 */
var setupPendingPlayers = function(attempt) {
  if (!pendingPlayersRegistryHasPlayers()) {
    return;
  }
  if (!attempt) {
    // Yes, I know I'm overriding an argument. Wait for ES6...
    attempt = 1;
  }

  if (!youtubeIframeApiIsReady()) {
    // try again
    if (attempt > MAXIMUM_ATTEMPTS_TO_WAIT_FOR_YOUTUBE_IFRAME_API) {
      logger.error('Unexpected error! YouTube IFrame API has not been initialised');
    } else {
      var timeout = Math.pow(2, attempt - 1) * 1000;
      setTimeout(function() {
        setupPendingPlayers(attempt + 1);
      }, timeout);
    }
    return;
  }

  while (pendingPlayersRegistry.length > 0) {
    var playerElement = pendingPlayersRegistry.shift();
    setupYoutubePlayer(playerElement);
  }
};

/**
 * Load the YouTube IFrame Player API script asynchronously.
 * Returns with an error log if the API script could not be loaded.
 */
var loadYoutubeIframeApi = function() {
  if (youtubeIframeApiIsLoaded()) {
    /**
     * The YouTube IFrame API script had already been loaded elsewhere, e.g. in HTML
     * so setup the YouTube players immediately
     */
    setupPendingPlayers();
  } else {
    // Load the YouTube IFrame API script, then setup the YouTube players
    loadScript(YOUTUBE_IFRAME_API_URL).then(function() {
      logger.info('YouTube IFrame API was loaded successfully');
      setupPendingPlayers();
    }, function() {
      logger.error('YouTube IFrame API could not be loaded');
    });
  }
};

/**
 * Register YouTube IFrame players to work with the YouTube IFrame API later, then load the API
 * script itself.
 * Returns with a debug log if no players are found with the specified selector.
 *
 * @param {Object} settings The (configuration or action) settings object.
 */
var registerYoutubePlayers = function(settings) {
  var elementSpecificitySetting = settings.elementSpecificity || 'any';
  var elementsSelectorSetting = settings.elementsSelector || '';
  var iframeSelector = elementSpecificitySetting === 'specific' && elementsSelectorSetting
    ? elementsSelectorSetting
    : YOUTUBE_IFRAME_SELECTOR;
  var loadYoutubeIframeApiSetting = settings.loadYoutubeIframeApi || 'yes';

  var elements = document.querySelectorAll(iframeSelector);
  var numElements = elements.length;
  if (numElements === 0) {
    /**
     * don't continue if there are no YouTube players
     * since there's no point tracking what is not available
     */
    logger.debug('No YouTube players found for the selector "' + iframeSelector + '"');
    return;
  }

  elements.forEach(function(element, i) {
    // setup only those players that have NOT been setup by this extension
    switch (element.dataset.launchextSetup) {
      case YOUTUBE_PLAYER_SETUP_COMPLETED_STATUS:
        break;
      case YOUTUBE_PLAYER_SETUP_MODIFIED_STATUS:
        registerPendingPlayer(element);
        break;
      default: {
        // set a data attribute to indicate that this player is being setup
        element.dataset.launchextSetup = YOUTUBE_PLAYER_SETUP_STARTED_STATUS;

        // ensure that the IFrame has an `id` attribute
        var elementId = element.id;
        if (!elementId) {
          // set the `id` attribute to the current timestamp and index
          elementId = YOUTUBE_NAME_PREFIX + '_' + new Date().valueOf() + '_' + i;
          element.id = elementId;
        }

        var elementSrc = element.src;

        /**
         * ensure that the IFrame's `src` attribute contains the `enablejsapi` and `origin`
         * parameters, and also our own `usewithlaunchext` parameter.
         */
        var requiredParametersToAdd = [
          LAUNCHEXT_INIT_PARAMETER + '=' + (new Date().getTime()),
        ];
        if (elementSrc.indexOf(ENABLE_JSAPI_PARAMETER) < 0) {
          // `enablejsapi` is absent in the IFrame's src URL, add it
          requiredParametersToAdd.push(
            ENABLE_JSAPI_PARAMETER + '=' + ENABLE_JSAPI_VALUE
          );
        }
        if (elementSrc.indexOf(ORIGIN_PARAMETER) < 0) {
          // `origin` is absent in the IFrame's src URL, add it
          var originProtocol = document.location.protocol;
          var originHostname = document.location.hostname;
          var originPort = document.location.port;
          var originValue = originProtocol + '//' + originHostname;
          if (originPort) {
            originValue += ':' + originPort;
          }
          requiredParametersToAdd.push(ORIGIN_PARAMETER + '=' + originValue);
        }
        requiredParametersToAdd = requiredParametersToAdd.join('&');
        var separator = elementSrc.indexOf('?') < 0 ? '?' : '&';
        element.src = elementSrc + separator + requiredParametersToAdd;

        /**
         * add a custom "remove" event listener
         * this will cause the Extension-specific PLAYER_REMOVED event type to be sent
         */
        element.addEventListener('remove', function(event) {
          var removedElement = event.target;
          var player = playerRegistry[removedElement.id];
          playerRemoved(event, player);
        });

        // observe changes to this element via its parentNode
        observer.observe(element.parentNode, {childList: true});

        element.dataset.launchextSetup = YOUTUBE_PLAYER_SETUP_MODIFIED_STATUS;
        registerPendingPlayer(element);

        break;
      }
    }
  });

  if (pendingPlayersRegistryHasPlayers()) {
    if (loadYoutubeIframeApiSetting === 'yes') {
      loadYoutubeIframeApi();
      // the players will be processed when the YT object is ready
    } else if (youtubeIframeApiIsLoaded()) {
      setupPendingPlayers();
    } else {
      logger.debug(
        'Need YouTube IFrame API to become ready before setting up players'
      );
    }
  }
};

if (USE_LEGACY_SETTINGS === 'yes') {
  logger.deprecation(
    // eslint-disable-next-line max-len
    'ALERT! YouTube video playback tracking has been setup with legacy settings. Replace the settings in the extension configuration with the Rule action, "Enable video playback tracking".'
  );

  switch (WINDOW_EVENT) {
    case 'immediately':
      registerYoutubePlayers(EXTENSION_SETTINGS);
      break;
    case 'window-loaded':
      window.addEventListener('load', function() {
        registerYoutubePlayers(EXTENSION_SETTINGS);
      }, true);
      break;
  }
}

/**
 * Detect when YouTube players have been unloaded
 * - Observe changes to the DOM tree for removed players
 */
var observer = new MutationObserver(function(mutationsList) {
  mutationsList.forEach(function(mutation) {
    /**
     * check for removedNodes only
     * ignore other mutations
     */
    mutation.removedNodes.forEach(function(removedNode) {
      var removedIframeNode = removedNode.nodeName.toLowerCase() === 'iframe';
      var removedPlayer = removedNode.id in playerRegistry;
      if (removedIframeNode && removedPlayer) {
        var removeEvent = new Event('remove');

        /**
         * the next line calls the event listener that was added to the element (removedNode) in
         * registerYoutubePlayers().
         */
        removedNode.dispatchEvent(removeEvent);

        delete playerRegistry[removedNode.id];
        observer.disconnect();
      }
    });
  });
});

/**
 * Detect when YouTube players have been unloaded:
 * - Listen for window unloaded event
 */
window.addEventListener('beforeunload', function(event) {
  var playerIds = Object.keys(playerRegistry);
  playerIds.forEach(function(playerId) {
    var player = playerRegistry[playerId];
    playerRemoved(event, player);
  });
});

module.exports = {
  /**
   * Event Types (exposed from constants)
   */
  apiChanged: API_CHANGED,
  playbackQualityChanged: PLAYBACK_QUALITY_CHANGED,
  playbackRateChanged: PLAYBACK_RATE_CHANGED,
  playerError: PLAYER_ERROR,
  playerReady: PLAYER_READY,
  playerRemoved: PLAYER_REMOVED,
  videoBuffering: VIDEO_BUFFERING,
  videoCued: VIDEO_CUED,
  videoEnded: VIDEO_ENDED,
  videoMilestone: VIDEO_MILESTONE,
  videoPaused: VIDEO_PAUSED,
  videoPlaying: VIDEO_PLAYING,
  videoUnstarted: VIDEO_UNSTARTED,

  /**
   * Load the YouTube IFrame API script based on the user's settings.
   *
   * @param {Object} settings The (configuration or action) settings object.
   */
  loadYoutubeIframeApiScript: function(settings) {
    loadYoutubeIframeApi(settings); // `settings` argument is actually not needed
  },

  /**
   * Enable YouTube video playback tracking based on the user's settings.
   *
   * @param {Object} settings The (configuration or action) settings object.
   */
  enableVideoPlaybackTracking: function(settings) {
    registerYoutubePlayers(settings);
  },

  /**
   * Register the Event Types for triggering from Rules.
   *
   * @param {String} eventType The Event Type that triggered the Rule.
   * @param {Object} settings The event settings object.
   * @param {ruleTrigger} trigger The trigger callback.
   */
  registerEventTrigger: function(eventType, settings, trigger) {
    if (ALL_EVENT_TYPES.indexOf(eventType) === -1) {
      return;
    }

    var matchingSelector = 'no selector';
    if (settings.matchingSelector) {
      matchingSelector = settings.matchingSelector;
    }

    eventRegistry[matchingSelector] = eventRegistry[matchingSelector] || {};

    // usually, there will only be one eventType when this function is called
    // but with VIDEO_PLAYING, there can be more than one eventTypes
    // so use an array to store the eventType(s)
    var eventTypes = [];
    if (eventType === VIDEO_PLAYING) {
      // change eventType to match the user-selected play event type
      if (settings.trackStarted === 'yes') {
        eventTypes.push(VIDEO_STARTED);
      }
      if (settings.trackReplayed === 'yes') {
        eventTypes.push(VIDEO_REPLAYED);
      }
      if (settings.trackResumed === 'yes') {
        eventTypes.push(VIDEO_RESUMED);
      }
      if (settings.doNotTrack !== 'yes') {
        eventTypes.push(VIDEO_PLAYING);
      }
    } else {
      eventTypes = [eventType];
    }

    eventTypes.forEach(function(eventType) {
      eventRegistry[matchingSelector][eventType] = (
        eventRegistry[matchingSelector][eventType] || []
      );
    });

    var eventTrigger = {
      trigger: trigger,
    };
    if (eventType === VIDEO_MILESTONE) {
      if (settings.fixedMilestoneAmounts && settings.fixedMilestoneUnit) {
        var milestoneUnit = settings.fixedMilestoneUnit;
        var milestoneAmounts = settings.fixedMilestoneAmounts;

        var isValidMilestoneUnit = VIDEO_MILESTONE_UNITS.indexOf(milestoneUnit) > -1;
        var isArrayMilestoneAmounts = Array.isArray(milestoneAmounts);

        if (isValidMilestoneUnit && isArrayMilestoneAmounts) {
          var milestoneTriggers = milestoneAmounts.map(function(milestoneAmount) {
            var amount = parseInt(milestoneAmount, 10);
            if (Number.isNaN(amount)) {
              return;
            }

            var milestone = {
              amount: amount,
              type: 'fixed',
              unit: milestoneUnit,
            };
            return Object.assign({ milestone: milestone }, eventTrigger);
          }).filter(function(milestoneTrigger) {
            return !!milestoneTrigger;
          });

          if (milestoneTriggers.length > 0) {
            eventRegistry[matchingSelector][eventType] = (
              eventRegistry[matchingSelector][eventType].concat(milestoneTriggers)
            );
          }
        }
      }
    } else {
      eventTypes.forEach(function(eventType) {
        eventRegistry[matchingSelector][eventType].push(eventTrigger);
      });
    }
  },
};
