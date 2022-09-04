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

describe('videoTimeFromFraction helper delegate', () => {
  const helperDelegate = require('../../../src/lib/helpers/videoTimeFromFraction');

  it(
    'results in 26.5 when the duration is 107 and the fraction is 0.2',
    () => {
      const result = helperDelegate(107, 0.2);  // = 21.4 ~= 21.0
      expect(result).toEqual(21.0);
    }
  );

  it(
    'rounds to 10.5 when the input is 10.7',
    () => {
      const result = helperDelegate(262, 2 / 3);  // = 174.67 ~= 174.5
      expect(result).toEqual(174.5);
    }
  );
});
