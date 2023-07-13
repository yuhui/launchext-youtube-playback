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

const mockElement = require('../../specHelpers/mockElement');

const PLAYER_SETUP_MODIFIED_STATUS = 'modified';

const TEST_PARAMETERS_TO_ADD = {
  param1: 1,
  param2: 'https://www.foo.bar',
};
const EXPECTED_ELEMENT_ID_REGEXP_STRING = '^youTubePlayback_[0-9]+_';
const EXPECTED_ELEMENT_SRC_PARAMETERS =
  Object.entries(TEST_PARAMETERS_TO_ADD).map(([k, v]) => `${k}=${v}`).join('&');

describe('registerPlayerElement helper delegate', () => {
  beforeAll(() => {
    this.helperDelegate = require('../../../src/lib/helpers/registerPlayerElement');
  });

  describe('with invalid arguments', () => {
    beforeEach(() => {
      this.element = mockElement();
      this.index = 1;
      this.parametersToAdd = {};
    });

    it(
      'should throw an error when "element" argument is missing',
      () => {
        expect(() => {
          this.helperDelegate(null, this.index, this.parametersToAdd);
        }).toThrow('"element" argument not specified');
      }
    );

    it(
      'should throw an error when "element.nodeName" property is invalid',
      () => {
        expect(() => {
          this.element.nodeName = 'foo';
          this.helperDelegate(this.element, this.index, this.parametersToAdd);
        }).toThrow('"element" argument is not an IFRAME');
      }
    );

    it(
      'should throw an error when "element.src" property is missing',
      () => {
        expect(() => {
          delete this.element.src;
          this.helperDelegate(this.element, this.index, this.parametersToAdd);
        }).toThrow('"element" argument is missing "src" property');
      }
    );

    it(
      'should throw an error when "element.src" property is invalid',
      () => {
        expect(() => {
          this.element.src = 'foo';
          this.helperDelegate(this.element, this.index, this.parametersToAdd);
        }).toThrow('"element" argument is not a YouTube IFRAME');
      }
    );

    it(
      'should throw an error when "index" argument is missing',
      () => {
        expect(() => {
          this.helperDelegate(this.element, null, this.parametersToAdd);
        }).toThrow('"index" argument not specified');
      }
    );

    it(
      'should throw an error when "index" argument is not a number',
      () => {
        expect(() => {
          this.helperDelegate(this.element, 'foo', this.parametersToAdd);
        }).toThrow('"index" argument is not a number');
      }
    );

    it(
      'should throw an error when "parametersToAdd" argument is not an object',
      () => {
        expect(() => {
          this.helperDelegate(this.element, this.index, 'foo');
        }).toThrow('"parametersToAdd" argument is not an object');
      }
    );
  });

  describe('with valid arguments', () => {
    beforeEach(() => {
      this.element = mockElement();
      this.index = 1;
      this.parametersToAdd = TEST_PARAMETERS_TO_ADD;
    });

    it(
      'should return nothing when the element has been setup already',
      () => {
        this.element.dataset.launchextSetup = 'completed';

        const result = this.helperDelegate(this.element, this.index, this.parametersToAdd);

        expect(result).toBeUndefined();
      }
    );

    it(
      'should return the "element" argument when the element has been registered already',
      () => {
        this.element.dataset.launchextSetup = PLAYER_SETUP_MODIFIED_STATUS;

        const result = this.helperDelegate(this.element, this.index, this.parametersToAdd);

        expect(result).toEqual(this.element);
      }
    );

    it(
      'should return the "element" argument when the element has an ID and parameters already',
      () => {
        this.element = mockElement(true, ['param1', 'param2']);

        const result = this.helperDelegate(this.element, this.index, this.parametersToAdd);

        expect(result).toEqual(this.element);
        expect(result.id).toEqual(this.element.id);
        expect(result.src).toEqual(this.element.src);
        expect(result.dataset.launchextSetup).toEqual(PLAYER_SETUP_MODIFIED_STATUS);
      }
    );

    it(
      'should return the "element" argument with added ID only',
      () => {
        this.element = mockElement(false, ['param1', 'param2']);

        const result = this.helperDelegate(this.element, this.index, this.parametersToAdd);

        expect(result).toEqual(this.element);
        expect(result.id).toMatch(new RegExp(`${EXPECTED_ELEMENT_ID_REGEXP_STRING}${this.index}`));
        expect(result.src).toEqual(this.element.src);
        expect(result.dataset.launchextSetup).toEqual(PLAYER_SETUP_MODIFIED_STATUS);
      }
    );

    it(
      'should return the "element" argument with added parameters only',
      () => {
        this.element = mockElement(true, null);
        const originalElementSrc = this.element.src;

        const result = this.helperDelegate(this.element, this.index, this.parametersToAdd);

        expect(result).toEqual(this.element);
        expect(result.id).toEqual(this.element.id);
        expect(result.src).toEqual(`${originalElementSrc}?${EXPECTED_ELEMENT_SRC_PARAMETERS}`);
        expect(result.dataset.launchextSetup).toEqual(PLAYER_SETUP_MODIFIED_STATUS);
      }
    );

    it(
      'should return the "element" argument with added ID and parameters',
      () => {
        const originalElementSrc = this.element.src;

        const result = this.helperDelegate(this.element, this.index, this.parametersToAdd);

        expect(result).toEqual(this.element);
        expect(result.id).toMatch(new RegExp(`${EXPECTED_ELEMENT_ID_REGEXP_STRING}${this.index}`));
        expect(result.src).toEqual(`${originalElementSrc}?${EXPECTED_ELEMENT_SRC_PARAMETERS}`);
        expect(result.dataset.launchextSetup).toEqual(PLAYER_SETUP_MODIFIED_STATUS);
      }
    );
  });
});
