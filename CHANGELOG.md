# Changelog

## 2.10.2 - 2025-03-14

### Fixed

- Check for next milestone with _all_ "Video Playing" events.

## 2.10.1 - 2025-02-28

### Fixed

- Do not process "Player Ready" event if the other event that is being processed is "Player Removed".

## 2.10.0 - 2025-02-14

### Changed

- Check for a previously-created `player` object before creating a new one.
- Use event listeners to attach functions to the `player` object.
- Process "Player Ready" event if another event is being processed when the `onReady` listener had failed to run for this `player` object.

### Fixed

- Check that next milestone exists before getting its time.

## 2.9.0 - 2025-01-17

### Changed

- Reduce heartbeat time from 500ms to 250ms.

### Added

- Improve milestone tracking by setting the next milestone from the current time to lookup later, instead of detecting milestones during each time update.

## 2.8.0 - 2024-12-06

### Added

- Add option in "Enable YouTube Video Playback Tracking" view to let the user prevent the `origin` parameter from being added to the IFRAME element's `src` attribute.
- Detect changes to the IFRAME element's `src` attribute to trigger "Player Removed" event.
- Check the IFRAME element's `enablejsapi` attribute to determine if the video has been enabled with the YouTube IFrame API.

## 2.7.0 - 2024-06-05

### Changed

- Refactor code for registering IFRAME elements.

### Fixed

- Verify that IFRAME elements have `src` attribute containing `"youtube"`.

### Added

- Add "Autoplay Blocked" event type to track when autoplay has been blocked.

## 2.6.2 - 2023-08-16

### Fixed

- Resolved another error that occurred with "Video Playing" event.

## 2.6.1 - 2023-08-02

### Fixed

- Resolved error that occurred with "Video Playing" event.

## 2.6.0 - 2023-07-12

### Changed

- Refactor code for getting data for data elements to its own module.
- Refactor code for enabling tracking in YouTube players to its own module.
- In "Video Playing" view, clarify what it means to _not_ track the event when other options have been selected.

### Fixed

- Ensure that a "Video Playing" event gets sent even when "Video Started", "Video Resumed" or "Video Replayed" event has been selected.

### Added

- Log an error when calling `_satellite.getVar()` to retrieve a data element, but without supplying the `event` argument.
- Log an error when expected inputs are invalid.

## 2.5.0 - 2023-01-05

### Changed

- Add a flag when enabling a video player with the YouTube IFrame API.

### Added

- Bundle Adobe Coral for faster loading of styles.

## 2.4.0 - 2022-10-25

### Changed

- Improve calculation of played segment and total times.
- Refactor code to move video milestone compilation into its own module.
- Rename variables to be video platform-agnostic.

## 2.3.0 - 2022-09-13

### Changed

- Improve enabling of YouTube players by removing dependency on onYouTubeIframeAPIReady(), in favour of using exponential backoff to check for valid `YT` object up to 5 times (about up to 30 seconds).
- Update JavaScript code to conform with [Airbnb's style guide](https://github.com/airbnb/javascript).

### Fixed

- Fix `coral-select` value.

## 2.2.0 - 2022-06-02

### Changed

- Stop heartbeat and delete YouTube player object when the player has been removed from the DOM tree or when the window has been unloaded.
- Update "Video Current Time" and "Video Duration" data element types to be of integer type.
- Update JavaScript code in views and unit tests to ES6.
- Refactor some code.

### Added

- Add "Player Removed" event type to track when a video player has been removed from the DOM tree or when the window has been unloaded.
- Add "Video Played Segment Time" and "Video Played Total Time" data element types to retrieve the elapsed time when the video was last played and total elapsed time when the video was being played respectively.

## 2.1.0 - 2022-03-08

### Added

- Add support for live videos (live broadcasts, live streams, Premieres).
- Add "Video Type" data element type to retrieve the video type: `"live"` or `"video-on-demand"`.
- Add milestone tracking for live videos, based on when the video starts playing.

## 2.0.1 - 2021-09-28

### Changed

- Rewrite triggering logic to reduce the browser's memory usage.
- Update views' styles to use [Adobe Coral 4.5.0](https://opensource.adobe.com/coral-spectrum/documentation/).
- Add validation properties in `extension.json`.

## 2.0.0 - rejected by Adobe

## 1.5.1 - 2021-03-19

### Fixed

- Fix enabling video playback tracking.

## 1.5.0 - 2021-01-30

### Changed

- Improve enabling video playback tracking when there is a network delay / timeout.

### Added

- Add "Video Milestone" event type to track video playback at fixed thresholds.
- Add "Video Milestone" data element type to retrieve the video milestone with the "Video Milestone" event type.
- Add "Video ID" and "Video Title" data element types.
- Update "Video Playing" event type to track specific events for video started, video resumed, and video replayed events.
- Add donation-related links in all views' footers.
- Add unit tests.

## 1.4.0 - 2020-12-16

### Added

- Add data element types to retrieve video playback data using Adobe Launch's familiar interface, instead of via the clunky `event` code.
- Add support-related links in all views' footers.

### Fixed

- Allow YouTube IFrame elements to be prepared properly when the web page's URL includes a port in the host.
- Fix "Playback Quality Changed" and "Playback Rate Changed" events.

## 1.3.1 - 2020-11-04

### Fixed

- Fix instructions in extension configuration view.

## 1.3.0 - 2020-11-03

### Changed

- Improve playback tracking on slow network connections.
- Hide legacy extension configuration settings if they are not being used.

### Fixed

- Fix bugs for Internet Explorer.

## 1.2.0 - 2020-09-29

### Added

- Allow YouTube IFrame elements to be prepared with a Rule action. With this ability, the settings in the extension configuration are deprecated.

## 1.1.1 - 2020-07-29

### Changed

- Hide CSS selector when choosing "any player" in extension configuration.

## 1.1.0 - 2020-07-24

### Changed

- Prepare YouTube IFrame elements at Window Loaded by default. This ensures that the browser loads all of the page's content, including the YouTube players, before enabling the YouTube IFrame API.

## 1.0.1 - 2020-07-22

### Changed

- Document `event.state` in each Event's view.

### Fixed

- Fix issues found with `eslint`.

## 1.0.0 - 2020-07-11

### Added

- Prepare YouTube IFrame elements with the required `enablejsapi` and `origin` parameters.
- Detect player and playback events, including Player Ready, Playing, Paused, Ended, etc.
- Set a selector in the extension configuration to limit which YouTube players to track.
