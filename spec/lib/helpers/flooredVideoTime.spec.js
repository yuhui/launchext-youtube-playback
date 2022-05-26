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

describe('flooredVideoTime helper delegate', () => {
  const helperDelegate = require('../../../src/lib/helpers/flooredVideoTime');

  it(
    'floors to 10.0 when the input is 10.0',
    () => {
      const result = helperDelegate(10.0);
      expect(result).toEqual(10.0);
    }
  );

  it(
    'floors to 10.0 when the input is 10.4',
    () => {
      const result = helperDelegate(10.4);
      expect(result).toEqual(10.0);
    }
  );

  it(
    'floors to 10.5 when the input is 10.5',
    () => {
      const result = helperDelegate(10.5);
      expect(result).toEqual(10.5);
    }
  );

  it(
    'floors to 10.5 when the input is 10.7',
    () => {
      const result = helperDelegate(10.7);
      expect(result).toEqual(10.5);
    }
  );
});
