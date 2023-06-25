/**
 * Copyright 2022-2023 Yuhui. All rights reserved.
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

const proxyquire = require('proxyquire').noCallThru();

const mockEvent = require('../../specHelpers/mockEvent');
const mockGetVideoData = jasmine.createSpy();

const DATA_ELEMENT_NAME = 'videoType';

describe(`${DATA_ELEMENT_NAME} data element delegate`, () => {
  beforeAll(() => {
    this.dataElementDelegate = proxyquire(`../../../src/lib/dataElements/${DATA_ELEMENT_NAME}`, {
      '../helpers/getVideoData': mockGetVideoData,
    });
  });

  beforeEach(() => {
    this.settings = {};
    this.event = mockEvent(DATA_ELEMENT_NAME);

    this.dataElementDelegate(this.settings, this.event);
  });

  it(
    'calls `getVideoData()` once only',
    () => {
      const result = mockGetVideoData;

      expect(result).toHaveBeenCalledTimes(1);
      expect(result).toHaveBeenCalledWith(DATA_ELEMENT_NAME, this.event);
    }
  );
});
