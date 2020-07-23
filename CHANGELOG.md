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