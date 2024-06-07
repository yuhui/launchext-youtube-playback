/**
 * Copyright 2023-2024 Yuhui. All rights reserved.
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

const mockEvent = require('../../specHelpers/mockEvent');
const mockTurbine = require('../../specHelpers/mockTurbine');

const PLAYER_STATES = [
  'autoplay blocked',
  'module with exposed API changed',
  'playback quality changed',
  'playback rate changed',
  'player error',
  'player ready',
  'player removed',
  'player state change',
  'video buffering',
  'video cued',
  'video ended',
  'video milestone',
  'video paused',
  'video playing',
  'video replayed',
  'video resumed',
  'video started',
  'video unstarted',
];
const VIDEO_DATA_NAMES = {
  'errorCode': ['player error'],
  'errorMessage': ['player error'],
  'moduleNames': ['module with exposed API changed'],
  'playerState': [],
  'videoCurrentTime': [],
  'videoDuration': [],
  'videoId': [],
  'videoLoadedFraction': [],
  'videoMilestone': ['video milestone'],
  'videoMuted': [],
  'videoPlaybackQuality': ['playback quality changed'],
  'videoPlaybackRate': [],
  'videoPlayedSegmentTime': [
    'player removed',
    'video buffering',
    'video cued',
    'video ended',
    'video paused',
  ],
  'videoPlayedTotalTime': [
    'player removed',
    'video buffering',
    'video cued',
    'video ended',
    'video paused',
  ],
  'videoTitle': [],
  'videoType': [],
  'videoUrl': [],
  'videoVolume': [],
};

describe('getVideoData helper delegate', () => {
  beforeAll(() => {
    global.turbine = mockTurbine;
    this.helperDelegate = require('../../../src/lib/helpers/getVideoData');
  });

  afterAll(() => {
    delete global.turbine;
  });

  describe('with invalid arguments', () => {
    beforeEach(() => {
      this.event = mockEvent();
      this.videoDataName = 'videoId';
    });

    it(
      'logs an error message when "videoDataName" argument is missing',
      () => {
        const result = this.helperDelegate(null, this.event);

        expect(result).toBeUndefined();

        const logError = global.turbine.logger.error;
        expect(logError).toHaveBeenCalledWith('"videoDataName" argument not specified.');
      }
    );

    it(
      'logs an error message when "videoDataName" argument is not a string',
      () => {
        const result = this.helperDelegate(123, this.event);

        expect(result).toBeUndefined();

        const logError = global.turbine.logger.error;
        expect(logError).toHaveBeenCalledWith('"videoDataName" argument is not a string.');
      }
    );

    it(
      'logs an error message when "videoDataName" argument is not a valid data element type',
      () => {
        this.videoDataName = 'foo';
        const result = this.helperDelegate(this.videoDataName, this.event);

        expect(result).toBeUndefined();

        const logError = global.turbine.logger.error;
        expect(logError).toHaveBeenCalledWith(
          '"videoDataName" argument is not a valid data element type.'
        );
      }
    );

    it(
      'logs an error message when "event" argument is missing',
      () => {
        const result = this.helperDelegate(this.videoDataName, null);

        expect(result).toBeUndefined();

        const logError = global.turbine.logger.error;
        expect(logError).toHaveBeenCalledWith(
          '"event" argument not specified. Use _satellite.getVar("data element name", event);.'
        );
      }
    );

    it(
      'logs an error message when "event" argument is not an object',
      () => {
        const result = this.helperDelegate(this.videoDataName, 'foo');

        expect(result).toBeUndefined();

        const logError = global.turbine.logger.error;
        expect(logError).toHaveBeenCalledWith(
          '"event" argument is not an object. Use _satellite.getVar("data element name", event);.'
        );
      }
    );

    it(
      'logs an error message when "event.$type" property does not start with "youtube-playback."',
      () => {
        this.event.$type = 'foo';
        const result = this.helperDelegate(this.videoDataName, this.event);

        expect(result).toBeUndefined();

        const logError = global.turbine.logger.error;
        expect(logError).toHaveBeenCalledWith(
          'Data element being used with an event that is not from the YouTube Playback extension.'
        );
      }
    );

    it(
      'logs an error message when "event.youtube" property is missing',
      () => {
        delete this.event.youtube;
        const result = this.helperDelegate(this.videoDataName, this.event);

        expect(result).toBeUndefined();

        const logError = global.turbine.logger.error;
        expect(logError).toHaveBeenCalledWith(
          'Data element being used with an event that is not from the YouTube Playback extension.'
        );
      }
    );

    it(
      'logs an error message when "event.youtube.playerState" property is missing',
      () => {
        delete this.event.youtube.playerState;
        const result = this.helperDelegate(this.videoDataName, this.event);

        expect(result).toBeUndefined();

        const logError = global.turbine.logger.error;
        expect(logError).toHaveBeenCalledWith(
          'Data element being used with an event that is not from the YouTube Playback extension.'
        );
      }
    );
  });

  describe('with valid arguments', () => {
    const videoDataNames = Object.keys(VIDEO_DATA_NAMES);

    const videoDataNamesWithStates = videoDataNames.filter((videoDataName) => {
      const expectedPlayerStates = VIDEO_DATA_NAMES[videoDataName];
      return expectedPlayerStates.length > 0;
    });
    videoDataNamesWithStates.forEach((videoDataName) => {
      PLAYER_STATES.forEach((playerState) => {
        const expectedPlayerStates = VIDEO_DATA_NAMES[videoDataName];
        if (expectedPlayerStates.includes(playerState)) {
          // don't test for an expected player state
          return;
        }

        describe('with invalid player state', () => {
          beforeEach(() => {
            this.event = mockEvent(videoDataName, playerState);
          });

          it(
            `logs an error message when "${videoDataName}" is used with "${playerState}"`,
            () => {
              const expectedPlayerStatesString = expectedPlayerStates.sort().join('", "');

              const result = this.helperDelegate(videoDataName, this.event);

              expect(result).toBeUndefined();

              const logError = global.turbine.logger.error;
              expect(logError).toHaveBeenCalledWith(
                `Trying to get "${videoDataName}" but video event `
                + `"${this.event.youtube.playerState}" is not one of `
                + `"${expectedPlayerStatesString}".`
              );
            }
          );
        });
      });
    });

    videoDataNames.forEach((videoDataName) => {
      PLAYER_STATES.forEach((playerState) => {
        const expectedPlayerStates = VIDEO_DATA_NAMES[videoDataName];
        if (expectedPlayerStates.length > 0 && !expectedPlayerStates.includes(playerState)) {
          return;
        }

        describe('with valid player state', () => {
          beforeEach(() => {
            this.event = mockEvent(videoDataName, playerState);
          });

          it(
            // eslint-disable-next-line max-len
            `should return the expected values when "${videoDataName}" is used with "${playerState}"`,
            () => {
              const result = this.helperDelegate(videoDataName, this.event);

              expect(result).toEqual(this.event.youtube[videoDataName]);
            }
          );

          if (videoDataName === 'videoCurrentTime') {
            it(
              `should return the expected values when videoCurrentTime is 0 with "${playerState}"`,
              () => {
                this.event.youtube.videoCurrentTime = 0;

                const result = this.helperDelegate(videoDataName, this.event);
  
                expect(result).toEqual(this.event.youtube[videoDataName]);
              }
            );
          }
        });
      });
    });
  });
});
