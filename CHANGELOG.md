1.3.1
-----

- Fixed instructions in extension configuration view.

1.3.0
-----

- Improves playback tracking on slow network connections.
- Allows YouTube IFrame API script to be loaded with a Rule action. With this ability, loading the script when preparing the YouTube IFrame elements is optional.
- Hide legacy extension configuration settings  if they are not being used.
- Bug fixes for Internet Explorer.

1.2.0
-----

- Allows YouTube IFrame elements to be prepared with a Rule action. With this ability, the settings in the extension configuration are deprecated.

1.1.1
-----

- Hide CSS selector when choosing "any player" in extension configuration.

1.1.0
-----

- Prepares YouTube IFrame elements at Window Loaded by default. This ensures that the browser loads all of the page's content, including the YouTube players, before enabling the YouTube IFrame API.

1.0.1
-----

- Fixed issues found with `eslint`.
- Documented `event.state` in each Event's view.

1.0.0
-----

- Prepares YouTube IFrame elements with the required `enablejsapi` and `origin` parameters.
- Detects player and playback events, including Player Ready, Playing, Paused, Ended, etc.
- Set a selector in the extension configuration to limit which YouTube players to track.