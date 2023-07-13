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

describe('createGetVideoEvent helper delegate', () => {
  beforeAll(() => {
    this.helperDelegate = require('../../../src/lib/helpers/createGetVideoEvent');
    this.nativeEvent = {};
    this.stateData = {};
    this.videoPlatform = 'bar';
  });

  describe('with invalid arguments', () => {
    it(
      'should throw an error when "nativeEvent" argument is missing',
      () => {
        expect(() => {
          this.helperDelegate(null, this.stateData, this.videoPlatform);
        }).toThrow('"nativeEvent" argument not specified');
      }
    );

    it(
      'should throw an error when "nativeEvent" argument is not an object or browser event',
      () => {
        expect(() => {
          this.helperDelegate(123, this.stateData, this.videoPlatform);
        }).toThrow('"nativeEvent" argument is not an object or browser event');
      }
    );

    it(
      'should throw an error when "stateData" argument is missing',
      () => {
        expect(() => {
          this.helperDelegate(this.nativeEvent, null, this.videoPlatform);
        }).toThrow('"stateData" argument not specified');
      }
    );

    it(
      'should throw an error when "stateData" argument is not an object',
      () => {
        expect(() => {
          this.helperDelegate(this.nativeEvent, 'foo', this.videoPlatform);
        }).toThrow('"stateData" argument is not an object');
      }
    );

    it(
      'should throw an error when "videoPlatform" argument is missing',
      () => {
        expect(() => {
          this.helperDelegate(this.nativeEvent, this.stateData, null);
        }).toThrow('"videoPlatform" argument not specified');
      }
    );

    it(
      'should throw an error when "videoPlatform" argument is not a string',
      () => {
        expect(() => {
          this.helperDelegate(this.nativeEvent, this.stateData, 123);
        }).toThrow('"videoPlatform" argument is not a string');
      }
    );
  });

  describe('with valid arguments', () => {
    it(
      'should return the expected value',
      () => {
        const result = this.helperDelegate(this.nativeEvent, this.stateData, this.videoPlatform);

        expect(result).toBeInstanceOf(Object);
        expect(result.element).toEqual(this);
        expect(result.target).toEqual(this);
        expect(result.nativeEvent).toEqual(this.nativeEvent);
        expect(Object.keys(result)).toContain(this.videoPlatform);
        expect(result[this.videoPlatform]).toEqual(this.stateData);
      }
    );
  });
});
