module.exports = {
  "extensions": {
    "youtube-playback": {
      "displayName": "YouTube Playback",
      "settings": {
        "useLegacySettings": "no",
        "elementSpecificity": "any",
        "elementsSelector": "",
        "loadYoutubeIframeApi": "yes",
        "windowEvent": "window-loaded"
      }
    }
  },
  "dataElements": {
    "YouTube player state": {
      "settings": {},
      "cleanText": false,
      "forceLowerCase": false,
      "modulePath": "youtube-playback/src/lib/dataElements/playerState.js",
      "storageDuration": ""
    },
    "YouTube video current time": {
      "settings": {},
      "cleanText": false,
      "forceLowerCase": false,
      "modulePath": "youtube-playback/src/lib/dataElements/videoCurrentTime.js",
      "storageDuration": ""
    },
    "YouTube video duration": {
      "settings": {},
      "cleanText": false,
      "forceLowerCase": false,
      "modulePath": "youtube-playback/src/lib/dataElements/videoDuration.js",
      "storageDuration": ""
    }
  },
  "rules": [{
    "id": "RL1608090626599",
    "name": "Page Top, Click",
    "events": [{
      "modulePath": "sandbox/pageTop.js",
      "settings": {}
    }, {
      "modulePath": "sandbox/click.js",
      "settings": {}
    }],
    "actions": [{
      "modulePath": "youtube-playback/src/lib/actions/enableVideoPlaybackTracking.js",
      "settings": {
        "elementSpecificity": "specific",
        "elementsSelector": "iframe",
        "loadYoutubeIframeApi": "yes"
      }
    }]
  }, {
    "id": "RL1608090868708",
    "name": "Player Ready, Player Removed, Video Playing, Video Paused, Video Ended, Video Unstarted, Playback Quality Changed, Autoplay Blocked",
    "events": [{
      "modulePath": "youtube-playback/src/lib/events/playerReady.js",
      "settings": {}
    }, {
      "modulePath": "youtube-playback/src/lib/events/playerRemoved.js",
      "settings": {}
    }, {
      "modulePath": "youtube-playback/src/lib/events/videoPlaying.js",
      "settings": {
        "trackStarted": "yes",
        "trackResumed": "yes",
        "trackReplayed": "yes",
        "doNotTrack": "yes"
      }
    }, {
      "modulePath": "youtube-playback/src/lib/events/videoPaused.js",
      "settings": {}
    }, {
      "modulePath": "youtube-playback/src/lib/events/videoEnded.js",
      "settings": {}
    }, {
      "modulePath": "youtube-playback/src/lib/events/videoUnstarted.js",
      "settings": {}
    }, {
      "modulePath": "youtube-playback/src/lib/events/playbackQualityChanged.js",
      "settings": {}
    }, {
      "modulePath": "youtube-playback/src/lib/events/autoplayBlocked.js",
      "settings": {}
    }],
    "actions": [{
      "modulePath": "sandbox/logEventInfo.js",
      "settings": {}
    }]
  }, {
    "id": "RL1611236793890",
    "name": "YouTube Milestone 25%, 50%, 75%, 90%, and 5, 10, 15 seconds",
    "events": [{
      "modulePath": "youtube-playback/src/lib/events/videoMilestone.js",
      "settings": {
        "fixedMilestoneAmounts": [25, 50, 75, 90],
        "fixedMilestoneUnit": "percent"
      }
    }, {
      "modulePath": "youtube-playback/src/lib/events/videoMilestone.js",
      "settings": {
        "fixedMilestoneAmounts": [5, 10, 15],
        "fixedMilestoneUnit": "seconds"
      }
    }],
    "actions": [{
      "modulePath": "sandbox/logEventInfo.js",
      "settings": {}
    }]
  }],
  "property": {
    "name": "Sandbox property",
    "settings": {
      "id": "PR12345",
      "domains": ["adobe.com", "example.com"],
      "linkDelay": 100,
      "trackingCookieName": "sat_track",
      "undefinedVarsReturnEmpty": false
    }
  },
  "company": {
    "orgId": "ABCDEFGHIJKLMNOPQRSTUVWX@AdobeOrg"
  },
  "environment": {
    "id": "EN00000000000000000000000000000000",
    "stage": "development"
  },
  "buildInfo": {
    "turbineVersion": "27.5.0",
    "turbineBuildDate": "2024-04-19T16:07:00.614Z",
    "buildDate": "2024-04-19T16:07:00.614Z",
    "environment": "development"
  }
}