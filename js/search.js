var VIDEO_BASE = 'https://www.youtube.com/embed/';
var META_BASE = 'https://www.googleapis.com/youtube/v3/videos';
var SEARCH_BASE = 'https://www.googleapis.com/youtube/v3/search';
var RELATED_BASE = 'https://developers.google.com/apis-explorer/#p/youtube/v3/youtube.search.list';
var API_KEY = "38RZbrBm78K0K7O5IOuJrH4db7-UFhtKpHWBzmFM";
var BASE_KEY = "AIzaSyA-_35pvz44BvBsUNIKV8Kgs4GCEneQ4a4";
var BASE_FINDERS = " lyrics ";
var PRE = "<span class=\"pre\">Now playing...</span><br>";
var QS_DATA = "?hl=en&amp;autoplay=1&amp;cc_load_policy=0&amp;loop=1&amp;iv_load_policy=0&amp;fs=0&amp;showinfo=0";

//window.downloadAudio = function(query) {
//    // Example with `filter` option.
//    var url = VIDEO_BASE + query;
//    ytdl(url, { filter: function(format) { return format.container === 'mp4'; } })
//        .pipe(fs.createWriteStream('vide.mp4'));
//}

if (screen.width <= 800) {
    debugger;
    window.location = "../mobile.html";
}


var searchQuery = function(event, query) {

    var keypress = event ? event : window.event;
    var vtime = null;
    var videoHistory = [];

    if (keypress.keyCode !== 13 && keypress != null) return;
    hideVisual();
    window.clearTimeout(vtime);

    var options = [];
    options.url = SEARCH_BASE;
    options.type = 'GET';
    options.data = {
        part: 'snippet, snippet',
        key: BASE_KEY,
        api_key: API_KEY,
        maxResults: 1,
        type: 'video',
        videoEmbeddable: 'true',
        q: query + " " +BASE_FINDERS
    };

    function convert_time(duration) {
        var a = duration.match(/\d+/g);

        if (duration.indexOf('M') >= 0 && duration.indexOf('H') == -1 && duration.indexOf('S') == -1) {
            a = [0, a[0], 0];
        }

        if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1) {
            a = [a[0], 0, a[1]];
        }
        if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1 && duration.indexOf('S') == -1) {
            a = [a[0], 0, 0];
        }

        duration = 0;

        if (a.length == 3) {
            duration = duration + parseInt(a[0]) * 3600;
            duration = duration + parseInt(a[1]) * 60;
            duration = duration + parseInt(a[2]);
        }

        if (a.length == 2) {
            duration = duration + parseInt(a[0]) * 60;
            duration = duration + parseInt(a[1]);
        }

        if (a.length == 1) {
            duration = duration + parseInt(a[0]);
        }
        return duration
    }

    function getRandom(min, max) {
        return Math.round( Math.random() * (max - min) + min);
    }

    function playNextSong(data) {
        //console.log('RELATED_VIDEOS');
        //console.log(data);
        if (!data) return;
        var rand = getRandom(0, 5);
        data.random = rand;
        successCallback(data);
    }

    function getNextSong(vindex) {
        //get next song
        options = [];
        options.url = SEARCH_BASE;
        options.type = 'GET';

        options.data = {
            part: 'snippet',
            key: BASE_KEY,
            api_key: API_KEY,
            maxResults: 6,
            type: 'video',
            relatedToVideoId: vindex
        };
        window.clearTimeout(vtime);
        sendAjaxRequest(options, playNextSong);
    }

    function returnDuration(data) {
        var duration = data.items[0].contentDetails ? data.items[0].contentDetails['duration'] : 'ERROR';
        var vindex = data.items[0].id ? data.items[0].id : 'ERROR';
        //console.log(duration);
        if (duration != 'ERROR') {
            var timeout = convert_time(duration);
            //timeout = 6000;
            timeout = timeout * 1000;
            window.clearTimeout(vtime);
            vtime = window.setTimeout(function() {
                getNextSong(vindex);
            },timeout);
        }
    }

    var getDurationAndNextSong = function(vindex) {
        //get duration
        options = [];
        options.url = META_BASE;
        options.type = 'GET';
        options.data = {
            part: 'contentDetails',
            key: BASE_KEY,
            api_key: API_KEY,
            type: 'video',
            id: vindex
        };
        sendAjaxRequest(options, returnDuration);
    };

    var successCallback = function(data) {
        //console.log((data));
        if (data) {
            var rand = data.random ? data.random : 0;
            var vtitle = data.items[rand].snippet['title'];
            var vindex = data.items[rand].id['videoId'];
            if (videoHistory.indexOf(vindex) > -1) {
                debugger;
                data.random = getRandom(0, 5);
                console.log("ALREADY PLAYED: " + vtitle);
                window.clearTimeout(vtime);
                searchQuery(null, vtitle);
                //successCallback(data);
                return;
            }
            vtitle = vtitle.replace(/\(Lyrics\)/gi,'');
            vtitle = vtitle.replace(/Lyrics/gi,'');
            vtitle = vtitle.replace(/w\//gi,'');
            vtitle = vtitle.replace(/\+/gi,' ');
            vtitle = vtitle.replace(/\[/gi,'');
            vtitle = vtitle.replace(/]/gi,'');
            $('div#search_result').html(PRE+"<span id=\"srtitle\">"+vtitle+"</span>");
            $('iframe#front_player').attr('src', VIDEO_BASE + vindex + QS_DATA);
            videoHistory.push(vindex);
            console.log(videoHistory);
            window.setTimeout(showVisual, 2000);
            $("#myInp").trigger("blur");
            getDurationAndNextSong(vindex);
        }
    };

    sendAjaxRequest(options, successCallback);

};



function sendAjaxRequest(options, successCallback) {
    $.ajax({
        url: options.url ? options.url : 'ERROR',
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Accept", "*/*");
            xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
        },
        type: options.type ? options.type : 'GET',
        dataType: 'json',
        contentType: 'application/json',
        processData: true,
        data: options.data ? options.data : {},
        success: successCallback ? successCallback : function(data) {
            console.log("SUCCESS");
            console.log(JSON.stringify(data));
        },
        error: options.error ? options.error : function(data){
            console.log("Cannot get data");
            console.log(JSON.stringify(data));
        }
    });
}

var showVisual = function() {
    $('#bars').show();
};

var hideVisual = function() {
    $('#bars').hide();
};