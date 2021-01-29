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
var YOUTUBE_NAME_PREFIX = 'youTubePlayback';
var YOUTUBE_IFRAME_API_URL = 'https://www.youtube.com/iframe_api';
var ENABLE_JSAPI_PARAMETER = 'enablejsapi';
var ENABLE_JSAPI_VALUE = '1';
var ORIGIN_PARAMETER = 'origin';
var YOUTUBE_IFRAME_SELECTOR = 'iframe[src*=youtube]';
var YOUTUBE_PLAYER_SETUP_STARTED_STATUS = 'started';
var YOUTUBE_PLAYER_SETUP_COMPLETED_STATUS = 'completed';

var EXTENSION_SETTINGS = turbine.getExtensionSettings();
var USE_LEGACY_SETTINGS = EXTENSION_SETTINGS.useLegacySettings || 'yes';
var WINDOW_EVENT = EXTENSION_SETTINGS.windowEvent || 'window-loaded';

/**
 * Create the registry of all YouTube player states.
 * Every registered event has a list of triggers, where one trigger corresponds to one Launch Rule.
 */
var registry = {};
// use a for loop instead of forEach for efficiency
for (var i = 0, j = YOUTUBE_EVENT_STATES.length; i < j; i++) {
  var eventState = YOUTUBE_EVENT_STATES[i];
  registry[eventState] = [];
}

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
  // remove the `t` parameter from the YouTube video URL
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

  // trigger only with those players that have been setup by this extension
  var elementIsSetup = element.dataset.launchextSetup === YOUTUBE_PLAYER_SETUP_COMPLETED_STATUS;
  if (elementIsSetup) {
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
        eventData.errorCode = nativeEvent.data;
        eventData.errorMessage = ERROR_CODES[nativeEvent.data];
        break;
    }

    var eventStateRegistry = registry[eventState];
    // use a for loop instead of forEach for efficiency
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
var playbackRateChanged = function(event) {
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
  // set a data attribute to indicate that this player has been setup
  var element = event.target.getIframe();
  element.dataset.launchextSetup = YOUTUBE_PLAYER_SETUP_COMPLETED_STATUS;

  log('info', 'Player ready', element);
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
 *
 * @param {DOMElement} element A YouTube IFrame DOM element.
 */
var setupPendingPlayer = function(element) {
  // setup only those players that have NOT been setup by this extension
  if (
    element.dataset.launchextSetup &&
    element.dataset.launchextSetup === YOUTUBE_PLAYER_SETUP_COMPLETED_STATUS
  ) {
    return;
  }

  var elementSrc = element.src;
  if (!elementSrc) {
    return;
  }

  // ensure that the IFrame has an `id` attribute
  var elementId = element.id;
  if (!elementId) {
    // set the `id` attribute to the current timestamp and a random number
    var randomNumber = Math.floor(Math.random() * 1000);
    elementId = YOUTUBE_NAME_PREFIX + '_' + new Date().valueOf() + '_' + randomNumber;
    element.id = elementId;
  }

  // ensure that the IFrame's `src` attribute contains the `enablejsapi` and `origin`
  // parameters
  var requiredParametersToAdd = [];
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
  if (requiredParametersToAdd.length > 0) {
    requiredParametersToAdd = requiredParametersToAdd.join('&');
    var separator = elementSrc.indexOf('?') < 0 ? '?' : '&';
    elementSrc = elementSrc + separator + requiredParametersToAdd;
    element.src = elementSrc;
  }

  element.addEventListener('load', function() {
    var loadedElement = this;
    var loadedElementId = loadedElement.id;

    // eslint-disable-next-line no-unused-vars
    var player = new YT.Player(loadedElementId, {
      events: {
        onApiChange: apiChanged,
        onError: playerError,
        onPlaybackQualityChange: playbackQualityChanged,
        onPlaybackRateChange: playbackRateChanged,
        onReady: playerReady,
        onStateChange: playerStateChanged
      }
    });

    // add additional properties for this player
    player.launchExt = {
    };

    // if player has not loaded properly (e.g. network failed),
    // try reloading by settings its `src` again after 2s.
    setTimeout(function() {
      if (loadedElement.dataset.launchextSetup !== YOUTUBE_PLAYER_SETUP_COMPLETED_STATUS) {
        loadedElement.src = elementSrc;
      }
    }, 2000);
  });
};

/**
 * Setup YouTube player elements to work with the YouTube IFrame API.
 * Returns with an error log if YouTube's YT object is unavailable.
 */
var setupPendingPlayers = function() {
  if (!pendingPlayersRegistryHasPlayers()) {
    return;
  }

  if (!youtubeIframeAPIIsReady()) {
    log('error', 'Unexpected error! YouTube IFrame API has not been initialised');
    return;
  }

  while (pendingPlayersRegistry.length > 0) {
    var playerElement = pendingPlayersRegistry.shift();
    setupPendingPlayer(playerElement);
  }
};

/**
 * Check if the YouTube IFrame Player API has been loaded and is ready.
 */
var youtubeIframeAPIIsReady = function() {
  return window.YT && window.YT.Player;
};

/**
 * Load the YouTube IFrame Player API script asynchronously.
 * Returns with an error log if the API script could not be loaded.
 */
var loadYoutubeIframeApi = function() {
  // if the YouTube IFrame API has NOT been loaded, then when it does finish loading,
  // the YouTube players will be setup when the API runs onYouTubeIframeAPIReady on its own
  loadScript(YOUTUBE_IFRAME_API_URL).then(function() {
    log('info', 'YouTube IFrame API was loaded successfully');
    // the YouTube players will be setup when the YouTube IFrame API script finishes loading
    // and runs onYouTubeIframeAPIReady on its own
  }, function() {
    log('error', 'YouTube IFrame API could not be loaded');
  });
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
  var iframeSelector = elementSpecificitySetting === 'specific' && elementsSelectorSetting ?
    elementsSelectorSetting :
    YOUTUBE_IFRAME_SELECTOR;
  var loadYoutubeIframeApiSetting = settings.loadYoutubeIframeApi || 'yes';

  var elements = document.querySelectorAll(iframeSelector);
  var numElements = elements.length;
  if (numElements === 0) {
    // don't continue if there are no YouTube players
    // since there's no point tracking what is not available
    log('debug', 'No YouTube players found for the selector "' + iframeSelector + '"');
    return;
  }

  // use a for loop because it is faster than Array.prototype.forEach()
  for (var i = 0; i < numElements; i++) {
    var element = elements[i];

    // set a data attribute to indicate that this player is being setup
    element.dataset.launchextSetup = YOUTUBE_PLAYER_SETUP_STARTED_STATUS;

    registerPendingPlayer(element);
  }

  if (pendingPlayersRegistryHasPlayers()) {
    if (loadYoutubeIframeApiSetting === 'yes') {
      loadYoutubeIframeApi();
      // the players will be processed when onYouTubeIframeAPIReady() runs
    } else {
      setupPendingPlayers();
    }
  }
};

/**
 * Required callback function when the YouTube IFrame API is ready.
 * If this callback function had been defined already, then run that old function before running
 * this one.
 */
window.onYouTubeIframeAPIReady = (function(oldYouTubeIframeAPIReady) {
  return function() {
    log('info', 'YouTube IFrame API is ready');

    // preserve any existing function declaration
    oldYouTubeIframeAPIReady && oldYouTubeIframeAPIReady();

    setupPendingPlayers();
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
      registerYoutubePlayers(EXTENSION_SETTINGS);
      break;
    case 'window-loaded':
      window.addEventListener('load', function() {
        registerYoutubePlayers(EXTENSION_SETTINGS);
      }, true);
      break;
  }
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
