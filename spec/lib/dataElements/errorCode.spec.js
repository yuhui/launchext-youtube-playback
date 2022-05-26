/**
 * Copyright 2021 Yuhui. All rights reserved.
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

describe('errorCode data element delegate', () => {
  const dataElementDelegate = require('../../../src/lib/dataElements/errorCode');
  const getBaseEvent = require('../../specHelpers/getBaseEvent');

  beforeEach(() => {
    this.event = getBaseEvent(['errorCode']);
    this.settings = {}; // this data element does not have any custom settings
  });

  describe('with invalid "event" argument', () => {
    it(
      'should be undefined when "youtube" property is missing',
      () => {
        delete this.event.youtube;
        const result = dataElementDelegate(this.settings, this.event);
        expect(result).toBeUndefined();
      }
    );

    it(
      'should be undefined when "errorCode" property is missing',
      () => {
        delete this.event.youtube.errorCode;
        const result = dataElementDelegate(this.settings, this.event);
        expect(result).toBeUndefined();
      }
    );

    it(
      'should be undefined when "state" property is not "player error"',
      () => {
        this.event.state = 'player ready';
        const result = dataElementDelegate(this.settings, this.event);
        expect(result).toBeUndefined();
      }
    );
  });

  describe('with valid "event" argument', () => {
    it(
      'should be a non-zero integer',
      () => {
        const result = dataElementDelegate(this.settings, this.event);
        expect(result).toBeInstanceOf(Number);
        expect(result % 1).toBe(0);
        expect(result).toBeGreaterThan(0);
      }
    );
  });

});
