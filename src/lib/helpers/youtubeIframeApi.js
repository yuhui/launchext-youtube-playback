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

var window = require('@adobe/reactor-window');
var document = require('@adobe/reactor-document');
var loadScript = require('@adobe/reactor-load-script');

var log = require('./log');

// constants related to YouTube event states
var API_CHANGED = 'module with exposed API changed';
var PLAYBACK_QUALITY_CHANGED = 'playback quality changed';
var PLAYBACK_RATE_CHANGED = 'playback rate changed';
var PLAYER_ERROR = 'player error';
var PLAYER_READY = 'player ready';
var VIDEO_BUFFERING = 'video buffering';
var VIDEO_CUED = 'video cued';
var VIDEO_ENDED = 'video ended';
var VIDEO_PAUSED = 'video paused';
var VIDEO_PLAYING = 'video playing';
var VIDEO_UNSTARTED = 'video unstarted';

var YOUTUBE_EVENT_STATES = [
  API_CHANGED,
  PLAYBACK_QUALITY_CHANGED,
  PLAYBACK_RATE_CHANGED,
  PLAYER_ERROR,
  PLAYER_READY,
  VIDEO_BUFFERING,
  VIDEO_CUED,
  VIDEO_ENDED,
  VIDEO_PAUSED,
  VIDEO_PLAYING,
  VIDEO_UNSTARTED
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

// constants related to setting up the YouTube IFrame API
var YOUTUBE_IFRAME_API_URL = 'https://www.youtube.com/iframe_api';
var ENABLE_JSAPI_PARAMETER = 'enablejsapi';
var ENABLE_JSAPI_VALUE = '1';
var ORIGIN_PARAMETER = 'origin';
var YOUTUBE_IFRAME_SELECTOR = 'iframe[src*=youtube]';

var EXTENSION_SETTINGS = turbine.getExtensionSettings();
var USE_LEGACY_SETTINGS = EXTENSION_SETTINGS.useLegacySettings || 'no';
var WINDOW_EVENT = EXTENSION_SETTINGS.windowEvent || 'window-loaded';

/**
 * Create the registry of all YouTube player states.
 * Every registered event has a list of triggers, where one trigger corresponds to one Launch Rule.
 */
var registry = {};
YOUTUBE_EVENT_STATES.forEach(function(eventState) {
  registry[eventState] = [];
});

/**
 * Synthetic YouTube playback event to send to the trigger callback.
 * Should be bound to the YouTube IFrame DOM element.
 *
 * @param {DOMElement} element The YouTube IFrame DOM element.
 * @param {string} eventState The YouTube player event's state.
 * @param {Object} nativeEvent The native YouTube event object.
 * @param {Object} eventData Additional YouTube event detail.
 * See `getYoutubeEventData()`.
 *
 * @return {Event} Event object that is specific to the YouTube player's state.
 */
var createGetYoutubeEvent = function(element, eventState, nativeEvent, eventData) {
  return {
    element: element,
    target: element,
    nativeEvent: nativeEvent,
    state: eventState,
    youtube: eventData
  };
};

/**
 * Get playback data for the current moment.
 *
 * @param {Object} player The YouTube player object.
 *
 * @return {Object} Data about the current playback in the YouTube player.
 */
var getYoutubeEventData = function(player) {
  // remove the "t" parameter from the YouTube video URL
  var videoUrl = player.getVideoUrl().replace(/&?t=[0-9]+&?/, '');

  var eventData = {
    player: player,
    currentTime: player.getCurrentTime(),
    duration: player.getDuration(),
    muted: player.isMuted(),
    playbackRate: player.getPlaybackRate(),
    videoLoadedFraction: player.getVideoLoadedFraction(),
    videoUrl: videoUrl,
    volume: player.getVolume()
  };

  return eventData;
};

/**
 * Run a trigger that had been registered with the specified YouTube player state.
 *
 * @param {DOMElement} element The YouTube IFrame DOM element.
 * @param {string} eventState The YouTube player event's state.
 * @param {Object} nativeEvent The native YouTube event object.
 * @param {Object} eventData Metadata from the YouTube player.
 * @param {Object} triggerData Data that had been set with the Launch Rule.
 * See module.exports below.
 * @param {Object} triggerData.settings Settings from the Launch Rule.
 * @param {Object} triggerData.trigger The Launch Rule's trigger function.
 */
var processTrigger = function(element, eventState, nativeEvent, eventData, triggerData) {
  // `settings` is not needed
  // var settings = triggerData.settings;
  var trigger = triggerData.trigger;

  var getYoutubeEvent = createGetYoutubeEvent.bind(element);

  trigger(getYoutubeEvent(
    element,
    eventState,
    nativeEvent,
    eventData
  ));
};

/**
 * When a YouTube player's state changes, run all triggers registered with that state.
 *
 * @param {string} eventState The YouTube player event's state.
 * @param {Object} nativeEvent The native YouTube event object.
 */
var processTriggers = function(eventState, nativeEvent) {
  var player = nativeEvent.target;
  var element = player.getIframe();

  // trigger only with those players that had been initialised by this extension
  //var elementIsInitialised = element.dataset.launchextInitialised === 'true';

  // trigger only with those players that have been setup by this extension
  var elementIsSetup = element.dataset.launchextSetup === 'true';

  if (/*elementIsInitialised && */ elementIsSetup) {
    var eventData = getYoutubeEventData(player);

    // add additional information based on the event's state
    switch (eventState) {
      case API_CHANGED:
        var moduleNames = player.getOptions();
        if (moduleNames && moduleNames.length > 0) {
          eventData.moduleNames = moduleNames.join(',');
        }
        break;
      case PLAYBACK_QUALITY_CHANGED:
        eventData.playbackQuality = nativeEvent.data;
        break;
      case PLAYER_ERROR:
        eventData.errorMessage = ERROR_CODES[nativeEvent.data];
        break;
    }

    // use a for loop instead of forEach for efficiency
    var eventStateRegistry = registry[eventState];
    /*
    log('debug', eventState + ', has ' + eventStateRegistry.length + ' triggers', element);
    */

    for (var i = 0, j = eventStateRegistry.length; i < j; i++) {
      var triggerData = eventStateRegistry[i];
      processTrigger(
        element,
        eventState,
        nativeEvent,
        eventData,
        triggerData
      );
    }
  }
};

/**
 * Callback function when the player has loaded (or unloaded) a module with
 * exposed API methods.
 */
var apiChanged = function(event) {
  log('info', 'Module with API methods changed', event.target.getIframe());
  processTriggers(API_CHANGED, event);
};

/**
 * Callback function when the video playback quality changes.
 */
var playbackQualityChanged = function(event) {
  log('info', 'Playback quality changed', event.target.getIframe());
  processTriggers(PLAYBACK_QUALITY_CHANGED, event);
};

/**
 * Callback function when the video playback rate changes.
 */
var onPlaybackRateChanged = function(event) {
  log('info', 'Playback rate changed', event.target.getIframe());
  processTriggers(PLAYBACK_RATE_CHANGED, event);
};

/**
 * Callback function when an error occurs in the player.
 */
var playerError = function(event) {
  log('info', 'Player error', event.target.getIframe());
  processTriggers(PLAYER_ERROR, event);
};

/**
 * Callback function when the player has finished loading and is ready to begin receiving API calls.
 */
var playerReady = function(event) {
  log('info', 'Player ready', event.target.getIframe());
  processTriggers(PLAYER_READY, event);
};

/**
 * Callback function when the player's state changes.
 *
 * Unlike the other callback functions, this function is special in that each playback event state
 * is its own triggering Event.
 *
 * This has been designed like this because these playback events are used the most often in this
 * extension, so it makes sense to expose them at the top-level.
 */
var playerStateChanged = function(event) {
  var state;

  switch (event.data) {
    case YT.PlayerState.BUFFERING:
      state = VIDEO_BUFFERING;
      break;
    case YT.PlayerState.CUED:
      state = VIDEO_CUED;
      break;
    case YT.PlayerState.ENDED:
      state = VIDEO_ENDED;
      break;
    case YT.PlayerState.PAUSED:
      state = VIDEO_PAUSED;
      break;
    case YT.PlayerState.PLAYING:
      state = VIDEO_PLAYING;
      break;
    case YT.PlayerState.UNSTARTED:
      state = VIDEO_UNSTARTED;
      break;
  }

  if (state) {
    log('info', 'Player state changed: ' + state, event.target.getIframe());
    processTriggers(state, event);
  }
};

/**
 * Setup YouTube IFrame API.
 *
 * @param {Object} settings The (configuration or action) settings object.
 */
var setupYoutubePlayers = function(settings) {
  var elementSpecificity = settings.elementSpecificity || 'any';
  var elementsSelector = settings.elementsSelector || '';
  var youtubeIframeSelector = elementSpecificity === 'specific' && elementsSelector ?
    elementsSelector :
    YOUTUBE_IFRAME_SELECTOR;

  var elements = document.querySelectorAll(youtubeIframeSelector);
  if (elements.length === 0) {
    // don't continue if there are no YouTube players
    // since there's no point tracking what is not available
    log('info', 'No YouTube players found for the selector "' + youtubeIframeSelector + '"');
    return;
  }

  if (!window.YT || !window.YT.Player) {
    log('error', 'Unexpected error! YouTube IFrame API has not been initialised');
    return;
  }

  log('debug', 'Setting up YouTube players with the selector "' + youtubeIframeSelector + '"');
  [].forEach.call(elements, function(element) {
    // setup only those players that have NOT been setup by this extension
    var elementIsNotSetup = element.dataset.launchextSetup !== 'true';

    if (elementIsNotSetup) {
      // ensure that the IFrame's "src" attribute contains the "enablejsapi" and "origin"
      // parameters
      var elementSrc = element.src;
      var requiredParametersToAdd = [];
      if (elementSrc.indexOf(ENABLE_JSAPI_PARAMETER) < 0) {
        // "enablejsapi" is absent in the IFrame's src URL, add it
        requiredParametersToAdd.push(
          ENABLE_JSAPI_PARAMETER + '=' + ENABLE_JSAPI_VALUE
        );
      }
      if (elementSrc.indexOf(ORIGIN_PARAMETER) < 0) {
        // "origin" is absent in the IFrame's src URL, add it
        var originProtocol = document.location.protocol;
        var originHostname = document.location.hostname;
        var originValue = originProtocol + '//' + originHostname;
        requiredParametersToAdd.push(ORIGIN_PARAMETER + '=' + originValue);
      }
      if (requiredParametersToAdd.length > 0) {
        requiredParametersToAdd = requiredParametersToAdd.join('&');
        var separator = elementSrc.indexOf('?') < 0 ? '?' : '&';
        element.src = elementSrc + separator + requiredParametersToAdd;
      }

      // eslint-disable-next-line no-unused-vars
      var player = new YT.Player(element, {
        events: {
          onApiChange: apiChanged,
          onError: playerError,
          onPlaybackQualityChange: playbackQualityChanged,
          onPlaybackRateChange: onPlaybackRateChanged,
          onReady: playerReady,
          onStateChange: playerStateChanged
        }
      });

      // finally, set a data attribute to indicate that this player's events
      // have been setup
      element.dataset.launchextSetup = 'true';
    }
  });
};

/**
 * Create the registry of the extension's configuration or action settings.
 * When the YouTube IFrame API is ready, the settings that are in here will be processed to allow
 * for video playback tracking.
 */
var settingsRegistry = [];
var registerSettings = function(settings) {
  settingsRegistry.push(settings);
};
var runRegisteredSettings = function() {
  while (settingsRegistry.length > 0) {
    var settings = settingsRegistry.shift();
    setupYoutubePlayers(settings);
  }
};

/**
 * Load the YouTube IFrame Player API code asynchronously.
 */
var loadYoutubeIframeAPI = function() {
  var youtubeScriptElement = document.querySelector('script[src="' + YOUTUBE_IFRAME_API_URL + '"]');
  if (youtubeScriptElement && window.YT) {
    // YouTube IFrame API script has already been included
    if (window.YT.Player) {
      // the YouTube IFrame API has finished loading
      // so the YouTube players can be setup immediately
      log('debug', 'YouTube IFrame API has already been loaded');
      runRegisteredSettings();
    }
    // the YouTube IFrame API is most likely still being loaded
    // when it finishes, the YouTube players will be setup when the script runs
    // onYouTubeIframeAPIReady on its own
  } else {
    loadScript(YOUTUBE_IFRAME_API_URL).then(function() {
      log('info', 'YouTube IFrame API was loaded successfully');
      // the YouTube players will be setup when the YouTube IFrame API script finishes loading
      // and runs onYouTubeIframeAPIReady on its own
    }, function() {
      log('error', 'YouTube IFrame API could not be loaded');
    });
  }
};

/**
 * Required callback function when the YouTube IFrame API is ready.
 */
window.onYouTubeIframeAPIReady = (function(oldYouTubeIframeAPIReady) {
  return function() {
    log('info', 'YouTube IFrame API is ready');

    // preserve any existing function declaration
    oldYouTubeIframeAPIReady && oldYouTubeIframeAPIReady();

    runRegisteredSettings();
  };
})(window.onYouTubeIframeAPIReady);

if (USE_LEGACY_SETTINGS === 'yes') {
  log(
    'warn',
    'ALERT! Setting up YouTube video playback tracking with legacy settings. ' +
    'Replace the settings in the extension configuration with the Rule action, "Enable video ' +
    'playback tracking"'
  );

  switch (WINDOW_EVENT) {
    case 'immediately':
      registerSettings(EXTENSION_SETTINGS);
      break;
    case 'window-loaded':
      window.addEventListener('load', function() {
        setupYoutubePlayers(EXTENSION_SETTINGS);
      }, true);
      break;
  }

  // legacy settings require YouTube IFrame API to be enabled immediately or at window loaded
  // so ensure that the YouTube IFrame API is loaded
  loadYoutubeIframeAPI();
}

module.exports = {
  /**
   * YouTube event states (exposed from constants)
   */
  apiChanged: API_CHANGED,
  playbackQualityChanged: PLAYBACK_QUALITY_CHANGED,
  playbackRateChanged: PLAYBACK_RATE_CHANGED,
  playerError: PLAYER_ERROR,
  playerReady: PLAYER_READY,
  videoBuffering: VIDEO_BUFFERING,
  videoCued: VIDEO_CUED,
  videoEnded: VIDEO_ENDED,
  videoPaused: VIDEO_PAUSED,
  videoPlaying: VIDEO_PLAYING,
  videoUnstarted: VIDEO_UNSTARTED,

  /**
   * Enable YouTube IFrame API based on the user's settings.
   *
   * @param {Object} settings The (configuration or action) settings object.
   */
  enableYoutubeIframeAPI: function(settings) {
    registerSettings(settings);
    loadYoutubeIframeAPI();
  },

  /**
   * Register the YouTube playback events for triggering in rules.
   *
   * @param {string} youtubeEventState The YouTube player event's state.
   * @param {Object} settings The event settings object.
   * @param {ruleTrigger} trigger The trigger callback.
   */
  registerEventStateTrigger: function(youtubeEventState, settings, trigger) {
    registry[youtubeEventState].push({
      settings: settings,
      trigger: trigger
    });
  },
};
