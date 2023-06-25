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

describe('compileMilestones helper delegate', () => {
  beforeAll(() => {
    this.helperDelegate = require('../../../src/lib/helpers/compileMilestones');
    this.milestoneTriggersArr = [
      {
        milestone: {
          amount: 200,
          type: 'fixed',
          unit: 'seconds'
        },
        trigger: jasmine.createSpy(),
      },
      {
        milestone: {
          amount: 100,
          type: 'fixed',
          unit: 'seconds'
        },
        trigger: jasmine.createSpy(),
      },
      {
        milestone: {
          amount: 20,
          type: 'fixed',
          unit: 'percent'
        },
        trigger: jasmine.createSpy(),
      },
      {
        milestone: {
          amount: 200,
          type: 'fixed',
          unit: 'seconds'
        },
        trigger: jasmine.createSpy(),
      },
    ];
    this.videoDuration = 1000;
    this.videoStartTime = 500;
    this.isLiveEvent = false;
  });

  describe('with invalid arguments', () => {
    it(
      'should throw an error when "milestoneTriggersArr" argument is missing',
      () => {
        expect(() => {
          this.helperDelegate(null, this.videoDuration, this.videoStartTime, this.isLiveEvent);
        }).toThrow('"milestoneTriggersArr" argument not specified');
      }
    );

    it(
      'should throw an error when "milestoneTriggersArr" argument is not an array',
      () => {
        expect(() => {
          this.helperDelegate(123, this.videoDuration, this.videoStartTime, this.isLiveEvent);
        }).toThrow('"milestoneTriggersArr" argument is not an array');
      }
    );

    it(
      'should throw an error when "milestoneTriggersArr" argument is an empty array',
      () => {
        expect(() => {
          this.helperDelegate([], this.videoDuration, this.videoStartTime, this.isLiveEvent);
        }).toThrow('"milestoneTriggersArr" array is empty');
      }
    );

    it(
      'should throw an error when "videoDuration" argument is missing',
      () => {
        expect(() => {
          this.helperDelegate(
            this.milestoneTriggersArr, null, this.videoStartTime, this.isLiveEvent
          );
        }).toThrow('"videoDuration" argument not specified');
      }
    );

    it(
      'should throw an error when "videoDuration" argument is not a number',
      () => {
        expect(() => {
          this.helperDelegate(
            this.milestoneTriggersArr, 'foo', this.videoStartTime, this.isLiveEvent
          );
        }).toThrow('"videoDuration" argument is not a number');
      }
    );

    it(
      'should throw an error when "videoStartTime" argument is missing',
      () => {
        expect(() => {
          this.helperDelegate(
            this.milestoneTriggersArr, this.videoDuration, null, this.isLiveEvent
          );
        }).toThrow('"videoStartTime" argument not specified');
      }
    );

    it(
      'should throw an error when "videoStartTime" argument is not a number',
      () => {
        expect(() => {
          this.helperDelegate(
            this.milestoneTriggersArr, this.videoDuration, 'foo', this.isLiveEvent
          );
        }).toThrow('"videoStartTime" argument is not a number');
      }
    );

    it(
      'should throw an error when "isLiveEvent" argument is missing',
      () => {
        expect(() => {
          this.helperDelegate(
            this.milestoneTriggersArr, this.videoDuration, this.videoStartTime, null
          );
        }).toThrow('"isLiveEvent" argument not specified');
      }
    );

    it(
      'should throw an error when "isLiveEvent" argument is not a boolean',
      () => {
        expect(() => {
          this.helperDelegate(
            this.milestoneTriggersArr, this.videoDuration, this.videoStartTime, 'foo'
          );
        }).toThrow('"isLiveEvent" argument is not a boolean');
      }
    );
  });

  describe('with valid arguments', () => {
    it(
      'should return percentage and seconds milestones when isLiveEvent is "false"',
      () => {
        const result = this.helperDelegate(
          this.milestoneTriggersArr, this.videoDuration, this.videoStartTime, this.isLiveEvent
        );

        expect(result).toBeInstanceOf(Object);

        const keys = Object.keys(result);
        expect(keys.length).toEqual(1);

        const [ key ] = keys;
        expect(key).toEqual('fixed');

        const { fixed } = result;

        const seconds = Object.keys(fixed);
        expect(seconds.length).toEqual(2);
        expect(seconds).toContain('100');
        expect(seconds).toContain('200');

        const seconds100 = fixed['100'];
        const seconds100Keys = Object.keys(seconds100);
        expect(seconds100Keys.length).toEqual(1);

        const [ seconds1001stKey ] = seconds100Keys;
        expect(seconds1001stKey).toEqual('100s');

        const seconds1001stMilestone = seconds100[seconds1001stKey];
        expect(seconds1001stMilestone).toBeInstanceOf(Array);
        expect(seconds1001stMilestone.length).toEqual(1);
        expect(seconds1001stMilestone[0]).toEqual(this.milestoneTriggersArr[1].trigger);

        const seconds200 = fixed['200'];
        const seconds200Keys = Object.keys(seconds200);
        expect(seconds200Keys.length).toEqual(2);

        const [ seconds2001stKey, seconds2002ndKey ] = seconds200Keys;
        expect(seconds2001stKey).toEqual('200s');
        expect(seconds2002ndKey).toEqual('20%');

        const seconds2001stMilestone = seconds200[seconds2001stKey];
        expect(seconds2001stMilestone).toBeInstanceOf(Array);
        expect(seconds2001stMilestone.length).toEqual(2);
        expect(seconds2001stMilestone[0]).toEqual(this.milestoneTriggersArr[0].trigger);
        expect(seconds2001stMilestone[1]).toEqual(this.milestoneTriggersArr[3].trigger);

        const seconds2002ndMilestone = seconds200[seconds2002ndKey];
        expect(seconds2002ndMilestone).toBeInstanceOf(Array);
        expect(seconds2002ndMilestone.length).toEqual(1);
        expect(seconds2002ndMilestone[0]).toEqual(this.milestoneTriggersArr[2].trigger);
      }
    );

    it(
      'should return seconds milestones when isLiveEvent is "true"',
      () => {
        this.isLiveEvent = true;

        const result = this.helperDelegate(
          this.milestoneTriggersArr, this.videoDuration, this.videoStartTime, this.isLiveEvent
        );

        expect(result).toBeInstanceOf(Object);

        const keys = Object.keys(result);
        expect(keys.length).toEqual(1);

        const [ key ] = keys;
        expect(key).toEqual('fixed');

        const { fixed } = result;

        const seconds = Object.keys(fixed);
        expect(seconds.length).toEqual(2);
        expect(seconds).toContain('600'); // milestone amount + videoStartTime
        expect(seconds).toContain('700'); // milestone amount + videoStartTime

        const seconds600 = fixed['600'];
        const seconds600Keys = Object.keys(seconds600);
        expect(seconds600Keys.length).toEqual(1);

        const [ seconds6001stKey ] = seconds600Keys;
        expect(seconds6001stKey).toEqual('100s');

        const seconds6001stMilestone = seconds600[seconds6001stKey];
        expect(seconds6001stMilestone).toBeInstanceOf(Array);
        expect(seconds6001stMilestone.length).toEqual(1);
        expect(seconds6001stMilestone[0]).toEqual(this.milestoneTriggersArr[1].trigger);

        const seconds700 = fixed['700'];
        const seconds700Keys = Object.keys(seconds700);
        expect(seconds700Keys.length).toEqual(1);

        const [ seconds7001stKey ] = seconds700Keys;
        expect(seconds7001stKey).toEqual('200s');

        const seconds7001stMilestone = seconds700[seconds7001stKey];
        expect(seconds7001stMilestone).toBeInstanceOf(Array);
        expect(seconds7001stMilestone.length).toEqual(2);
        expect(seconds7001stMilestone[0]).toEqual(this.milestoneTriggersArr[0].trigger);
        expect(seconds7001stMilestone[1]).toEqual(this.milestoneTriggersArr[3].trigger);
      }
    );
  });
});
