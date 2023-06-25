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

const mockYoutubeIframeApi = require('../../specHelpers/mockYoutubeIframeApi');

const EVENT_STATE = 'player removed';

describe(`"${EVENT_STATE}" event delegate`, () => {
  const youtubeIframeApi = mockYoutubeIframeApi();

  beforeAll(() => {
    this.eventDelegate = proxyquire('../../../src/lib/events/playerRemoved', {
      '../helpers/youtubeIframeApi': youtubeIframeApi,
    });
  });

  beforeEach(() => {
    this.settings = {};
    this.trigger = jasmine.createSpy();

    this.eventDelegate(this.settings, this.trigger);
  });

  it(
    'sends the trigger to the youtubeIframeApi helper module once only',
    () => {
      const result = youtubeIframeApi.registerEventTrigger;
      expect(result).toHaveBeenCalledTimes(1);
      expect(result).toHaveBeenCalledWith(EVENT_STATE, this.settings, this.trigger);
    }
  );
});
