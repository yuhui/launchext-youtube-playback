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

var FORM_ID = 'event-configuration';

/** Get the Event configuration form */
function getForm() {
  var eventConfigurationForm = document.getElementById(FORM_ID);
  return eventConfigurationForm;
}

/** Get the values from the Event configuration form */
function getFormValues() {
  var eventConfigurationForm = getForm();
  var elementSpecificityValue = eventConfigurationForm.
    elementSpecificity.value;
  var elementsSelectorValue = eventConfigurationForm.
    elementsSelector.value;

  return {
    elementSpecificity: elementSpecificityValue,
    elementsSelector: elementsSelectorValue
  }
}
