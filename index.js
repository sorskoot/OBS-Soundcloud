(function () {
    var socket = io('http://127.0.0.1:1337');

    var src;
    var played = [];

    socket.on('action', function (data) {
        console.log(`action received: ${data.action}`)
        switch (data.action) {
            case 'stop':
                src.player.pause();
                socket.emit('broadcast', { message: 'paused' });
                break;
            case 'skip':
                next();
                break;
            case 'play':
                play();
                break;
            case 'playlist': {
                resetPlaylist(data.url);
            }
        }
    });

    function next() {
        var count = 0;
        do {
            currentTrack = Math.random() * tracks.length | 0;
            count++;
        } while (count < 50 && ~played.indexOf(currentTrack))

        play(true);
    }

    function play(next) {
        if (src) {
            if (src.player.paused && !next) {
                src.player.play();
            } else {
                played.push(currentTrack);
                src.player.setAttribute('src', tracks[currentTrack].stream);
                src.player.play();
                socket.emit('song', { song: tracks[currentTrack].title });
            }
        }
    }

    let tracks = [];
    let currentTrack = 0;
    
    SC.initialize({
        client_id: window.clientId
    });

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    function resetPlaylist(url) {
        played = [];
        new Promise((res, rej) => {
            SC.get('/resolve', { url: url })
                .then(function (sound) {
                    tracks = sound.tracks.map(d => {
                        return {
                            art: d.artwork_url,
                            stream: d.stream_url + '?client_id=' + window.clientId,
                            title: d.title,
                            artist: d.user.username
                        };
                    });
                    currentTrack = Math.random() * tracks.length | 0;
                    socket.emit('song', { song: tracks[currentTrack].title });
                    src = new SoundCloudAudioSource($("#player")[0]);
                    draw();
                    res();
                }, (err) => {
                    socket.emit('broadcast', { message: 'error' + err.message });
                }
                );
        });
    }
    var SoundCloudAudioSource = function (player) {
        var self = this;
        var analyser;
        var audioCtx = new (window.AudioContext || window.webkitAudioContext);
        const min = -100;
        const max = 0;

        analyser = audioCtx.createAnalyser();
        analyser.minDecibels = min;
        analyser.maxDecibels = max;
        analyser.fftSize = 32;
        analyser.smoothingTimeConstant = 0.7;
        player.crossOrigin = "anonymous";
        var source = audioCtx.createMediaElementSource(player);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        var $m = $("#meter")

        let off = ctx.createLinearGradient(0, 0, 0, 8);
        off.addColorStop(0, "#393f41");
        off.addColorStop(1, "#191f21");

        var sampleAudioStream = function () {
            analyser.getByteFrequencyData(self.streamData);
            // calculate an overall volume value
            var total = 0;
            // for (var i = 0; i < 80; i++) { // get the volume from the first 80 bins, else it gets too loud with treble
            //     total += self.streamData[i];
            // }
            ctx.clearRect(0, 0, 320, 400);
            let avgs = [];

            for (let i = 0; i < 4; i++) {
                let sum = 0;
                for (let j = 0; j < 8; j++) {
                    sum += self.streamData[i * j];
                }
                avgs.push(sum / 8);
            }

            for (let i = 0; i < 4; i++) {
                //   var db =256*Math.log(Math.max(self.streamData[i],Math.pow(10,-72/20)))/Math.LN10;
                //let val = (avgs[i] / 8 | 0) * 8 / 255; 
                //ctx.fillRect(i * 32, 256 - val, 30, val);

                for (let j = 0; j < 21; j++) {
                    if (j < avgs[i] / 12) {
                        ctx.shadowBlur = 5;
                        ctx.shadowColor = "#4cddff";
                        ctx.fillStyle = "#4cddff";
                    } else {
                        ctx.shadowBlur = 0;
                        ctx.fillStyle = off;
                    }


                    ctx.fillRect(i * 24 + 10, 340 - (j * 18) + 10, 22, 10);
                }
            }
            //  self.volume = (total / 80.0);
            //   $m.val(src.volume);
        };
        setInterval(sampleAudioStream, 20);
        // public properties and methods
        this.volume = 0;
        this.streamData = new Uint8Array(128);


        player.addEventListener('ended', function () {
            next();
        });
        next();
        this.player = player;
    };

    // var draw = function() {
    //     if(src)$("#meter").val(src.volume);
    //     window.requestAnimationFrame(draw);
    // };

    resetPlaylist('https://soundcloud.com/twitchfm/sets/twitch-music-library-1');
})();