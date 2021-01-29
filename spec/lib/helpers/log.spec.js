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

describe('log helper delegate', function() {
  global.turbine = {
    logger: jasmine.createSpyObj('', ['debug', 'info', 'warn', 'alert', 'error']),
  };
  var helperDelegate = require('../../../src/lib/helpers/log');

  beforeEach(function() {
    this.level = 'info';
    this.message = 'Something something message';
    this.element = {
      id: 'foo',
    };
  });

  describe('with missing arguments', function() {
    it(
      'should be undefined when "level" argument is missing',
      function() {
        var result = helperDelegate();
        expect(result).toBeUndefined();
      }
    );

    it(
      'should be undefined when "message" argument is missing',
      function() {
        var result = helperDelegate(this.level);
        expect(result).toBeUndefined();
      }
    );
  });

  describe('with valid arguments', function() {
    it(
      'logs a message for the level',
      function() {
        helperDelegate(this.level, this.message);
        var result = global.turbine.logger[this.level];
        expect(result).toHaveBeenCalledWith(this.message + '.');
      }
    );

    it(
      'logs a message for the level with optional element',
      function() {
        helperDelegate(this.level, this.message, this.element);
        var result = global.turbine.logger[this.level];
        expect(result).toHaveBeenCalledWith(
          'Player ID ' + this.element.id + ': ' + this.message + '.'
        );
      }
    );

    it(
      'logs a message for the level without the element ID when "element" is invalid',
      function() {
        this.element = {};
        helperDelegate(this.level, this.message, this.element);
        var result = global.turbine.logger[this.level];
        expect(result).toHaveBeenCalledWith(this.message + '.');
      }
    );
  });
});
