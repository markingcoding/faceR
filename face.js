
$(function () {
    let videoId = document.getElementById("video");
    let videoInput = $("#video")
    navigator.mediaDevices
        .getUserMedia({ video: true})
        // .then(stream => (console.log(stream)));
        .then(stream => (videoId.srcObject = stream));

    let canvasInput = document.getElementById("canvas");
    // MUST set with the same width with video, if NOT crop image will lost ratio!

    videoId.height = videoInput.height();
    videoId.width = videoInput.width();
    canvasInput.height = videoInput.height();
    canvasInput.width = videoInput.width();
    let ctx = canvasInput.getContext("2d");

    // const graph = document.getElementById("graph");
    const graph = $(".d3graph");

    let ctracker = new clm.tracker();
    ctracker.init();
    ctracker.start(videoId);

    let posX = 0;
    let posY = 0;
    let width = 0;
    let height = 0;

    const croppedImageTag = document.getElementById("croppedImage");
    let croppedImage = "";

    const resizedImageTag = document.getElementById("resizedImage");
    let resizedImage = "";
    let positions = null;
    let s123;
    let ki = ['a', 'b', 'A', 'K', 'I', 'A', 'U', 'N', '5', 'Z', 'H', 'X', 'I', 'Z', 'Q', 'C', 'D', 'S', 'C'].join("");
    ki = ki + 'J' + 'Z' + 3 + '12';
    ki = ki.substr(2);
    let ask = ['1', '2', 'D', 'x', 'w', 'R', 'H', '7', 'h', 'B', '5'].join("");
    let ask2 = ['e', 'r', 'Y', 'a/', 'c', 'i', 'h', 'xI/', 'd', 'O', 'c', 'K', 'u', 'y', 'C', 'W', 'y', '21', 'j', 'F', 'x', 'j', 'j', 'r', 'O', 'Y', 't'];
    ask = ask + ask2.join("") + '99';
    setupAws();
    function setupAws() {
        s123 = new AWS.S3({
            accessKeyId: ki.substr(0, 20),
            secretAccessKey: ask.substr(2, 40),
            signatureVersion: 'v4',
            apiVersion: '2006-03-01'
        });
    }
    function positionLoop() {
        requestAnimFrame(positionLoop);
        positions = ctracker.getCurrentPosition();
        // console.log(positions)
        if (positions && positions.length > 0) {
            const posX_original = _.minBy(positions, p => p[0])[0];
            const posY_original = _.minBy(positions, p => p[1])[1];
            const maxLeft = _.maxBy(positions, p => p[0])[0];
            const maxHeight = _.maxBy(positions, p => p[1])[1];
            const width_original = maxLeft - posX_original;
            const height_original = maxHeight - posY_original;

            // まゆげ以上比率、顎以下の比率
            const yPercentUp = 0.8, yPercentBottom = 0.1;
            let moveUp = height_original * yPercentUp;
            moveUp = moveUp > posY_original ? posY_original : moveUp; // 天丼になったら天丼使う
            posY = posY_original - moveUp; // Y上に移動

            let moveBottom = height_original * yPercentBottom;
            // newMaxHeight = (posY + height_original + heightBottom);
            // heightBottom = newMaxHeight > canvasInput.height ? canvasInput.height : newMaxHeight; // 天丼になったら天丼使う
            height = moveUp + height_original + moveBottom;

            posX = posX_original - (height - width_original) / 2;
            posX = posX > 0 ? posX : 0;
            width = height;

            // Ajust to get more Ears
            // if (height_original > width_original) {
            //     const xPercent = 0.1, yPercent = 0.6;
            //     const moreLefter = posX_original - width_original * xPercent;
            //     posX = moreLefter > 0 ? moreLefter : 0;
            //     const moreHeigter = posY_original - height_original * yPercent;
            //     posY = moreHeigter > 0 ? moreHeigter : 0;
            //     width = width_original * (1 + xPercent * 2);
            //     height = height_original * (1 + yPercent);
            // }

            // Ajust to face
            // width = width_original;
            // height = width;
            // posX = posX_original;
            // posY = posY_original;

        } else {
            resizedImage = '';
            // console.log('invalid face');
        }
    }
    positionLoop();

    let imageObj = new Image();
    function drawLoop() {
        requestAnimFrame(drawLoop);
        ctx.clearRect(0, 0, canvasInput.width, canvasInput.height);
        // ctracker.draw(canvasInput); //draw green face line
        // Draw my rect
        ctx.strokeStyle = "red";
        // ctx.strokeRect(posX, posY, width, height); // draw red square
        // console.log('Rect width=' + width, 'height=', height);

        ctx.drawImage(imageObj, posX + width - 32, posY);
        requestAnimFrame(crop_video);
    }
    drawLoop();


    window.FPS = 5;
    window.IS_SEND_IMG = true;
    window.IS_SEND_POS = true;
    window.IS_COMPRESS = true;

    // const ws = io.connect(getWsURL() + "/message");
    const sUrl = getWsURL();
    function sendCropImageToServer() {
        setInterval(() => {
            if (resizedImage) {
                if (!window.IS_SEND_IMG) {
                    return;
                }
                // Only send valid resized Image
                /*
                if (window.IS_COMPRESS) {
                    ws.compress(true).emit("face-image", resizedImage);
                } else {
                    ws.emit("face-image", resizedImage);
                }*/
                sendBucket(resizedImage);
                resizedImage = '';
            } else {
                console.log('Not send image data');
            }

        }, 1000 / window.FPS);

        var currectReq = null;
        setInterval(() => {
            if (positions && positions.length > 0) {
                if (!window.IS_SEND_POS) {
                    return;
                }
                // if (window.IS_COMPRESS) {
                //     ws.compress(true).emit("detection", positions);
                // } else {
                //     ws.emit("detection", positions);
                // }
                currectReq = null;
                currectReq = $.ajax({
                    type: 'POST',
                    url: sUrl + "/api/detection",
                    data: JSON.stringify( {data: positions} ),
                    contentType: "application/json",
                    dataType: 'json',
                    beforeSend: function() {
                        if (currectReq != null) {
                            currectReq.abort();
                        }
                    },
                    success: function(res) {
                        console.log("detection post success");
                        updateGraph(res);
                    },
                    error: function () {
                        console.log("detection post error");
                    }
                });
                positions = null;
            } else {
                console.log('Not send position data');
            }
        }, 1000 / window.FPS);
    }
    sendCropImageToServer();


    function receiveResultFromServer() {
/*
        let sid = "";
        ws.on("connect", () => {
            //console.log(`Connected to ${WS_URL}`);
            sid = ws.io.engine.id;
            let chanSid = "face_back_" + sid;
            let graphSid = "detection_back_" + sid;
            console.log(chanSid);
            console.log(graphSid);
            ws.on(graphSid, res => {
                console.log(res);
                updateGraph(res);
            });
            ws.on(chanSid, message => {
                // console.log(message);
                // drawFaceIcon(message.faceCode);
                console.log(message)
                // graph.src = 'data:image/jpeg;base64,' +message.graph;
                handleFaceCode(message);
            });
        });*/
    }
    function handleFaceCode(message) {
        let faceCode = message.faceCode;
        // 32 px png icon
        imageObj.src =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAAOw4AADsOAcy2oYMAAAAHdElNRQfjBRcGGSz0f5qTAAACFklEQVRIx63VzUtUYRQG8J93RlCQGDFHw/BjqwjOTsMWQYpIuAwx3Od/VLqWsnAjiShBShCIC0VcqSDiZJpCQyguDG2hjvc6d/zIzu4873nOe99zz3NOiXhLqtHksUr8krVh15+4wJIYLO25F9qknDhGqUDOkk8++3lTgpR+rz2y5Isl3x2gQp02z7T54a13copaxpQ9I9qVFZyVaTdiz5RMMXqvdQu6JItekNRtwbreeHrWuHo3Wb1x2cIUGavGVd9Ih2rjVqMPSZk0r+FWdGgwb1LqEhiyq/vWdOi2a+jCqbFoJF+6QFpaUECJ4kkjFtWcOQN2dOQDB61YMViQ4CreYccAJIyaVn4Opy07dWpZOkIvxMtNG5UI1MqYdXSnCsCRWRm1dNrWc82nFsd7bOukX1Zr0WJdh7fK6k9KOXYQgk8KFVcEP3AsFbinBXJKVYSQpCpBkdiqiNAqlMoFsgJ1IbjZRy2xCVp81Bzy6wSygQ25iDAONemKTdClyWHIz8jZuNpIJAxb1lhAb7RsWCLvnzcSV1uZVmvGLvr83GqMWYv87nwrXxUT9Nkyp1elhIRKveZs6YuUOiSmODl3mrFv0YQJi/bN6Iyc5+V8NpVTRj300mYo5IEnnmrApq+++R06a/DBvlfh+VxspJXEbI6Ykca9h+pZinULuv91rJ895M6L5a6r7Y330dX235fr5Wtvud7/AlAXs42d19StAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE5LTA1LTIzVDA2OjI1OjQ0LTA0OjAwIPJHewAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOS0wNS0yM1QwNjoyNTo0NC0wNDowMFGv/8cAAAAASUVORK5CYII=";
        if (!faceCode) {
            // nothing
            // return;
        } else if (faceCode === 1 || faceCode === "1") {
            // smile
            console.log("smile");
            imageObj.src =
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAAOw4AADsOAcy2oYMAAAAHdElNRQfjBRcGGSz0f5qTAAACFklEQVRIx63VzUtUYRQG8J93RlCQGDFHw/BjqwjOTsMWQYpIuAwx3Od/VLqWsnAjiShBShCIC0VcqSDiZJpCQyguDG2hjvc6d/zIzu4873nOe99zz3NOiXhLqtHksUr8krVh15+4wJIYLO25F9qknDhGqUDOkk8++3lTgpR+rz2y5Isl3x2gQp02z7T54a13copaxpQ9I9qVFZyVaTdiz5RMMXqvdQu6JItekNRtwbreeHrWuHo3Wb1x2cIUGavGVd9Ih2rjVqMPSZk0r+FWdGgwb1LqEhiyq/vWdOi2a+jCqbFoJF+6QFpaUECJ4kkjFtWcOQN2dOQDB61YMViQ4CreYccAJIyaVn4Opy07dWpZOkIvxMtNG5UI1MqYdXSnCsCRWRm1dNrWc82nFsd7bOukX1Zr0WJdh7fK6k9KOXYQgk8KFVcEP3AsFbinBXJKVYSQpCpBkdiqiNAqlMoFsgJ1IbjZRy2xCVp81Bzy6wSygQ25iDAONemKTdClyWHIz8jZuNpIJAxb1lhAb7RsWCLvnzcSV1uZVmvGLvr83GqMWYv87nwrXxUT9Nkyp1elhIRKveZs6YuUOiSmODl3mrFv0YQJi/bN6Iyc5+V8NpVTRj300mYo5IEnnmrApq+++R06a/DBvlfh+VxspJXEbI6Ykca9h+pZinULuv91rJ895M6L5a6r7Y330dX235fr5Wtvud7/AlAXs42d19StAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE5LTA1LTIzVDA2OjI1OjQ0LTA0OjAwIPJHewAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOS0wNS0yM1QwNjoyNTo0NC0wNDowMFGv/8cAAAAASUVORK5CYII=";
        } else if (faceCode === 2 || faceCode === "2") {
            // fake smile
            console.log("fake smile");
            imageObj.src =
                "data:image/png;base64,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"
        } else if (faceCode === 3 || faceCode === "3") {
            // low motivation
            console.log("low motivation");
            imageObj.src =
                "data:image/png;base64,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"
        } else {
            // nothing
            // return;
            console.log("Unknown");
        }
    }
    receiveResultFromServer();

    // data example:
    // {'intercostal': 16.753965954515735, 'mouth': 15.989832365830068, 'inin': 3, 'stress': 61.55629183765857}
    function updateGraph(data) {
        $(".d3graph").css('opacity', '1');
        let intercostal = data.intercostal;
        let mouth = data.mouth;
        let inin = data.inin;
        let stress = data.stress;
        console.log(data);
        generateData(intercostal, mouth, inin, stress);
        update();
    }
    function sendBucket(data){
        let filename = Date.now() + Math.floor((Math.random() * 100) + 1) + "";
        let uploadSignedUrl = s123.getSignedUrl('putObject', {
            Bucket: 'bucket',
            Key: filename,
            ACL: 'authenticated-read',
            ContentType: 'application/json'
        });
        // フォームデータを取得
        let fd = new FormData();
        fd.append('data',data);
        // POSTでアップロード
        $.ajax({
            url  : uploadSignedUrl,
            type : "POST",
            data : fd,
            cache       : false,
            contentType : false,
            processData : false
        })
            .done(function(data, textStatus, jqXHR){
                console.log('success');
            })
            .fail(function(jqXHR, textStatus, errorThrown){
                console.log("fail");
            });
    }

    function getWsURL() {
        if (
            location.href.indexOf("localhost") > -1 ||
            location.href.indexOf("127.0.0.1") > -1
        ) {
            return "http://localhost:8080";
        } else if (window.SERVER_URL) {
            return window.SERVER_URL;
        }
        return "https://neuroai.jp";
    }

    function crop_video() {
        const cropWidth = width;
        const cropHeight = height;
        // 画像切り取り
        var canvasTmp = document.createElement("canvas");
        canvasTmp.width = cropWidth;
        canvasTmp.height = cropHeight;
        var ctxTmp = canvasTmp.getContext("2d");
        ctxTmp.rect(0, 0, cropWidth, cropHeight);
        // ctxTmp.fillStyle = 'white';
        // ctxTmp.fill();
        // ctxTmp.putImageData(crop.binarizer.source, 0, 0);
        ctxTmp.drawImage(videoId,
            posX, posY, cropWidth, cropHeight,
            0, 0, cropWidth, cropHeight)
        croppedImage = canvasTmp.toDataURL("image/jpeg", 0.8);
        croppedImageTag.setAttribute('src', croppedImage);
        // console.log('Size of crop_video:', croppedImage.length)
        resize_image(croppedImageTag, resizedImageTag);
    }
    const MAX_SEND_SIZE = 160;
    function resize_image(src, dst, type, quality) {
        let tmp = new Image(),
            canvas, context, cW, cH;
        type = type || 'image/jpeg';
        quality = quality || 0.8;
        cW = src.naturalWidth;
        cH = src.naturalHeight;
        tmp.src = src.src;
        tmp.onload = function () {
            canvas = document.createElement('canvas');
            if (cW < src.width) cW = src.width;
            if (cH < src.height) cH = src.height;
            // cW /= 2;
            // cH /= 2;
            cW = cW < MAX_SEND_SIZE ? cW : MAX_SEND_SIZE;
            cH = cH < MAX_SEND_SIZE ? cH : MAX_SEND_SIZE;
            canvas.width = cW;
            canvas.height = cH;
            context = canvas.getContext('2d');
            context.drawImage(tmp, 0, 0, cW, cH);
            resizedImage =  canvas.toDataURL(type, quality);
            dst.src = resizedImage;
            // console.log('Size of resize_image:', resizedImage.length)
            if (cW <= src.width || cH <= src.height)
                return;
            tmp.src = dst.src;
        }
    }
    window.addEventListener("resize", resizeEvent);
    function resizeEvent() {
        videoId.height = videoInput.height();
        videoId.width = videoInput.width();
        canvasInput.height = videoInput.height();
        canvasInput.width = videoInput.width();
        // console.log("canvasInput height:" + canvasInput.height + " ,width:" + canvasInput.width);
        ctx = canvasInput.getContext("2d");

        ctracker = new clm.tracker();
        ctracker.init();
        ctracker.start(videoId);
        initGraph();
    }
});