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

var log = require('../../helpers/log');

var EXTENSION_NAME = 'launchextYoutubePlayback';

// constants related to YouTube event names
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
var DEFAULT_YOUTUBE_PLAYER_ID_PREFIX = EXTENSION_NAME + '_';
var ENABLE_JSAPI_PARAMETER = 'enablejsapi=';
var ENABLE_JSAPI_VALUE = '1';
var ORIGIN_PARAMETER = 'origin=';
var YOUTUBE_IFRAME_API_URL = 'https://www.youtube.com/iframe_api';
var YOUTUBE_IFRAME_SELECTOR = 'iframe[src*=youtube]';

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
 * @return {Event} Event object that is specific to the YouTube player's
 * state.
 */
var createGetYoutubeEvent = function(
  element,
  eventState,
  nativeEvent,
  eventData
) {
  return {
    element: element,
    target: element,
    nativeEvent: nativeEvent,
    state: eventState,
    youtube: eventData
  };
};

/**
 * Create the registry of all YouTube player states.
 * Every registered event has a list of triggers, where one trigger
 * corresponds to one Launch Rule.
 */
var registry = {};
YOUTUBE_EVENT_STATES.forEach(function(eventState) {
  registry[eventState] = [];
});

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
 * Run a trigger that had been registered with the specified YouTube player
 * state.
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
var processTrigger = function(
  element,
  eventState,
  nativeEvent,
  eventData,
  triggerData
) {
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
 * When a YouTube player's state changes, run all triggers registered with
 * that state.
 *
 * @param {string} eventState The YouTube player event's state.
 * @param {Object} nativeEvent The native YouTube event object.
 */
var processTriggers = function(eventState, nativeEvent) {
  var player = nativeEvent.target;
  var element = player.getIframe();

  // trigger only with those players that had been initialised by this
  // extension
  var elementIsInitialised = element.dataset.launchextInitialised === 'true';

  // trigger only with those players that have been setup by this extension
  var elementIsSetup = element.dataset.launchextSetup === 'true';

  if (elementIsInitialised && elementIsSetup) {
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
    log(
      'log',
      eventState + ', has ' + eventStateRegistry.length + ' triggers',
      element
    );

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
 * Setup the YouTube IFrame API here!
 */

/**
  * Ensure that every YouTube IFrame has an "id" attribute and its "src"
  * attribute contains the "enablejsapi" and "origin" parameters.
  *
  * If a selector has been specified, then use that to select the YouTube
  * IFrame elements. Otherwise, select all YouTube IFrame elements.
  */
var extensionSettings = turbine.getExtensionSettings();
var elementSpecificity = extensionSettings.elementSpecificity || 'any';
var elementsSelector = extensionSettings.elementsSelector || '';

var iframeSelector = YOUTUBE_IFRAME_SELECTOR;
if (elementSpecificity === 'specific' && elementsSelector) {
  iframeSelector = elementsSelector;
}

var elements = document.querySelectorAll(iframeSelector);
elements.forEach(function(element, i) {
  var attributeNames = element.getAttributeNames();

  // ensure that the IFrame has an "id" attribute
  if (attributeNames.indexOf('id') < 0) {
    // add an "id" attribute
    element.setAttribute('id', DEFAULT_YOUTUBE_PLAYER_ID_PREFIX + i);
  }

  // ensure that the IFrame's "src" attribute contains the "enablejsapi"
  // and "origin" parameters
  var src = element.src;
  var requiredParametersToAdd = [];
  if (src.indexOf(ENABLE_JSAPI_PARAMETER) < 0) {
    // "enablejsapi" is absent in the IFrame's src URL, add it
    requiredParametersToAdd.push(ENABLE_JSAPI_PARAMETER + ENABLE_JSAPI_VALUE);
  }
  if (src.indexOf(ORIGIN_PARAMETER) < 0) {
    // "origin" is absent in the IFrame's src URL, add it
    var originProtocol = document.location.protocol;
    var originHostname = document.location.hostname;
    var originValue = originProtocol + '//' + originHostname;
    requiredParametersToAdd.push(ORIGIN_PARAMETER + originValue);
  }
  if (requiredParametersToAdd.length > 0) {
    requiredParametersToAdd = requiredParametersToAdd.join('&');
    var separator = src.indexOf('?') < 0 ? '?' : '&';
    element.src = src + separator + requiredParametersToAdd;
  }

  // finally, set a data attribute to indicate that this player has been
  // initialised
  element.dataset.launchextInitialised = 'true';
});

/**
 * Load the YouTube IFrame Player API code asynchronously.
 */
loadScript(YOUTUBE_IFRAME_API_URL).then(function() {
  log('log', 'YouTube IFrame API was successfully loaded');
}, function() {
  log('error', 'YouTube IFrame API could not be loaded');
});

/**
* Callback function when the YouTube IFrame API is ready.
*/
window.onYouTubeIframeAPIReady = function() {
  log('log', 'YouTube IFrame API is ready');

  /**
   * Loop through the YouTube IFrame elements to set them up to receive
   * playback events.
   */
  var elements = document.querySelectorAll(YOUTUBE_IFRAME_SELECTOR);
  elements.forEach(function(element) {
    // setup only those players that had been initialised by this extension
    var elementIsInitialised = element.dataset.launchextInitialised === 'true';

    // setup only those players that have NOT been setup by this extension
    var elementIsNotSetup = element.dataset.launchextSetup !== 'true';

    if (elementIsInitialised && elementIsNotSetup) {
      var elementId = element.id;
      // eslint-disable-next-line no-unused-vars
      var player = new YT.Player(elementId, {
        events: {
          onApiChange: window.onApiChange,
          onError: window.onPlayerError,
          onPlaybackQualityChange: window.onPlaybackQualityChange,
          onPlaybackRateChange: window.onPlaybackRateChange,
          onReady: window.onPlayerReady,
          onStateChange: window.onPlayerStateChange
        }
      });

      // finally, set a data attribute to indicate that this player's events
      // have been setup
      element.dataset.launchextSetup = 'true';
    }
  });
};

/**
 * Callback function when the player has loaded (or unloaded) a module with
 * exposed API methods.
 */
window.onApiChange = function(event) {
  //log('log', 'Module with API methods changed', event.target.getIframe());
  processTriggers(API_CHANGED, event);
};

/**
 * Callback function when the video playback quality changes.
 */
window.onPlaybackQualityChange = function(event) {
  //log('log', 'Playback quality changed', event.target.getIframe());
  processTriggers(PLAYBACK_QUALITY_CHANGED, event);
};

/**
 * Callback function when the video playback rate changes.
 */
window.onPlaybackRateChange = function(event) {
  //log('log', 'Playback rate changed', event.target.getIframe());
  processTriggers(PLAYBACK_RATE_CHANGED, event);
};

/**
 * Callback function when an error occurs in the player.
 */
window.onPlayerError = function(event) {
  //log('log', 'Player error', event.target.getIframe());
  processTriggers(PLAYER_ERROR, event);
};

/**
 * Callback function when the player has finished loading and is ready to
 * begin receiving API calls.
 */
window.onPlayerReady = function(event) {
  //log('log', 'Player ready', event.target.getIframe());
  processTriggers(PLAYER_READY, event);
};

/**
 * Callback function when the player's state changes.
 *
 * Unlike the other callback functions, this function is special in that each
 * playback event state is its own triggering Event.
 *
 * This has been designed like this because these playback events are used the
 * most often in this extension, so it makes sense to expose them at the top-
 * level.
 */
window.onPlayerStateChange = function(event) {
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
    //log('log', 'Player state changed: ' + state, event.target.getIframe());
    processTriggers(state, event);
  }
};

module.exports = {
  registerApiChangedTrigger: function(settings, trigger) {
    registry[API_CHANGED].push({
      settings: settings,
      trigger: trigger
    });
  },
  registerPlaybackRateChangedTrigger: function(settings, trigger) {
    registry[PLAYBACK_RATE_CHANGED].push({
      settings: settings,
      trigger: trigger
    });
  },
  registerPlaybackQualityChangedTrigger: function(settings, trigger) {
    registry[PLAYBACK_QUALITY_CHANGED].push({
      settings: settings,
      trigger: trigger
    });
  },
  registerErrorTrigger: function(settings, trigger) {
    registry[PLAYER_ERROR].push({
      settings: settings,
      trigger: trigger
    });
  },
  registerReadyTrigger: function(settings, trigger) {
    registry[PLAYER_READY].push({
      settings: settings,
      trigger: trigger
    });
  },
  registerVideoBufferingTrigger: function(settings, trigger) {
    registry[VIDEO_BUFFERING].push({
      settings: settings,
      trigger: trigger
    });
  },
  registerVideoCuedTrigger: function(settings, trigger) {
    registry[VIDEO_CUED].push({
      settings: settings,
      trigger: trigger
    });
  },
  registerVideoEndedTrigger: function(settings, trigger) {
    registry[VIDEO_ENDED].push({
      settings: settings,
      trigger: trigger
    });
  },
  registerVideoPausedTrigger: function(settings, trigger) {
    registry[VIDEO_PAUSED].push({
      settings: settings,
      trigger: trigger
    });
  },
  registerVideoPlayingTrigger: function(settings, trigger) {
    registry[VIDEO_PLAYING].push({
      settings: settings,
      trigger: trigger
    });
  },
  registerVideoUnstartedTrigger: function(settings, trigger) {
    registry[VIDEO_UNSTARTED].push({
      settings: settings,
      trigger: trigger
    });
  }
};
