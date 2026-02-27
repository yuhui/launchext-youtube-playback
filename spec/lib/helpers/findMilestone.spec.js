/**
 * Copyright 2026 Yuhui. All rights reserved.
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

const mockPlayer = require('../../specHelpers/mockPlayer');

describe('findMilestone helper delegate', () => {
  beforeAll(() => {
    this.helperDelegate = require('../../../src/lib/helpers/findMilestone');
  });

  describe('with invalid arguments', () => {
    beforeEach(() => {
      this.player = mockPlayer;
      this.callbackFunction = jasmine.createSpy();
    });

    it(
      'should throw an error when "player" argument is missing',
      () => {
        expect(() => {
          this.helperDelegate(null, this.callbackFunction);
        }).toThrow('"player" argument not specified');
      }
    );

    it(
      'should throw an error when "player" argument is not an object',
      () => {
        expect(() => {
          this.helperDelegate('foo', this.callbackFunction);
        }).toThrow('"player" argument is not an object');
      }
    );

    it(
      'should throw an error when "player.launchExt" property is missing',
      () => {
        expect(() => {
          this.helperDelegate({}, this.callbackFunction);
        }).toThrow('"player" argument is missing "launchExt" object');
      }
    );

    it(
      'should throw an error when "player.launchExt" property is not an object',
      () => {
        expect(() => {
          this.helperDelegate({ launchExt: 'foo' }, this.callbackFunction);
        }).toThrow('"player" argument is missing "launchExt" object');
      }
    );

    it(
      'should throw an error when "callbackFunction" argument is missing',
      () => {
        expect(() => {
          this.helperDelegate(this.player, null);
        }).toThrow('"callbackFunction" argument not specified');
      }
    );

    it(
      'should throw an error when "callbackFunction" argument is not a function',
      () => {
        expect(() => {
          this.helperDelegate(this.player, 'foo');
        }).toThrow('"callbackFunction" argument is not a function');
      }
    );
  });

  describe('with valid arguments', () => {
    beforeEach(() => {
      this.player = mockPlayer;
      this.callbackFunction = jasmine.createSpy();
    });

    it(
      'should return a valid milestone',
      () => {
        const result = this.helperDelegate(this.player, this.callbackFunction);

        expect(result).toEqual(10);
        expect(this.callbackFunction).toHaveBeenCalledWith(10);
      }
    );

    it(
      'should return 1 milestone if more than 1 is found',
      () => {
        this.player.launchExt.playStopTime = 25;
        const result = this.helperDelegate(this.player, this.callbackFunction);

        expect(result).toEqual(10);
        expect(this.callbackFunction).toHaveBeenCalledWith(10);
      }
    );

    it(
      'should return undefined if no milestone is found',
      () => {
        this.player.launchExt.playStopTime = 9;
        const result = this.helperDelegate(this.player, this.callbackFunction);

        expect(result).toBeUndefined();
        expect(this.callbackFunction).not.toHaveBeenCalled();
      }
    );
  });
});
