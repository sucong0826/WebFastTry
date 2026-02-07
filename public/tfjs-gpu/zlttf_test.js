

function $(id) {
    return document.getElementById(id);
}

var modelInputWidth = 256;
var modelInputHeight = 144;

var startCapture = 0;
var startTf = 0;

var canvasCtrl = null;
var gl = null;

var cpuElapsedTimeStart = 0;
var cpuElapsedTime = 0;


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



	var frameCount = 0;
	var frameStart = 0;
	var frameDuration = 0;

    function capture(video, context, contextDownsampled, w, h) {

        cpuElapsedTimeStart = Date.now();
		// var w = mW;
		// var h = mH;
		if (frameCount === 0) {
			frameStart = Date.now();
		}
		frameCount = frameCount + 1;

        var begin = new Date().getTime();
        context.drawImage(video, 0, 0, w, h, 0, 0, w, h);
        var img = context.getImageData(0, 0, w, h);
        
        contextDownsampled.drawImage(video, 0, 0, w, h, 0, 0, modelInputWidth, modelInputHeight);
        var imgDownsampled = contextDownsampled.getImageData(0, 0, modelInputWidth, modelInputHeight);

        // const img1 = tf.browser.fromPixels(canvasCtrl);
        // const img2 =  tf.image.resizeBilinear(img1, [144, 256]);

        gotFrameCallBack(img.data, w, h, imgDownsampled.data, modelInputWidth, modelInputHeight);

		if (frameCount === 60) {
			frameDuration = Date.now() - frameStart;
			console.log("cpu time each frame: " + cpuElapsedTime / 60);
			console.log("Real fps: " + 60000 / frameDuration);
			frameCount = 0;
			cpuElapsedTime = 0;
		}

        var end = new Date().getTime();

        var revise = end - begin;

        window.setTimeout(function () {
            capture(video, context, contextDownsampled, w, h);
        }, 1000 / videoFps - revise);
    }

    function capSucceed(stream) {
        videoCtrl.addEventListener('loadedmetadata', function (e) {
            var w = videoCtrl.videoWidth;
            var h = videoCtrl.videoHeight;
            canvasCtrl.width = w;
            canvasCtrl.height = h;
            $('canvasMixed').width = w;
            $('canvasMixed').height = h;
            context = canvasCtrl.getContext('2d');
            canvasDownsampledCtrl.width = modelInputWidth;
            canvasDownsampledCtrl.height = modelInputHeight;
            contextDownsampled = canvasCtrl.getContext('2d');
            capture(videoCtrl, context, contextDownsampled, w, h);
        });

        startCapture = Date.now();

        try{
            videoCtrl.src = window.URL.createObjectURL(stream);
        }catch(e){
            console.log(e);
            videoCtrl.srcObject = stream
        }
        
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

    this.ZltCapture = ZltCapture;
}());


var model;
var input_data;

var webglRender;

var dataReady = 0;
var configReady = 0;
var configName;
//var modelArtifacts = tf.io.modelArtifacts;


var total = 0;
var total_copy = 0;
var total_pred = 0;
var number = 0;
function gotFrame(frameData, width, height, frameDataDownsampled, wDownsampled, hDownsampled) 
{
    startTf = Date.now() - startCapture;
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
                input_data[i*wDownsampled*3+j*3+0] = y;
                input_data[i*wDownsampled*3+j*3+1] = u;
                input_data[i*wDownsampled*3+j*3+2] = v;
                }
            }
        }

        var start = Date.now();
        cpuElapsedTime += start - cpuElapsedTimeStart;

        // input_tensor = tf.tidy(() => {
        //     const img1 = tf.browser.fromPixels(canvasCtrl);
        //     const img2 =  tf.image.resizeBilinear(img1, [144, 256]);
        //     return tf.reshape(img2, [1, 144,256,3]);
        // });


        input_tensor = tf.tensor4d(input_data, [1, 144,256,3], "float32");
        output = model.predict(input_tensor);

        // const data_gpu =
        // output.dataToGPU({customTexShape: [144, 256]});


        tf1d = output.as1D(144*256);
        var as1D = Date.now()
        var as1D_Time = as1D - start;
        if (0) {
            tf1d.array().then( data => {
            // tf1d.data().then( data => {
                nestedArray = data;
                var arraySync_Time = Date.now() - as1D;
                mask = Float32Array.from(nestedArray);

                var executeTime = as1D_Time + arraySync_Time;
                total += executeTime;
                total_copy += arraySync_Time;
                total_pred += as1D_Time;
                number++;
                if (number % 30 == 0) {
                    var output_time = "average execute time = " + total / 30 + ", copy time = " + total_copy / 30 + ", pred time = " + total_pred / 30;
                    console.log(output_time);
                    total = 0;
                    total_copy = 0;
                    total_pred = 0;
                }

                webglRender.drawBGRAWithMask(frameData, width, height, mask, wDownsampled, hDownsampled);
            })
        }
        else {

            nestedArray = tf1d.arraySync();
            var arraySync_Time = Date.now() - as1D;
            mask = Float32Array.from(nestedArray);

            tf.browser.toPixels(output.as2D(144, 256), $('canvasMask'));
            // mask = Float32Array.from(output.as1D(144*256).arraySync());
            // console.log("as1D_Time time = " + as1D_Time);
            // console.log("arraySync_Time time = " + arraySync_Time);
            // console.log("execu time = " + (as1D_Time + arraySync_Time));

            var executeTime = as1D_Time + arraySync_Time;
            // console.log("execute time = " + executeTime);
            // console.error("pred time = " + as1D_Time);
            // console.error("copy time = " + arraySync_Time);
            total += executeTime;
            total_copy += arraySync_Time;
            total_pred += as1D_Time;
            number++;
            if (number % 30 == 0) {
                var output_time = "average execute time = " + total / 30 + ", copy time = " + total_copy / 30 + ", pred time = " + total_pred / 30;
                // var output_time = "average execute time = " + total / 30;
                console.error(output_time);
                total = 0;
                total_copy = 0;
                total_pred = 0;
            }
            webglRender.drawBGRAWithMask(frameData, width, height, mask, wDownsampled, hDownsampled);
            // webglRender.drawBGRAWithMask(frameData, width, height, data_gpu, wDownsampled, hDownsampled);
        }

        // img1.dispose();
        // img2.dispose();
        tf1d.dispose();
        input_tensor.dispose();
        output.dispose();
        // data_gpu.tensorRef.dispose();
        
        // console.log("p");
    }
}

function startRun() {

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

    zltCapture.startCapture(captureInfo, videoCtrl, canvasCtrl, canvasDownsampledCtrl, gotFrame);

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



var modelArtifacts = new Object();


var IOhandle = new Object();


IOhandle.load = async function(){

    return modelArtifacts;

}
IOhandle.save = async function(){

    //return modelArtifacts;

}


async function prepareOneFile(name, data, isData)
{
    if (isData) 
    {
        dataReady = 1;
        const modelJSON = JSON.parse(data);


        modelArtifacts.modelTopology =  modelJSON.modelTopology;
        modelArtifacts.format =  modelJSON.format;
        modelArtifacts.generatedBy =  modelJSON.generatedBy;
        modelArtifacts.convertedBy =  modelJSON.convertedBy;

        if (modelJSON.weightsManifest != null) {
            for (const group of modelJSON.weightsManifest) {
                //modelArtifacts.weightSpecs.push (group.weights);
                modelArtifacts.weightSpecs =  group.weights;
            }
        }

        if (modelJSON.trainingConfig != null) {
            modelArtifacts.trainingConfig = modelJSON.trainingConfig;
          }
          if (modelJSON.userDefinedMetadata != null) {
            modelArtifacts.userDefinedMetadata = modelJSON.userDefinedMetadata;
          }
    }
    else 
    {
        configReady = 1;
        configName = name;

        //let weightsManifest = ts.io.WeightsManifestConfig;
        modelArtifacts.weightData = data;
    }

    if (dataReady && configReady) {
        // const modelJson = '{ ... }';
        // const handler = new JSONHandler(modelJson);
        tf.setBackend('webgl');
        // tf.env().set('WEBGL_PACK_CONV2DTRANSPOSE', false);
        model = await tf.loadLayersModel(IOhandle);
        console.log("ppp");
    }
}


async function model_prepare() {
	
    // const customBackendName = 'custom-webgl';

    await tf.setBackend('webgl');
    tf.env().set('WEBGL_PACK_CONV2DTRANSPOSE', false);
    // const webglBackend = tf.backend();
    // const gpgpuContext = webglBackend.gpgpu;

    // const kernels = tf.getKernelsForBackend('webgl');
    // kernels.forEach(kernelConfig => {
    //   const newKernelConfig = { ...kernelConfig, backendName: customBackendName };
    //   tf.registerKernel(newKernelConfig);
    // });
    // tf.registerBackend(customBackendName, () => {
    //     return new webglBackend.constructor(
    //         new gpgpuContext.constructor(webglRender.contextGL));
    // //   return new tf.MathBackendWebGL(
    // //       new tf.GPGPUContext(webglRender.contextGL));
    // });
    // // await tf.setBackend(customBackendName);


    // tf.setBackend('wasm');
    // tf.setBackend('webgl');
    // tf.setBackend('webgpu');
	//tf.setBackend('cpu');
	// model = await tf.loadLayersModel('/tfjs-gpu/model/model.json');
    model = await tf.loadGraphModel('/tfjs-gpu/model/model.json'); 


    var start = Date.now();
    var input_data_test = new Float32Array(256*144*3);
    input_tensor = tf.tensor4d(input_data_test, [1, 144,256,3], "float32");
    output = model.predict(input_tensor);


    var predict_time = Date.now() - start;
    console.error("first predict_time = " + predict_time);
	
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
        // DOM already loaded (e.g. client-side nav); run after a tick so #cameraList exists
        // Also wait for TensorFlow.js to be available on window
        if ($("cameraList") && typeof window.tf !== "undefined") {
            uiLoaded();
        } else {
            setTimeout(runWhenReady, 50);
        }
    } else {
        window.onload = runWhenReady;
    }
}
runWhenReady();
