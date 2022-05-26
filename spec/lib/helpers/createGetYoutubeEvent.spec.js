/**
 * Copyright 2022 Yuhui. All rights reserved.
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

describe('createGetYoutubeEvent helper delegate', () => {
  const createGetYoutubeEventDelegate = require('../../../src/lib/helpers/createGetYoutubeEvent');
  const element = jasmine.createSpy();
  const eventType = 'test event type';
  const nativeEvent = {};
  const stateData = {};
  const getYouTubeEvent = createGetYoutubeEventDelegate.bind(element);

  it(
    'throws an error when "eventType" input is not a string',
    () => {
      expect(() => {
        getYouTubeEvent(null, nativeEvent, stateData);
      }).toThrowError('"eventType" input is not a string');
    }
  );

  it(
    'throws an error when "stateData" input is not an object',
    () => {
      expect(() => {
        getYouTubeEvent(eventType, nativeEvent, null);
      }).toThrowError('"stateData" input is not an object');
    }
  );

  it(
    'returns an object with the specified inputs set in the appropriate keys',
    () => {
      const result = getYouTubeEvent(eventType, nativeEvent, stateData);
      expect(result).toBeDefined();
      expect(result.element).toEqual(element);
      expect(result.target).toEqual(element);
      expect(result.nativeEvent).toEqual(nativeEvent);
      expect(result.state).toEqual(eventType);
      expect(result.youtube).toEqual(stateData);
    }
  );
});
