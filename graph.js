'use strict';

let localStream = null;
let peer = null;
let existingCall = null;


var credential = document.getElementById('credential').innerText
var get_id = document.getElementById('get_id').innerText



navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(function (stream) {
        // Success
        $('#my-video').get(0).srcObject = stream;
       
        localStream = stream;
    }).catch(function (error) {
        // Error
        console.error('mediaDevice.getUserMedia() error:', error);
        return;
    });


var apikey = '___Your_API_Key___' // for Skyway

peer = new Peer(
    get_id, {
        key: apikey,
        credential: credential
    });

peer.on('open', function () {
    $('#my-id').text(peer.id);
});

peer.on('error', function (err) {
    alert(err.message);
});

peer.on('close', function () {
});

peer.on('disconnected', function () {
});

$('#make-call').submit(function (e) {
    e.preventDefault();
    const call = peer.call($('#callto-id').val(), localStream);
    setupCallEventHandlers(call);
});

$('#end-call').click(function () {
    existingCall.close();
});

peer.on('call', function (call) {
    call.answer(localStream);
    setupCallEventHandlers(call);
});

function setupCallEventHandlers(call) {
    if (existingCall) {
        existingCall.close();
    };

    existingCall = call;

    call.on('stream', function (stream) {
        addVideo(call, stream);
        setupEndCallUI();
        $('#their-id').text(call.remoteId);
    });
    call.on('close', function () {
        removeVideo(call.remoteId);
        setupMakeCallUI();
    });
}

function addVideo(call, stream) {
    var stream = stream;
    $('#their-video').get(0).srcObject = stream;
}

function removeVideo(peerId) {
    $('#' + peerId).remove();
}

function setupMakeCallUI() {
    $('#make-call').show();
    $('#end-call').hide();
}

function setupEndCallUI() {
    $('#make-call').hide();
    $('#end-call').show();
}

    var now = performance.now();

    const video_canvas_w = 640; // default 640
    const video_canvas_h = Math.round(video_canvas_w * (3 / 4)); // default 480


    let ctracker = new clm.tracker();

    // video
    let video = document.getElementById('their-video');
    video.width = video_canvas_w;
    video.height = video_canvas_h;

    // canvas
    let video_canvas = document.getElementById('from-video');
    let video_canvas_ctx = video_canvas.getContext('2d');
    video_canvas.width = video_canvas_w;
    video_canvas.height = video_canvas_h;
    let video_track = null;

    // Load video
    load();

    function load() {

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(load_success)
            .catch(load_fail);
    }

    function load_success(stream) {
        video_track = stream.getVideoTracks()[0];
        video.srcObject = stream;
    }

    function load_fail(err) {
        alert(err);
        console.log(err);
    }

    // “®‰æÄ¶‚ÌƒCƒxƒ“ƒgŠÄŽ‹
    let tracking_started = false;
    video.addEventListener('playing', function () {
        if (tracking_started === true) {
            return;
        }
        init_ctracker();
        draw_loop();


        video.onresize = function () {
            ctracker.stop();
            ctracker.reset();
            ctracker.start(video);
        }

        tracking_started = true;
    });

    function init_ctracker() {
        ctracker.init();
        ctracker.start(video);

    }

    function draw_loop() {
        // requestAnimationFrameは再描画するときに使うメソッド
        requestAnimationFrame(draw_loop);

        let w = video_canvas.width;
        let h = video_canvas.height;
        // これは消しているキャンバスを
        video_canvas_ctx.clearRect(0, 0, w, h);
        // 再描画している処理
        video_canvas_ctx.drawImage(video, 0, 0, w, h);
        // 恐らくこれは顔に線をつけている処理
        ctracker.draw(video_canvas);
        // これは取得した点たちを取得している
        const positions = ctracker.getCurrentPosition();


        if (positions !== false) {
            //19/5/10 ˆÀH’Ç‹L
            coordinate(positions);
            
            ajaxpost(positions);

            update();

        } else {
        }


    }
    //19/5/10 ˆÀH’Ç‹L
    function coordinate(positions) {

        let coordinate = document.getElementById("coordinate");

        coordinate.innerHTML = "";

        for (let i = 0; i < 71; i++) {

            let coordinate_Xface = "coordinate_" + i + "Xface";
            let coordinate_Yface = "coordinate_" + i + "Yface";
            // coordinate.insertAdjacentHTML('beforeend',"<div id='"+coordinate_Xface+"'></div>");
            coordinate.insertAdjacentHTML('beforeend', "<div id = " + coordinate_Xface + " class = 'fd'><span>" + i + "‚ÌXÀ•W</span><span>" + positions[i][0] + "</span></div>");
            coordinate.insertAdjacentHTML('beforeend', "<div id = " + coordinate_Yface + " class = 'fd'><span>" + i + "‚ÌYÀ•W</span><span>" + positions[i][1] + "</span></div>");
        }
    }


   function ajaxpost(positions){
    //レスポンス
    var response = {};

    //リクエスト
    let posi = {positions : positions};

    //ajax
    $.ajax({
      url:'/detection',
      type:"POST",
      data:JSON.stringify(posi),  //object -> json
      dataType:"json",
      contentType:'application/json',
      success: function(data) {
        //data = JSON.parse(data);  //error
          let intercostal = JSON.parse(data.ResultSet).intercostal;
          let mouth = JSON.parse(data.ResultSet).mouth;
          let inin = JSON.parse(data.ResultSet).inin;
          let stress = JSON.parse(data.ResultSet).stress;
          generateData(intercostal, mouth, inin, stress);
      },
      error       : function(XMLHttpRequest, textStatus, errorThrown) {
        console.log("リクエスト時になんらかのエラーが発生しました\n" + url + "\n" + textStatus +":\n" + errorThrown);
      }
    });

    //表示
    // console.log(response);
}

    //˜^‰æˆ—
    //19/5/8ˆÀH’Ç‹L
    startRecorder();

    let startbutton = document.getElementById('startbutton');
    let stopbutton = document.getElementById('stopbutton');
    let downloadbutton = document.getElementById('download');
    let record_data = [];

    startbutton.addEventListener('click', function (ev) {
        recorder.start()
        ev.preventDefault()
    }, false);
    stopbutton.addEventListener('click', function (ev) {
        recorder.stop()
    })
    downloadbutton.addEventListener('click', function (ev) {
        console.log(record_data)
        var blob = new Blob(record_data, { type: 'video/webm' })
        var url = window.URL.createObjectURL(blob)
        var a = document.createElement('a')
        document.body.appendChild(a)
        a.style = 'display:none'
        a.href = url;
        a.download = 'test.webm'
        a.click()
        window.URL.revokeObjectURL(url)
    })

    function startRecorder() {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(function (stream) {
                
                recorder = new MediaRecorder(stream);
                recorder.ondataavailable = function (e) {
                    //I—¹‚µ‚½ƒ^ƒCƒ~ƒ“ƒO‚Å
                    let testvideo = document.getElementById('test');
                    testvideo.setAttribute('controls', '')
                    testvideo.setAttribute('width', video_canvas_w)
                    testvideo.setAttribute('height', video_canvas_h)
                    var outputdata = window.URL.createObjectURL(e.data)
                    record_data.push(e.data)
                    testvideo.src = outputdata
                }
            }
            )
    }

    var end = performance.now();
    console.log('ŽÀsŽžŠÔ = ' + (end - now) + 'ƒ~ƒŠ•b');


    //ˆÈ‰º19/5/10ƒOƒ‰ƒt—p’Ç‰Á
    var dataset = [];



    function generateData(intercostal, mouth, inin, stress){
        const now = new Date();
        const data = {
            time: now,
            intercostal: intercostal,
            mouth: mouth,
            inin: inin,
            stress: stress
        };
        dataset.push(data)
    }
    //xŽ²‚ÍŽžŠÔ‚ÌƒXƒP[ƒ‹‚É‚È‚é‚æ‚¤‚ÉÝ’è
    var margin = {
        top: 30,
        right: 50,
        bottom: 30,
        left: 50
    };
    var width = 600 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    var xScale = d3.time.scale()
        .range([0, width]);

    var yScale = d3.scale.linear()
        .range([height, 0])
        .domain([0, 10]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(10)
        .tickFormat(d3.time.format('%M:%S'));

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");

    var line1 = d3.svg.line()
        .x(function (d) {
            return xScale(d.time);
        })
        .y(function (d) {
            return yScale(d.intercostal);
        })
        .interpolate("cardinal");
    var line2 = d3.svg.line()
        .x(function (d) {
            return xScale(d.time);
        })
        .y(function (d) {
            return yScale(d.mouth);
        })
        .interpolate("cardinal");
    var line3 = d3.svg.line()
        .x(function (d) {
            return xScale(d.time);
        })
        .y(function (d) {
            return yScale(d.inin);
        })
        .interpolate("cardinal");
    var line4 = d3.svg.line()
        .x(function (d) {
            return xScale(d.time);
        })
        .y(function (d) {
            return yScale(d.stress);
        })
        .interpolate("cardinal");
    //svg‚Ì’è‹`
    var svg = d3.selectAll("#d3graph").append("svg")
        //‚±‚Ìd3‚Ì selectAll1ƒƒ\ƒbƒh‚É‚æ‚èAŠî‚Æ‚È‚éhtml‚Ì<div id="d3graph"> </div>‚È‚é—v‘f‚ðˆø‚Á’£‚Á‚Ä‚«‚Ü‚·
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    function update() {
        if (dataset.length > width / 20) {
            dataset.shift();
            // ƒf[ƒ^”‚ª20‚ð’´‚¦‚½‚ç“ü‚Á‚Ä‚¢‚éƒf[ƒ^‚ðÁ‚µ‚Ü‚·
        }
        svg.selectAll("path").remove();
        // xyŽ²íœ
        svg.selectAll("g").remove();
        // ü‚Ìíœ

        xScale.domain(d3.extent(dataset, function (d) {
            return d.time;
        }));
        yScale.domain([0,500]).nice();
        //xyŽ²‚»‚ê‚¼‚ê‚ÌƒhƒƒCƒ“‚ðdataset‚Ìmin, max‚Ì”ÍˆÍ‚ÉŽû‚ß‚Ü‚·

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("y", -10)
            .attr("x", 10)
            .style("text-anchor", "end")
            .text("’l");
        // yŽ²‚ÌÄ•`‰æ

        svg.append("g")
            .attr("class", "x axis")
            .call(xAxis)
            .attr("transform", "translate(0," + height + ")")
        // XŽ²‚ÌÄ•`‰æ

        // path—v‘f‚ðsvg‚É•\Ž¦‚µAÜ‚êüƒOƒ‰ƒt‚ðÝ’è
        svg.append("path")
            .datum(dataset)
            // line‚Ædataset‚Ìbind
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line1);

        svg.append("path")
            .datum(dataset)
            // line‚Ædataset‚Ìbind
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line2);

        svg.append("path")
            .datum(dataset)
            // line‚Ædataset‚Ìbind
            .attr("fill", "none")
            .attr("stroke", "green")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line3);

        svg.append("path")
            .datum(dataset)
            // line‚Ædataset‚Ìbind
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line4);
    };




