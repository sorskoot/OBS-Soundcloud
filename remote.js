(function () {
    var socket = io('http://127.0.0.1:1337');
    
    socket.on('message', function (data) {
        document.querySelector('#message').innerHTML = data.message;
    });

    socket.on('song', function (data) {
        document.querySelector('#currentSong').innerHTML = data.song;
    });

    document.querySelector('#play-button').addEventListener('click', (e) => {
        socket.emit('remote control', { action: 'play' });
    });
    document.querySelector('#stop-button').addEventListener('click', (e) => {
        socket.emit('remote control', { action: 'stop' });
    });
    document.querySelector('#skip-button').addEventListener('click', (e) => {
        socket.emit('remote control', { action: 'skip' });
    });

    document.querySelector('#submit-button').addEventListener('click', (e) => {
        socket.emit('remote control', { action: 'playlist',url: document.querySelector('#url').value});
    });

})();