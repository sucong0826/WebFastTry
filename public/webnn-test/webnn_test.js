

import { OriginNhwc } from './origin_nhwc.js';

function $(id) {
    return document.getElementById(id);
}

var modelInputWidth = 256;
var modelInputHeight = 144;

var startCaptureTime = 0;
var startTf = 0;

var canvasCtrl = null;
var gl = null;

var zltCapture;



(function () {
    function ZltCapture() {
    }

    ZltCapture.prototype.enumDevices = function (gotDevices) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            console.warn("mediaDevices.enumerateDevices not available (need HTTPS or localhost)");
            gotDevices([]);
            return;
        }
        navigator.mediaDevices.enumerateDevices()
            .then(function (devices) {
                var videoDevices = [];
                var videoDeviceIndex = 0;
                devices.forEach(function (device) {
                    if (device.kind === "videoinput") {
                        videoDevices[videoDeviceIndex] = {};
                        videoDevices[videoDeviceIndex]["id"] = device.deviceId;
                        videoDevices[videoDeviceIndex]["label"] = device.label || ("camera " + videoDeviceIndex);
                        videoDeviceIndex++;
                    }
                });
                gotDevices(videoDevices);
            })
            .catch(function (err) {
                console.warn("enumerateDevices error:", err);
                gotDevices([]);
            });
    }

    var gotFrameCallBack = null;
    var videoCtrl = null;

    var canvasDownsampledCtrl = null;
    var videoFps = 0;

    async function capture(video, context, contextDownsampled, w, h) {
		// console.log("capture begin");
        var begin = new Date().getTime();
        context.drawImage(video, 0, 0, w, h, 0, 0, w, h);
        var img = context.getImageData(0, 0, w, h);
        
        contextDownsampled.drawImage(video, 0, 0, w, h, 0, 0, modelInputWidth, modelInputHeight);
        var imgDownsampled = contextDownsampled.getImageData(0, 0, modelInputWidth, modelInputHeight);

        // const img1 = tf.browser.fromPixels(canvasCtrl);
        // const img2 =  tf.image.resizeBilinear(img1, [144, 256]);

        // console.log("gotFrameCallBack begin");
        await gotFrameCallBack(video, img.data, w, h, imgDownsampled.data, modelInputWidth, modelInputHeight);
		// console.log("gotFrameCallBack end");

        var end = new Date().getTime();

        var revise = end - begin;

		// console.log("window.setTimeout");
        window.setTimeout(function () {
            capture(video, context, contextDownsampled, w, h);
        }, 1000 / videoFps - revise);
    }

    function capSucceed(stream) {
        let context;
        let contextDownsampled;
        videoCtrl.addEventListener('loadedmetadata', function (e) {
            var w = videoCtrl.videoWidth;
            var h = videoCtrl.videoHeight;
            canvasCtrl.width = w;
            canvasCtrl.height = h;
            $('canvasMixed').width = w;
            $('canvasMixed').height = h;
            context = canvasCtrl.getContext('2d', { willReadFrequently: true });
            canvasDownsampledCtrl.width = modelInputWidth;
            canvasDownsampledCtrl.height = modelInputHeight;
            contextDownsampled = canvasCtrl.getContext('2d', { willReadFrequently: true });
            capture(videoCtrl, context, contextDownsampled, w, h);
        });

        startCaptureTime = Date.now();

        // Use srcObject for MediaStream (createObjectURL(MediaStream) is deprecated and can throw)
        videoCtrl.srcObject = stream;
        videoCtrl.play();

        var track = stream.getTracks()[0];
        var settings = track.getSettings ? track.getSettings() : null;
        var settingsString;
        if (settings) {
            settingsString = JSON.stringify(settings).
                replace(/,"/g, '\n').
                replace(/":/g, ': ').
                replace(/{"/g, '').
                replace(/[}]/g, '');
        } else {
            settingsString =
                'MediaStreamTrack.getSettings() is not supported by this browser :^(.';
        }
        console.log(settingsString);
    }

    function capFailed(error) {
        console.log('navigator.getUserMedia error: ', error);
    }

    ZltCapture.prototype.startCapture = function (info, vc, cc, dsc, gotFrame) {
        var deviceId = info["deviceId"];
        var w = info["width"];
        var h = info["height"];
        var f = info["fps"];

        gotFrameCallBack = gotFrame;
        videoCtrl = vc;
        canvasCtrl = cc;
        canvasDownsampledCtrl = dsc;
        videoFps = f;

        navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                width: w,
                height: h,
                frameRate: f
                // , deviceId: { deviceId }
            }
        }).then(capSucceed, capFailed);
    }

    window.ZltCapture = ZltCapture;
}());


var model;
var session;
var input_data;

var webglRender;

var dataReady = 0;
var configReady = 0;
var configName;
//var modelArtifacts = tf.io.modelArtifacts;


function getTensor(type, data, dims) {
    let typedArray;
    if (type === 'bool') {
      return new ort.Tensor(type, [data], [1]);
    } else if (type === 'uint16') {
      typedArray = Uint16Array;
    } else if (type === 'float16') {
      typedArray = Uint16Array;
    } else if (type === 'float32') {
      typedArray = Float32Array;
    } else if (type === 'int32') {
      typedArray = Int32Array;
    } else if (type === 'int64') {
      typedArray = BigInt64Array;
    }
  
    let _data;
    if (Array.isArray(data) || ArrayBuffer.isView(data)) {
      _data = data;
    } else {
      let size = 1;
      dims.forEach((dim) => {
        size *= dim;
      });
      if (data === 'random') {
        _data = typedArray.from({length: size}, () => Math.random());
      } else if (data === 'ramp') {
        _data = typedArray.from({length: size}, (_, i) => i);
      } else {
        _data = typedArray.from({length: size}, () => data);
      }
    }
    return new ort.Tensor(type, _data, dims);
  }


var total = 0;
var total_copy = 0;
var total_pred = 0;
var number = 0;
async function gotFrame(video, frameData, width, height, frameDataDownsampled, wDownsampled, hDownsampled) 
{
	// console.log("gotFrame 1");
    startTf = Date.now() - startCaptureTime;
    if (startTf > 0)
    {
        let i, j;
        if(number >= 0)
        {
            for (i = 0; i < hDownsampled; i++)
            {
                for (j = 0; j < wDownsampled; j++)
                {
                    let r = frameDataDownsampled[i*wDownsampled*4+j*4+0];
                    let g = frameDataDownsampled[i*wDownsampled*4+j*4+1];
                    let b = frameDataDownsampled[i*wDownsampled*4+j*4+2];
                    // let y = 0.257*r+0.504*g+0.098*b+16;
                    // let u = -0.148*r-0.291*g+0.439*b+128;
                    // let v = 0.439*r-0.368*g-0.071*b+128;

                    let y = 0.299*r+0.587*g+0.114*b;
                    let u = -0.1687*r-0.3313*g+0.5*b+128;
                    let v = 0.5*r-0.4187*g-0.0813*b+128;

                    // let y = r;
                    // let u = g;
                    // let v = b;

                // //HWC    
                // input_data[i*wDownsampled*3+j*3+0] = y;
                // input_data[i*wDownsampled*3+j*3+1] = u;
                // input_data[i*wDownsampled*3+j*3+2] = v;

                //CHW
                input_data[                              i*wDownsampled+j] = y;
                input_data[hDownsampled*wDownsampled   + i*wDownsampled+j] = u;
                input_data[2*hDownsampled*wDownsampled + i*wDownsampled+j] = v;
                }
            }
        }
        


                //     let r = frameDataDownsampled[i*wDownsampled*4+j*4+0];
                //     let g = frameDataDownsampled[i*wDownsampled*4+j*4+1];
                //     let b = frameDataDownsampled[i*wDownsampled*4+j*4+2];
                //     // let y = 0.257*r+0.504*g+0.098*b+16;
                //     // let u = -0.148*r-0.291*g+0.439*b+128;
                //     // let v = 0.439*r-0.368*g-0.071*b+128;

                //     let y = 0.299*r+0.587*g+0.114*b;
                //     let u = -0.1687*r-0.3313*g+0.5*b+128;
                //     let v = 0.5*r-0.4187*g-0.0813*b+128;

                //     // let y = r;
                //     // let u = g;
                //     // let v = b;
                // input_data[i*wDownsampled*3+j*3+0] = y;
                // input_data[i*wDownsampled*3+j*3+1] = u;
                // input_data[i*wDownsampled*3+j*3+2] = v;

        var start = Date.now();


        // input_tensor = tf.tensor4d(input_data, [1, 144,256,3], "float32");
        // output = model.predict(input_tensor);

        // input_tensor = new ort.Tensor('float32', input_data, [1, 144,256,3]);

        var feeds = {};
        // feeds['input'] = new ort.Tensor('float32', input_data, [1, 144,256,3]);
        // feeds['input'] = new ort.Tensor('float32', input_data, [1, 3,144,256]);

        feeds['input'] = input_data;


        // const feeds = {
        //     input: getTensor('float32', 'random', [1, 3, 144, 256])
        // }
        var result  = await model.run(feeds);
		// console.log("gotFrame 4");

        var mask = result.output;

        // const max = Math.max(...mask);

        // console.log("max = " +  max);


        var executeTime = Date.now() - start;

        total += executeTime;
        number++;

        if (number % 30 == 0) {
            console.log("average execute time = " + total/30);
            total = 0;
        }
		// console.log("gotFrame 5");
        console.log("execute time = " + executeTime);

        // webglRender.drawBGRAWithMask(frameData, width, height, mask, wDownsampled, hDownsampled);
    }
}

async function startRun() {

    var videoCtrl = $("capture");
    var canvasCtrl = $("canvasSource");
    var canvasDownsampledCtrl = $("canvasDownSampled");
    var captureInfo = {};

    captureInfo["deviceId"] = $("cameraList").options[$("cameraList").selectedIndex].text;//$("cameraList").value;
    captureInfo["fps"] = $("fpsList").value;

    var resolution = $("sizeList").value.split('x');
    captureInfo["width"] = parseInt(resolution[0]);
    captureInfo["height"] = parseInt(resolution[1]);
    
    input_data = new Float32Array(256*144*3);

    // annx_test();

    zltCapture.startCapture(captureInfo, videoCtrl, canvasCtrl, canvasDownsampledCtrl, gotFrame);

}

async function annx_test() {

    while (true) {
        var start = Date.now();

        const feeds = {
            input: getTensor('float32', 'random', [1, 3, 144, 256])
        }
        var result  = await session.run(feeds);
        var mask = result.output.data;

        var executeTime = Date.now() - start;

        total += executeTime;
        number++;

        if (number % 30 == 0) {
            console.log("average execute time = " + total/30);
            total = 0;
        }
    }
}

function uploadFiles(files, isData) {
    var statusArea = document.getElementById("ef_status_area");
    statusArea.innerText = "file: " + files[0].name;

    for (var i = 0, f; f = files[i]; i++) {
        var reader = new FileReader();
        if (isData) reader.readAsText(f);
        else reader.readAsArrayBuffer(f);

        reader.onloadstart = function (event) {
            console.log("onloadstart");
        };

        reader.onprogress = function (event) {
            console.log("onprogress");
        };

        reader.onload = function (event) {
            console.log("onload");
        };

        reader.onloadend = (function (f) {
            var file = f;
            return function () {
                if (reader.error) {
                    console.log(this.error);
                } else {
                    statusArea.innerText = "read succeed";
                    prepareOneFile(file.name, reader.result, isData);
                }
            }
        })(f);
    }
}


async function model_prepare() {

    const option = {
        executionProviders: [
          {
            name: "webgpu",
            deviceType: "gpu",
            preferredLayout: "NHWC",
          },
        ],
        graphOptimizationLevel: "all",
      };

    // session = await ort.InferenceSession.create('./model_vb.onnx', option);
    // session = await ort.InferenceSession.create('./model.onnx', option);
    // session = await ort.InferenceSession.create('./model.onnx');

    model = new OriginNhwc();

    await model.build({ deviceType: "gpu" });

    console.log("ppp");



    // var start = Date.now();
    // var input_data_test = new Float32Array(256*144*3);
    // // input_tensor = tf.tensor4d(input_data_test, [1, 144,256,3], "float32");
    // // output = model.predict(input_tensor);

    // var feeds = {};
    // // feeds['input'] = new ort.Tensor('float32', input_data, [1, 144,256,3]);
    // feeds['input'] = new ort.Tensor('float32', input_data_test, [1, 3,144,256]);
    // var result  = await session.run(feeds);

    // var mask = result.output.data;


    // var predict_time = Date.now() - start;
    // console.error("first predict_time = " + predict_time);
	
	//const example = tf.fromPixels(webcamElement);  // for example
	//const prediction = model.predict(example);
}

var uiList = [];

function disableUI() {
    uiList.forEach(u => {
        u.disabled = true;
    }
    );
}

function enableUI() {
    uiList.forEach(u => {
        u.disabled = false;
    });
}

function uiLoaded() {
    var startBtn = $("start");

    uiList.push(startBtn);

    disableUI();

    startBtn.onclick = startRun;

    zltCapture = new ZltCapture();

    webglRender = new WebGLCanvas($('canvasMixed'), 0, 0);
    
    // var canvas = $('canvasMixed')


    // var validContextNames = ["webgl2", "webgl", "experimental-webgl", "moz-webgl", "webkit-3d"];
    // var nameIndex = 0;

    // while (!gl && nameIndex < validContextNames.length) {
    //     var contextName = validContextNames[nameIndex];

    //     try {
    //         gl = canvas.getContext(contextName);
    //     } catch (e) {
    //         gl = null;
    //     }

    //     if (!gl || typeof gl.getParameter !== "function") {
    //         gl = null;
    //     }

    //     ++nameIndex;
    // };

    zltCapture.enumDevices(function (deviceInfoList) {
        var cameraList = $("cameraList");
        if (!cameraList) return;
        deviceInfoList.forEach(function (deviceInfo) {
            var option = document.createElement('option');
            option.value = deviceInfo["id"];
            option.text = deviceInfo["label"];
            cameraList.appendChild(option);
        });
    });
    
    model_prepare().then(()=>enableUI());
    enableUI();
}

// Next.js/SPA: window.onload may have already fired before this script ran.
// Run uiLoaded when DOM is ready so camera list gets populated.
function runWhenReady() {
    if (document.readyState === 'complete') {
        if ($("cameraList")) {
            uiLoaded();
        } else {
            setTimeout(runWhenReady, 50);
        }
    } else {
        window.onload = uiLoaded;
    }
}
runWhenReady();
