2.4.0 (released 25 October 2022)
----------------------------------

- Improved calculation of played segment and total times.
- Refactored code to move video milestone compilation into its own module.
- Renamed variables to be video platform-agnostic.

2.3.0 (released 13 September 2022)
----------------------------------

- Improved enabling of YouTube players by removing dependency on onYouTubeIframeAPIReady(), in favour of using exponential backoff to check for valid YT object up to 5 times (about up to 30 seconds).
- Fixed `coral-select` value.
- Updated JavaScript code to conform with [Airbnb's style guide](https://github.com/airbnb/javascript).

2.2.0 (released 2 June 2022)
----------------------------

- Stop heartbeat and delete YouTube player object when the player has been removed from the DOM tree or when the window has been unloaded.
- Added "Player Removed" event type to track when a video player has been removed from the DOM tree or when the window has been unloaded.
- Added "Video Played Segment Time" and "Video Played Total Time" data element types to retrieve the elapsed time when the video was last played and total elapsed time when the video was being played respectively.
- Updated "Video Current Time" and "Video Duration" data element types to be of integer type.
- Updated JavaScript code in views and unit tests to ES6.
- Refactored some code.

2.1.0 (released 8 March 2022)
-----------------------------

- Added support for live videos (live broadcasts, live streams, Premieres).
- Added "Video Type" data element type to retrieve the video type: `"live"` or `"video-on-demand"`.
- Added milestone tracking for live videos, based on when the video starts playing.

2.0.1 (released 28 September 2021)
----------------------------------

- Rewrote triggering logic to reduce the browser's memory usage.
- Updated views' styles to use [Adobe Coral 4.5.0](https://opensource.adobe.com/coral-spectrum/documentation/).
- Added validation properties in `extension.json`.

2.0.0 (rejected by Adobe)
-------------------------

1.5.1 (released 19 March 2021)
------------------------------

- Fixed enabling video playback tracking.

1.5.0 (released 30 January 2021)
--------------------------------

- Added "Video Milestone" event type to track video playback at fixed thresholds.
- Added "Video Milestone" data element type to retrieve the video milestone with the "Video Milestone" event type.
- Updated "Video Playing" event type to track specific events for video started, video resumed, and video replayed events.
- Added "Video ID" and "Video Title" data element types.
- Improved enabling video playback tracking when there is a network delay / timeout.
- Added donation-related links in all views' footers.
- Added unit tests.

1.4.0 (released 16 December 2020)
---------------------------------

- Added data element types to retrieve video playback data using Adobe Launch's familiar interface, instead of via the clunky `event` code.
- Allows YouTube IFrame elements to be prepared properly when the web page's URL includes a port in the host.
- Fixed "Playback Quality Changed" and "Playback Rate Changed" events.
- Added support-related links in all views' footers.

1.3.1 (released 4 November 2020)
--------------------------------

- Fixed instructions in extension configuration view.

1.3.0 (released 3 November 2020)
--------------------------------

- Improved playback tracking on slow network connections.
- Allows YouTube IFrame API script to be loaded with a Rule action. With this ability, loading the script when preparing the YouTube IFrame elements is optional.
- Hide legacy extension configuration settings if they are not being used.
- Bug fixes for Internet Explorer.

1.2.0 (released 29 September 2020)
----------------------------------

- Allows YouTube IFrame elements to be prepared with a Rule action. With this ability, the settings in the extension configuration are deprecated.

1.1.1 (released 29 July 2020)
-----------------------------

- Hide CSS selector when choosing "any player" in extension configuration.

1.1.0 (released 24 July 2020)
-----------------------------

- Prepares YouTube IFrame elements at Window Loaded by default. This ensures that the browser loads all of the page's content, including the YouTube players, before enabling the YouTube IFrame API.

1.0.1 (released 22 July 2020)
-----------------------------

- Fixed issues found with `eslint`.
- Documented `event.state` in each Event's view.

1.0.0 (released 11 July 2020)
-----------------------------

- Prepares YouTube IFrame elements with the required `enablejsapi` and `origin` parameters.
- Detects player and playback events, including Player Ready, Playing, Paused, Ended, etc.
- Set a selector in the extension configuration to limit which YouTube players to track.
