/**
 * Copyright 2023-2024 Yuhui. All rights reserved.
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

var PLAYER_SETUP_STARTED_STATUS = 'started';
var PLAYER_SETUP_MODIFIED_STATUS = 'modified';

/**
 * Registers a player element to work with the video API later.
 *
 * @param {DOMElement} element Player element to register.
 * @param {Number} index Index of the player element in the DOM.
 * @param {String} idPrefix Prefix to use when creating an ID for the player element.
 * @param {String} srcUrlPattern Regular expression pattern (as a string) to match in the element's
 *    `src` attribute.
 * @param {Object} parametersToAdd (optional) List of parameters to add to the video URL.
 *
 * @return {DOMElement} Player element that has been registered successfully.
 *
 * @throws Will throw an error if index is not a number.
 * @throws Will throw an error if idPrefix is not a string.
 * @throws Will throw an error if srcUrlPattern is not a string.
 * @throws Will throw an error if parametersToAdd is specified but is not an object.
 */
module.exports = function(element, index, idPrefix, srcUrlPattern, parametersToAdd) {
  var toString = Object.prototype.toString;

  if (!element) {
    throw '"element" argument not specified';
  }
  if (!index && index !== 0) {
    throw '"index" argument not specified';
  }
  if (toString.call(index) !== '[object Number]') {
    throw '"index" argument is not a number';
  }
  if (!idPrefix) {
    throw '"idPrefix" argument not specified';
  }
  if (toString.call(idPrefix) !== '[object String]') {
    throw '"idPrefix" argument is not a string';
  }
  if (!srcUrlPattern) {
    throw '"srcUrlPattern" argument not specified';
  }
  if (toString.call(srcUrlPattern) !== '[object String]') {
    throw '"srcUrlPattern" argument is not a string';
  }
  var hasParametersToAdd = !!parametersToAdd;
  if (hasParametersToAdd && toString.call(parametersToAdd) !== '[object Object]') {
    throw '"parametersToAdd" argument is not an object';
  }

  var elementSrc = element.src;
  /**
   * Check for valid IFRAME `src` attribute in element.
   * If the `src` is invalid, then this might not be a player element.
   */
  if (element.nodeName.toUpperCase() !== 'IFRAME') {
    // element is not an IFRAME
    return;
  }
  if (!elementSrc) {
    // element is missing a `src` attribute
    return;
  }
  var srcUrlPatternRegExp = new RegExp(srcUrlPattern);
  if (!srcUrlPatternRegExp.test(elementSrc)) {
    // element's `src` attribute does not contain the expected pattern
    return;
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
    elementId = idPrefix + '_' + new Date().valueOf() + '_' + index;
    element.id = elementId;
  }

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
