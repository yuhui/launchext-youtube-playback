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

const mockElement = require('../../specHelpers/mockElement');

const PLAYER_SETUP_COMPLETED_STATUS = 'completed';
const PLAYER_SETUP_MODIFIED_STATUS = 'modified';
const PLAYER_SETUP_READY_STATUS = 'ready';
const PLAYER_SETUP_FINISHED_STATUSES = [
  PLAYER_SETUP_MODIFIED_STATUS,
  PLAYER_SETUP_READY_STATUS,
];

const TEST_ID_PREFIX = 'foobar';
const TEST_SRC_URL_PATTERN = 'youtube';
const TEST_PARAMETERS_TO_ADD = [
  {
    name: 'param1',
    value: '1',
    attribute: {
      name: 'param1',
      value: 'true',
    },
  },
  {
    name: 'param2',
    value: 'https://www.foo.bar',
  },
];
const EXPECTED_ELEMENT_ID_REGEXP_STRING = `^${TEST_ID_PREFIX}_[0-9]+_`;

describe('registerPlayerElement helper delegate', () => {
  beforeAll(() => {
    this.helperDelegate = require('../../../src/lib/helpers/registerPlayerElement');
  });

  describe('with invalid arguments', () => {
    beforeEach(() => {
      this.element = mockElement();
      this.index = 1;
      this.idPrefix = TEST_ID_PREFIX;
      this.srcUrlPattern = TEST_SRC_URL_PATTERN;
      this.parametersToAdd = [];
    });

    it(
      'should throw an error when "element" argument is missing',
      () => {
        expect(() => {
          this.helperDelegate(
            null,
            this.index,
            this.idPrefix,
            this.srcUrlPattern,
            this.parametersToAdd
          );
        }).toThrow('"element" argument not specified');
      }
    );

    it(
      'should throw an error when "index" argument is missing',
      () => {
        expect(() => {
          this.helperDelegate(
            this.element,
            null,
            this.idPrefix,
            this.srcUrlPattern,
            this.parametersToAdd
          );
        }).toThrow('"index" argument not specified');
      }
    );

    it(
      'should throw an error when "index" argument is not a number',
      () => {
        expect(() => {
          this.helperDelegate(
            this.element,
            'foo',
            this.idPrefix,
            this.srcUrlPattern,
            this.parametersToAdd
          );
        }).toThrow('"index" argument is not a number');
      }
    );

    it(
      'should throw an error when "idPrefix" argument is missing',
      () => {
        expect(() => {
          this.helperDelegate(
            this.element,
            this.index,
            null,
            this.srcUrlPattern,
            this.parametersToAdd
          );
        }).toThrow('"idPrefix" argument not specified');
      }
    );

    it(
      'should throw an error when "idPrefix" argument is not a string',
      () => {
        expect(() => {
          this.helperDelegate(
            this.element,
            this.index,
            42,
            this.srcUrlPattern,
            this.parametersToAdd
          );
        }).toThrow('"idPrefix" argument is not a string');
      }
    );

    it(
      'should throw an error when "srcUrlPattern" argument is missing',
      () => {
        expect(() => {
          this.helperDelegate(
            this.element,
            this.index,
            this.idPrefix,
            null,
            this.parametersToAdd
          );
        }).toThrow('"srcUrlPattern" argument not specified');
      }
    );

    it(
      'should throw an error when "srcUrlPattern" argument is not a string',
      () => {
        expect(() => {
          this.helperDelegate(
            this.element,
            this.index,
            this.idPrefix,
            42,
            this.parametersToAdd
          );
        }).toThrow('"srcUrlPattern" argument is not a string');
      }
    );
    it(
      'should throw an error when "parametersToAdd" argument is not an array',
      () => {
        expect(() => {
          this.helperDelegate(
            this.element,
            this.index,
            this.idPrefix,
            this.srcUrlPattern,
            'foo'
          );
        }).toThrow('"parametersToAdd" argument is not an array');
      }
    );
  });

  describe('with valid arguments', () => {
    beforeEach(() => {
      this.element = mockElement();
      this.index = 1;
      this.idPrefix = TEST_ID_PREFIX;
      this.srcUrlPattern = TEST_SRC_URL_PATTERN;
      this.parametersToAdd = TEST_PARAMETERS_TO_ADD;
    });

    it(
      'should return nothing when "element.nodeName" property is not "IFRAME"',
      () => {
        this.element = mockElement({ nodeName: 'foo' });

        const result = this.helperDelegate(
          this.element,
          this.index,
          this.idPrefix,
          this.srcUrlPattern,
          this.parametersToAdd
        );

        expect(result).toBeUndefined();
      }
    );

    it(
      'should return nothing when "element.src" property is missing',
      () => {
        this.element = mockElement({ includeSrc: false });

        const result = this.helperDelegate(
          this.element,
          this.index,
          this.idPrefix,
          this.srcUrlPattern,
          this.parametersToAdd
        );

        expect(result).toBeUndefined();
      }
    );

    it(
      'should return nothing when "element.src" property is invalid',
      () => {
        this.element = mockElement({ srcUrl: 'foo' });

        const result = this.helperDelegate(
          this.element,
          this.index,
          this.idPrefix,
          this.srcUrlPattern,
          this.parametersToAdd
        );

        expect(result).toBeUndefined();
      }
    );

    it(
      'should return nothing when the element has been setup already',
      () => {
        this.element = mockElement({ launchextSetup: PLAYER_SETUP_COMPLETED_STATUS });

        const result = this.helperDelegate(
          this.element,
          this.index,
          this.idPrefix,
          this.srcUrlPattern,
          this.parametersToAdd
        );

        expect(result).toBeUndefined();
      }
    );

    PLAYER_SETUP_FINISHED_STATUSES.forEach((status) => {
      it(
        `should return the "element" argument when the element has status ${status} already`,
        () => {
          this.element = mockElement({ launchextSetup: status });
  
          const result = this.helperDelegate(
            this.element,
            this.index,
            this.idPrefix,
            this.srcUrlPattern,
            this.parametersToAdd
          );

          expect(result).toEqual(this.element);
        }
      );
    });

    it(
      'should return the "element" argument when the element has an ID and parameters already',
      () => {
        this.element = mockElement({
          includeId: true,
          parameters: this.parametersToAdd,
        });
        const {
          id: expectedId,
          src: expectedSrc,
        } = this.element;

        const result = this.helperDelegate(
          this.element,
          this.index,
          this.idPrefix,
          this.srcUrlPattern,
          this.parametersToAdd
        );

        expect(result).toEqual(this.element);

        const {
          id,
          dataset: {
            launchextSetup,
          },
          src,
        } = result;

        expect(id).toEqual(expectedId);
        expect(launchextSetup).toEqual(PLAYER_SETUP_MODIFIED_STATUS);
        expect(src).toEqual(expectedSrc);
      }
    );

    it(
      'should return the "element" argument with added ID only when the element has parameters already',
      () => {
        this.element = mockElement({ parameters: TEST_PARAMETERS_TO_ADD });
        const {
          src: expectedSrc
        } = this.element;

        const result = this.helperDelegate(
          this.element,
          this.index,
          this.idPrefix,
          this.srcUrlPattern,
          this.parametersToAdd
        );

        expect(result).toEqual(this.element);

        const {
          id,
          dataset: {
            launchextSetup,
          },
          src,
        } = result;

        expect(id).toMatch(new RegExp(`${EXPECTED_ELEMENT_ID_REGEXP_STRING}${this.index}`));
        expect(launchextSetup).toEqual(PLAYER_SETUP_MODIFIED_STATUS);
        expect(src).toEqual(expectedSrc);
      }
    );

    it(
      'should return the "element" argument with added parameters only when the element has an ID already',
      () => {
        this.element = mockElement({ includeId: true });
        const {
          id: expectedId,
        } = this.element;

        const parametersToAddString =
          this.parametersToAdd.map(({ name, value }) => `${name}=${value}`).join('&');
        const expectedSrc = `${this.element.src}?${parametersToAddString}`;

        const result = this.helperDelegate(
          this.element,
          this.index,
          this.idPrefix,
          this.srcUrlPattern,
          this.parametersToAdd
        );

        expect(result).toEqual(this.element);

        const {
          id,
          dataset: {
            launchextSetup,
          },
          src,
        } = result;

        expect(id).toEqual(expectedId);
        expect(launchextSetup).toEqual(PLAYER_SETUP_MODIFIED_STATUS);
        expect(src).toEqual(expectedSrc);
      }
    );

    it(
      'should return the "element" argument with some added parameters when the element has a matching attribute already',
      () => {
        const { attribute } = this.parametersToAdd[0];
        this.element = mockElement({ attribute });

        const parametersToAddString =
          [ this.parametersToAdd[1] ].map(({ name, value }) => `${name}=${value}`).join('&');
        const expectedSrc = `${this.element.src}?${parametersToAddString}`;

        const result = this.helperDelegate(
          this.element,
          this.index,
          this.idPrefix,
          this.srcUrlPattern,
          this.parametersToAdd
        );

        expect(result).toEqual(this.element);

        const {
          id,
          dataset: {
            launchextSetup,
          },
          src,
        } = result;

        expect(id).toMatch(new RegExp(`${EXPECTED_ELEMENT_ID_REGEXP_STRING}${this.index}`));
        expect(launchextSetup).toEqual(PLAYER_SETUP_MODIFIED_STATUS);
        expect(src).toEqual(expectedSrc);
      }
    );

    it(
      'should return the "element" argument with added parameters when the element does not have a matching attribute',
      () => {
        const attribute = {
          name: this.parametersToAdd[0].attribute.name,
          value: 'foo',
        };
        this.element = mockElement({ attribute });

        const parametersToAddString =
          this.parametersToAdd.map(({ name, value }) => `${name}=${value}`).join('&');
        const expectedSrc = `${this.element.src}?${parametersToAddString}`;

        const result = this.helperDelegate(
          this.element,
          this.index,
          this.idPrefix,
          this.srcUrlPattern,
          this.parametersToAdd
        );

        expect(result).toEqual(this.element);

        const {
          id,
          dataset: {
            launchextSetup,
          },
          src,
        } = result;

        expect(id).toMatch(new RegExp(`${EXPECTED_ELEMENT_ID_REGEXP_STRING}${this.index}`));
        expect(launchextSetup).toEqual(PLAYER_SETUP_MODIFIED_STATUS);
        expect(src).toEqual(expectedSrc);
      }
    );

    it(
      'should return the "element" argument with added ID and parameters',
      () => {
        const parametersToAddString =
          this.parametersToAdd.map(({ name, value }) => `${name}=${value}`).join('&');
        const expectedSrc = `${this.element.src}?${parametersToAddString}`;

        const result = this.helperDelegate(
          this.element,
          this.index,
          this.idPrefix,
          this.srcUrlPattern,
          this.parametersToAdd
        );

        expect(result).toEqual(this.element);

        const {
          id,
          dataset: {
            launchextSetup,
          },
          src,
        } = result;

        expect(id).toMatch(new RegExp(`${EXPECTED_ELEMENT_ID_REGEXP_STRING}${this.index}`));
        expect(launchextSetup).toEqual(PLAYER_SETUP_MODIFIED_STATUS);
        expect(src).toEqual(expectedSrc);
      }
    );
  });
});
