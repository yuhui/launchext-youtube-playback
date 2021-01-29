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

var proxyquire = require('proxyquire').noCallThru();

describe('loadYoutubeIframeApiScript action delegate', function() {
  var getLogSpy = require('../../specHelpers/getLogSpy');
  var log = getLogSpy();

  var getYoutubeIframeApiSpyObj = require('../../specHelpers/getYoutubeIframeApiSpyObj');
  var youtubeIframeApiSpyObj = getYoutubeIframeApiSpyObj();

  var actionDelegate = proxyquire('../../../src/lib/actions/loadYoutubeIframeApiScript', {
    '../helpers/log': log,
    '../helpers/youtubeIframeApi': youtubeIframeApiSpyObj,
  });

  beforeEach(function() {
    this.settings = {}; // this action does not have any custom settings
    this.event = {
      '$type': 'dom-ready',
    };
    actionDelegate(this.settings, this.event);
  });

  it(
    'calls the action from the youtubeIframeApi helper module once only',
    function() {
      var result = youtubeIframeApiSpyObj.loadYoutubeIframeApiScript;
      expect(result).toHaveBeenCalledOnceWith(this.settings);
    }
  );

  it(
    'logs a debug message for the event type',
    function() {
      var result = log;
      expect(result).toHaveBeenCalledWith(
        'debug',
        'Loading YouTube IFrame API script on ' + this.event.$type
      );
    }
  );
});
