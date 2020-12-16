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
    "name": "Page Top",
    "events": [{
      "modulePath": "sandbox/pageTop.js",
      "settings": {}
    }],
    "actions": [{
      "modulePath": "youtube-playback/src/lib/actions/enableVideoPlaybackTracking.js",
      "settings": {
        "elementSpecificity": "any",
        "elementsSelector": "",
        "loadYoutubeIframeApi": "yes"
      }
    }]
  }, {
    "id": "RL1608090868708",
    "name": "YouTube Player Ready, YouTube Video Playing, YouTube Video Paused",
    "events": [{
      "modulePath": "youtube-playback/src/lib/events/playerReady.js",
      "settings": {}
    }, {
      "modulePath": "youtube-playback/src/lib/events/videoPlaying.js",
      "settings": {}
    }, {
      "modulePath": "youtube-playback/src/lib/events/videoPaused.js",
      "settings": {}
    }],
    "actions": [{
      "modulePath": "sandbox/logEventInfo.js",
      "settings": {}
    }]
  }],
  "property": {
    "name": "Sandbox property",
    "settings": {
      "domains": ["adobe.com", "example.com"],
      "linkDelay": 100,
      "trackingCookieName": "sat_track",
      "undefinedVarsReturnEmpty": false
    }
  },
  "company": {
    "orgId": "ABCDEFGHIJKLMNOPQRSTUVWX@AdobeOrg"
  },
  "buildInfo": {
    "turbineVersion": "26.0.2",
    "turbineBuildDate": "2020-12-16T03:56:06.609Z",
    "buildDate": "2020-12-16T03:56:06.609Z",
    "environment": "development"
  }
}