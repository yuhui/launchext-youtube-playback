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

const mockPlayer = require('../../specHelpers/mockPlayer');

const PLAYER_READY = 'player ready';

describe('getVideoStateData helper delegate', () => {
  beforeAll(() => {
    this.helperDelegate = require('../../../src/lib/helpers/getVideoStateData');
  });

  describe('with invalid arguments', () => {
    beforeEach(() => {
      this.eventType = PLAYER_READY;
      this.player = mockPlayer;
    });

    it(
      'should throw an error when "player" argument is missing',
      () => {
        expect(() => {
          this.helperDelegate(null, this.eventType);
        }).toThrow('"player" argument not specified');
      }
    );

    it(
      'should throw an error when "player" argument is not an object',
      () => {
        expect(() => {
          this.helperDelegate('foo', this.eventType);
        }).toThrow('"player" argument is not an object');
      }
    );

    it(
      'should throw an error when "player.launchExt" property is missing',
      () => {
        expect(() => {
          this.helperDelegate({}, this.eventType);
        }).toThrow('"player" argument is missing "launchExt" object');
      }
    );

    it(
      'should throw an error when "player.launchExt" property is not an object',
      () => {
        expect(() => {
          this.helperDelegate({ launchExt: 'foo' }, this.eventType);
        }).toThrow('"player" argument is missing "launchExt" object');
      }
    );

    it(
      'should throw an error when "eventType" argument is missing',
      () => {
        expect(() => {
          this.helperDelegate(this.player, null);
        }).toThrow('"eventType" argument not specified');
      }
    );

    it(
      'should throw an error when "eventType" argument is not a string',
      () => {
        expect(() => {
          this.helperDelegate(this.player, 123);
        }).toThrow('"eventType" argument is not a string');
      }
    );
  });

  describe('with valid "player" argument', () => {
    beforeEach(() => {
      this.eventType = PLAYER_READY;
      this.player = mockPlayer;
    });

    it(
      'should return a valid stateData object',
      () => {
        const result = this.helperDelegate(this.player, this.eventType);

        expect(result).toBeInstanceOf(Object);

        var launchExt = this.player.launchExt;
        expect(result.player).toEqual(this.player);
        expect(result.playerState).toEqual(this.eventType);
        expect(result.videoCurrentTime).toEqual(launchExt.videoCurrentTime);
        expect(result.videoDuration).toEqual(launchExt.videoDuration);
        expect(result.videoId).toEqual(launchExt.videoId);
        expect(result.videoLoadedFraction).toEqual(launchExt.videoLoadedFraction);
        expect(result.videoMuted).toEqual(this.player.isMuted());
        expect(result.videoPlaybackQuality).toEqual(launchExt.videoPlaybackQuality);
        expect(result.videoPlaybackRate).toEqual(launchExt.videoPlaybackRate);
        expect(result.videoTitle).toEqual(launchExt.videoTitle);
        expect(result.videoType).toEqual('video-on-demand');
        expect(result.videoUrl).toEqual(launchExt.videoUrl);
        expect(result.videoVolume).toEqual(launchExt.videoVolume);
      }
    );
  });
});
