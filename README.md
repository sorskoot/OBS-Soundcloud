# OBS-Soundcloud
A player for SoundCloud playlists that can be used during live streams. It includes an Analyzer to show inside OBS (https://obsproject.com/) with a remote control. NodeJS runs on the server. Communication is done 

# Usage
To get the player to work you need a clientId from SoundCloud. You can create one at http://developer.soundcloud.com. Rename the exampleConfig.js file to config.js and place the clientId inside there. Also, run _NPM install_ before running.

To start type at command line: Node Server 

Add a browser window to OBS and add http://127.0.0.1:1337 as the URL.
http://127.0.0.1:1337/remote.html controls the music.

You can also add a Text to your OBS scene and use the currentlyPlaying.txt file in there. The currently playing file will be inside there.

![alt example](http://www.timmykokke.com/analyser.gif)
