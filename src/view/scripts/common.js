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

/** Get the form */
function getForm(formId) {
  var form = document.getElementById(formId);
  return form;
}

/** Get the values from the form */
function getFormValues(formId) {
  var formValues = {};

  var form = getForm(formId);
  if (!form || form.nodeName !== 'FORM') {
    return formValues;
  }

  for (var i = 0, j = form.elements.length; i < j; i++) {
    var formElement = form.elements[i];
    if (formElement.name === '') {
      continue;
    }
    switch (formElement.nodeName) {
      case 'INPUT':
        switch (formElement.type) {
          case 'text':
          case 'hidden':
          case 'password':
          case 'button':
          case 'reset':
          case 'submit':
            formValues[formElement.name] = formElement.value;
            break;
          case 'checkbox':
          case 'radio':
            if (formElement.checked) {
              formValues[formElement.name] = formElement.value;
            } else if (formElement.type === 'checkbox') {
              formValues[formElement.name] = '';
            }
            break;
        }
        break;
      case 'file':
        break;
      case 'TEXTAREA':
        formValues[formElement.name] = formElement.value;
        break;
      case 'SELECT':
        switch (formElement.type) {
          case 'select-one':
            formValues[formElement.name] = formElement.value;
            break;
          case 'select-multiple':
            for (var k = 0, l = formElement.options.length; k < l; k++) {
              if (formElement.options[k].selected) {
                formValues[formElement.name] = formElement.options[j].value;
              }
            }
            break;
        }
        break;
      case 'BUTTON':
        switch (formElement.type) {
          case 'reset':
          case 'submit':
          case 'button':
            formValues[formElement.name] = formElement.value;
            break;
        }
        break;
    }
  }

  return formValues;
}

/** Set the values in the form */
// eslint-disable-next-line no-unused-vars
function setFormValues(formId, formValues) {
  var form = getForm(formId);
  var formFields = getFormFields(formId);
  for (var i = 0, j = formFields.length; i < j; i++) {
    var field = formFields[i];
    if (field in formValues) {
      if (form[field].type === 'checkbox') {
        form[field].checked = formValues[field] === form[field].value ? true : false;
      } else {
        form[field].value = formValues[field];
      }
    }
  }
}

/** Get the fields in the form */
// eslint-disable-next-line no-unused-vars
function getFormFields(formId) {
  var formValues = getFormValues(formId);
  return Object.keys(formValues);
}

/** Check if a form value is a data element token */
// eslint-disable-next-line no-unused-vars
function isDataElementToken(formValue) {
  return /^%([^%]+)%$/.test(formValue);
}

/** Check if a value is an integer */
// eslint-disable-next-line no-unused-vars
function valueIsInteger(value) {
  return (value + '').length > 0 &&
    !isNaN(parseInt(value)) &&
    parseInt(value) === parseFloat(value);
}

/** Show or hide an element based on the value of a form field */
// eslint-disable-next-line no-unused-vars
function toggleElement(formId, toggleField, toggleValue, selectorToToggle) {
  var formValues = getFormValues(formId);
  var toggleFieldValue = formValues[toggleField];

  var elementToShowHide = document.querySelector(selectorToToggle);
  if (toggleFieldValue === toggleValue) {
    elementToShowHide.classList.remove('hide');
    elementToShowHide.classList.add('show');
  } else {
    elementToShowHide.classList.remove('show');
    elementToShowHide.classList.add('hide');
  }
}
