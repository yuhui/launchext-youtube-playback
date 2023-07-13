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

var IFRAME_ID_PREFIX = 'youTubePlayback';

var PLAYER_SETUP_STARTED_STATUS = 'started';
var PLAYER_SETUP_MODIFIED_STATUS = 'modified';

/**
 * Registers a player element to work with the video API later.
 *
 * @param {DOMElement} element Player element to register.
 * @param {Number} index Index of the player element in the DOM.
 * @param {Object} parametersToAdd (optional) List of parameters to add to the video URL.
 *
 * @return {DOMElement} Player element that has been registered successfully.
 *
 * @throws Will throw an error if element is not an IFRAME DOM element.
 * @throws Will throw an error if element.src does not contain "youtube".
 * @throws Will throw an error if index is not a number.
 * @throws Will throw an error if parametersToAdd is specified but is not an object.
 */
module.exports = function(element, index, parametersToAdd) {
  var toString = Object.prototype.toString;

  if (!element) {
    throw '"element" argument not specified';
  }
  if (element.nodeName.toUpperCase() !== 'IFRAME') {
    throw '"element" argument is not an IFRAME';
  }
  if (!element.src) {
    throw '"element" argument is missing "src" property';
  }
  if (element.src.indexOf('youtube') === -1) {
    throw '"element" argument is not a YouTube IFRAME';
  }
  if (!index && index !== 0) {
    throw '"index" argument not specified';
  }
  if (toString.call(index) !== '[object Number]') {
    throw '"index" argument is not a number';
  }
  var hasParametersToAdd = !!parametersToAdd;
  if (hasParametersToAdd && toString.call(parametersToAdd) !== '[object Object]') {
    throw '"parametersToAdd" argument is not an object';
  }

  var launchExtSetup = element.dataset.launchextSetup;
  if (launchExtSetup === PLAYER_SETUP_MODIFIED_STATUS) {
    // player element has been registered already
    return element;
  }
  if (launchExtSetup) {
    // player element has been registered and setup already
    return;
  }

  // set a data attribute to indicate that this player is being setup
  element.dataset.launchextSetup = PLAYER_SETUP_STARTED_STATUS;

  // ensure that the IFrame has an `id` attribute
  var elementId = element.id;
  if (!elementId) {
    // set the `id` attribute to the current timestamp and index
    elementId = IFRAME_ID_PREFIX + '_' + new Date().valueOf() + '_' + index;
    element.id = elementId;
  }

  var elementSrc = element.src;
  var elementSrcParts = elementSrc.split('?');
  var elementSrcHasParameters = elementSrcParts.length > 1;
  var elementSrcParameters = elementSrcHasParameters ? elementSrcParts[1] : '';

  // add any required parameters to the `src` attribute
  if (hasParametersToAdd) {
    var requiredParametersToAdd = [];

    Object.keys(parametersToAdd).forEach(function(parameter) {
      if (elementSrcParameters.indexOf(parameter) < 0) {
        var parameterValue = parametersToAdd[parameter];
        requiredParametersToAdd.push(parameter + '=' + parameterValue);
      }
    });

    if (requiredParametersToAdd.length > 0) {
      requiredParametersToAdd = requiredParametersToAdd.join('&');
      var separator = elementSrcHasParameters ? '&' : '?';
      element.src = elementSrc + separator + requiredParametersToAdd;
    }
  }

  element.dataset.launchextSetup = PLAYER_SETUP_MODIFIED_STATUS;

  return element;
};
