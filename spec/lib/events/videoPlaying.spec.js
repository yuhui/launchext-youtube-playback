/**
 * Copyright 2021-2022 Yuhui. All rights reserved.
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
const eventState = 'video playing';

describe(`"${eventState}" event delegate`, () => {
  it(
    'sends the trigger to the youtubeIframeApi helper module once only',
    () => {
      const getYoutubeIframeApiSpyObj = require('../../specHelpers/getYoutubeIframeApiSpyObj');
      const youtubeIframeApiSpyObj = getYoutubeIframeApiSpyObj();

      const eventDelegate = proxyquire('../../../src/lib/events/videoPlaying', {
        '../helpers/youtubeIframeApi': youtubeIframeApiSpyObj,
      });
      const settings = {};
      const trigger = jasmine.createSpy();

      eventDelegate(settings, trigger);
      const result = youtubeIframeApiSpyObj.registerEventTrigger;
      expect(result).toHaveBeenCalledTimes(1);
      expect(result).toHaveBeenCalledWith(eventState, settings, trigger);
    }
  );
});
