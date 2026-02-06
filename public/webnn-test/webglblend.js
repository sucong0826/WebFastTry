//
//  Copyright (c) 2014 Sam Leitch. All rights reserved.
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to
//  deal in the Software without restriction, including without limitation the
//  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
//  sell copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
//  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
//  IN THE SOFTWARE.
//

// modified by Matthias Behrens (github.com/soliton4) for Broadway.js

"use strict";
// universal module definition
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.WebGLCanvas = factory();
    }
}(this, function () {


    /**
     * This class can be used to render output pictures from an H264bsdDecoder to a canvas element.
     * If available the content is rendered using WebGL.
     */
    function H264bsdCanvas(canvas, forceNoGL, contextOptions) {
        this.canvasElement = canvas;
        this.contextOptions = contextOptions;
        this.glInitSucceed = 0;

        H264bsdCanvas.prototype.ROTATION_CLOCK0 = 0;
        H264bsdCanvas.prototype.ROTATION_CLOCK90 = 1;
        H264bsdCanvas.prototype.ROTATION_CLOCK180 = 2;
        H264bsdCanvas.prototype.ROTATION_CLOCK270 = 3;

        if (!forceNoGL) this.initContextGL();

        if (this.contextGL) {
            this.initProgram();
            this.initBuffers();
            this.initTextures();

            var a = new ArrayBuffer(4);
            this.dummpyCursor = new Uint8Array(a);
            this.glInitSucceed = this.contextGL.getError() ? 0 : 1;
            this.cursorWidth = 0;
            this.cursorHeight = 0;
            this.hasCursor = 0;
            this.hasWholeFrame = 0;
            this.croppingParams = {};
            this.croppingParams.top = 0;
            this.croppingParams.left = 0;
            this.croppingParams.width = 0;
            this.croppingParams.height = 0;
            this.textureWidth = 0;
            this.textureHeight = 0;
            this.canvasWidth = 0;
            this.canvasHeight = 0;
            this.picRotation = -1;
            this.bgColor = [0, 0, 0];
            this.colorRange = -1; // 0: limited , 1 full
        };
    };

    /**
     * Returns true if the canvas supports WebGL
     */
    H264bsdCanvas.prototype.isWebGL = function () {
        return this.contextGL;
    };

    /**
     * Create the GL context from the canvas element
     */
    H264bsdCanvas.prototype.initContextGL = function () {
        var canvas = this.canvasElement;
        var gl = null;

        var validContextNames = ["webgl2", "webgl", "experimental-webgl", "moz-webgl", "webkit-3d"];
        var nameIndex = 0;

        const WEBGL_ATTRIBUTES = {
            alpha: true,
            antialias: false,
            premultipliedAlpha: false,
            preserveDrawingBuffer: false,
            depth: false,
            stencil: false,
            failIfMajorPerformanceCaveat: true,
            powerPreference: 'low-power'
          };

        while (!gl && nameIndex < validContextNames.length) {
            var contextName = validContextNames[nameIndex];

            try {
                if (this.contextOptions) {
                    gl = canvas.getContext(contextName, this.contextOptions);
                } else {
                    gl = canvas.getContext(contextName, WEBGL_ATTRIBUTES);
                };
            } catch (e) {
                gl = null;
            }

            if (!gl || typeof gl.getParameter !== "function") {
                gl = null;
            }

            ++nameIndex;
        };

        this.contextGL = gl;
    };

    /**
     * Initialize GL shader program
     */
    H264bsdCanvas.prototype.initProgram = function () {
        var gl = this.contextGL;

        var vertexShaderScript = [
            'attribute vec4 vertexPos;',
            'attribute vec4 texturePos;',
            'varying vec2 textureCoord;',

            'void main()',
            '{',
            'gl_Position = vertexPos;',
            'textureCoord = texturePos.xy;',
            '}'
        ].join('\n');

        var fragmentShaderScript = [
            'precision highp float;',
            'varying highp vec2 textureCoord;',
            'uniform sampler2D ySampler;',
            'uniform sampler2D uSampler;',
            'uniform sampler2D vSampler;',
            'uniform sampler2D cursorSampler;',
            'uniform vec4 cursorInfo;',
            'uniform int colorRange;',
            'const mat4 YUV2RGB_L = mat4',
            '(',
            '1.1643828125, 0, 1.59602734375, -.87078515625,',
            '1.1643828125, -.39176171875, -.81296875, .52959375,',
            '1.1643828125, 2.017234375, 0, -1.081390625,',
            '0, 0, 0, 1',
            ');',
            'const mat4 YUV2RGB_F = mat4',
            '(',
            '1.0, 0, 1.402, -.701,',
            '1.0, -.34413, -.71414, .529135,',
            '1.0, 1.772, 0, -.886,',
            '0, 0, 0, 1',
            ');',

            'void main(void) {',
            'highp float y = texture2D(ySampler,  textureCoord).r;',
            'highp float u = texture2D(uSampler,  textureCoord).r;',
            'highp float v = texture2D(vSampler,  textureCoord).r;',
            'vec4 c;',
            'if (colorRange == 0)',
            '{',
            '  c = vec4(y, u, v, 1) * YUV2RGB_L;',
            '} else {',
            '  c = vec4(y, u, v, 1) * YUV2RGB_F;',
            '}',
            'if (cursorInfo.z > 0.0 && textureCoord.x >= cursorInfo.x && textureCoord.y >= cursorInfo.y && ',
            '    textureCoord.x < cursorInfo.x+cursorInfo.z && textureCoord.y < cursorInfo.y+cursorInfo.w ){',
            ' vec2 cursorCoord = textureCoord - cursorInfo.xy;',
            ' cursorCoord /= cursorInfo.zw;',
            ' vec4 cursor = texture2D(cursorSampler, cursorCoord);',
            ' c = c*(1.0-cursor.a) + cursor*cursor.a;',
            '}',
            'gl_FragColor = c;',

            '}'
        ].join('\n');
        
        var fragmentShaderScriptBGRA = [
            'precision highp float;',
            'varying highp vec2 textureCoord;',
            'uniform sampler2D bgraSampler;',
            'uniform sampler2D maskSampler;',
            'void main(void) {',
            'highp vec4 rgba = texture2D(bgraSampler,  textureCoord).rgba;',
            'highp float alpha = texture2D(maskSampler,  textureCoord).r;',
            'vec4 bgColor = vec4(0.0, 1.0, 0.0, 1.0);',
            'vec4 c;',
            ' c = rgba*alpha + bgColor*(1.0-alpha);',
            'gl_FragColor = c;',
            '}'
        ].join('\n');

        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderScript);
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.log('Vertex shader failed to compile: ' + gl.getShaderInfoLog(vertexShader));
        }

        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderScript);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            console.log('Fragment shader failed to compile: ' + gl.getShaderInfoLog(fragmentShader));
        }
        
        var fragmentShaderBGRA = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShaderBGRA, fragmentShaderScriptBGRA);
        gl.compileShader(fragmentShaderBGRA);
        if (!gl.getShaderParameter(fragmentShaderBGRA, gl.COMPILE_STATUS)) {
            console.log('Fragment shader failed to compile: ' + gl.getShaderInfoLog(fragmentShaderBGRA));
        }

        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.log('Program failed to compile: ' + gl.getProgramInfoLog(program));
        }
        
        
        var programBGRA = gl.createProgram();
        gl.attachShader(programBGRA, vertexShader);
        gl.attachShader(programBGRA, fragmentShaderBGRA);
        gl.linkProgram(programBGRA);
        if (!gl.getProgramParameter(programBGRA, gl.LINK_STATUS)) {
            console.log('Program failed to compile: ' + gl.getProgramInfoLog(programBGRA));
        }

        gl.useProgram(programBGRA);

        this.shaderProgram = programBGRA;
    };

    /**
     * Initialize vertex buffers and attach to shader program
     */
    H264bsdCanvas.prototype.initBuffers = function () {
        var gl = this.contextGL;
        var program = this.shaderProgram;

        var vertexPosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 1, -1, 1, 1, -1, -1, -1]), gl.STATIC_DRAW);

        var vertexPosRef = gl.getAttribLocation(program, 'vertexPos');
        gl.enableVertexAttribArray(vertexPosRef);
        gl.vertexAttribPointer(vertexPosRef, 2, gl.FLOAT, false, 0, 0);

        this.vertexPosBuffer = vertexPosBuffer;

        var texturePosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texturePosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 0, 0, 0, 1, 1, 0, 1]), gl.STATIC_DRAW);

        var texturePosRef = gl.getAttribLocation(program, 'texturePos');
        gl.enableVertexAttribArray(texturePosRef);
        gl.vertexAttribPointer(texturePosRef, 2, gl.FLOAT, false, 0, 0);

        this.texturePosBuffer = texturePosBuffer;
    };

    /**
     * Initialize GL textures and attach to shader program
     */
    H264bsdCanvas.prototype.initTextures = function () {
        var gl = this.contextGL;
        var program = this.shaderProgram;

        let ext_otf = gl.getExtension("OES_texture_float");
        let ext_otfl = gl.getExtension("OES_texture_float_linear");

        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

       // var yTextureRef = this.initTexture();
       // var ySamplerRef = gl.getUniformLocation(program, 'ySampler');
       // gl.uniform1i(ySamplerRef, 0);
       // this.yTextureRef = yTextureRef;
       //
       // var uTextureRef = this.initTexture();
       // var uSamplerRef = gl.getUniformLocation(program, 'uSampler');
       // gl.uniform1i(uSamplerRef, 1);
       // this.uTextureRef = uTextureRef;
       //
       // var vTextureRef = this.initTexture();
       // var vSamplerRef = gl.getUniformLocation(program, 'vSampler');
       // gl.uniform1i(vSamplerRef, 2);
       // this.vTextureRef = vTextureRef;
        
        var bgraTextureRef = this.initTexture();
        var bgraSamplerRef = gl.getUniformLocation(program, 'bgraSampler');
        gl.uniform1i(bgraSamplerRef, 0);
        this.bgraTextureRef = bgraTextureRef;
        
        var maskTextureRef = this.initTexture();
        var maskSamplerRef = gl.getUniformLocation(program, 'maskSampler');
        gl.uniform1i(maskSamplerRef, 1);
        this.maskTextureRef = maskTextureRef;

        //var cursorTextureRef = this.initTexture();
        //var cursorSamplerRef = gl.getUniformLocation(program, 'cursorSampler');
        //gl.uniform1i(cursorSamplerRef, 3);
        //this.cursorTextureRef = cursorTextureRef;

        var cursorInfoRef = gl.getUniformLocation(program, 'cursorInfo');
        this.cursorInfoRef = cursorInfoRef;

        var colorRangeRef = gl.getUniformLocation(program, 'colorRange');
        this.colorRangeRef = colorRangeRef;
    };

    /**
     * Create and configure a single texture
     */
    H264bsdCanvas.prototype.initTexture = function () {
        var gl = this.contextGL;

        var textureRef = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, textureRef);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);

        return textureRef;
    };

    H264bsdCanvas.prototype.cleanup = function () {

        if (this.glInitSucceed)
        {
            var gl = this.contextGL;

            gl.deleteProgram(this.program);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, null);
    
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, null);
    
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, null);
    
            gl.activeTexture(gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D, null);
    
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
            gl.deleteTexture(this.yTextureRef);
            gl.deleteTexture(this.uTextureRef);
            gl.deleteTexture(this.vTextureRef);
            gl.deleteTexture(this.cursorTextureRef);
    
            gl.deleteBuffer(this.vertexPosBuffer);
            gl.deleteBuffer(this.texturePosBuffer);
    
            this.contextGL = null;

            this.glInitSucceed = 0;
        }
    }


    H264bsdCanvas.prototype.drawBGRAWithMask = function(bgraFrame, width, height, data_gpu, maskWidth, maskHeight){
    	  var gl = this.contextGL;

        let rotation = this.ROTATION_CLOCK0;
        let croppingParams = {"top":0, "left":0, "width":width, "height":height};

        var picSizeChange = (croppingParams.width != this.croppingParams.width || croppingParams.height != this.croppingParams.height);
        var picPosChange = (croppingParams.top != this.croppingParams.top || croppingParams.left != this.croppingParams.left);
        var canvasSizeChange = (gl.canvas.width != this.canvasWidth || gl.canvas.height != this.canvasHeight);
        var texSizeChange = (width != this.textureWidth || height != this.textureHeight);
        var rotationChange = (rotation != this.picRotation);
        
        if (picSizeChange || canvasSizeChange || rotationChange)
        {
            updateVertexInfo(this, croppingParams.width, croppingParams.height, rotation);
        }
        if (picSizeChange || picPosChange || texSizeChange || rotationChange)
        {
            updateTextureInfo(this, width, height, croppingParams, rotation);
        }

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.scissor(0, 0, gl.canvas.width, gl.canvas.height);

        this.croppingParams = croppingParams;
        this.textureWidth = width;
        this.textureHeight = height;
        this.picRotation = rotation;
        this.canvasWidth = gl.canvas.width;
        this.canvasHeight = gl.canvas.height;

        gl.clearColor(this.bgColor[0], this.bgColor[1], this.bgColor[2], 255);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.bgraTextureRef);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, bgraFrame);


        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.scissor(0, 0, gl.canvas.width, gl.canvas.height);

        gl.activeTexture(gl.TEXTURE1);
        // console.error(gl.getError());
        // this.maskTextureRef = data_gpu.texture;
        // gl.bindTexture(gl.TEXTURE_2D, this.maskTextureRef);
        // console.error(gl.getError());
        gl.bindTexture(gl.TEXTURE_2D, this.maskTextureRef);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, maskWidth, maskHeight, 0, gl.RED, gl.FLOAT, data_gpu);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        // console.error(gl.getError());
    }
    
    /**
     * Draw picture data to the canvas.
     * If this object is using WebGL, the data must be an I420 formatted ArrayBuffer,
     * Otherwise, data must be an RGBA formatted ArrayBuffer.
     */
    H264bsdCanvas.prototype.drawNextOutputPicture = function (width, height, croppingParams, data, colorRange = 0) {
        var gl = this.contextGL;

        if (gl) {
            this.drawNextOuptutPictureGL(width, height, croppingParams, data, colorRange);
        } else {
            this.drawNextOuptutPictureRGBA(width, height, croppingParams, data);
        }
    };


    function updateVertexInfo(glCanvas, picWidth, picHeight, rotation)
    {
        var gl = glCanvas.contextGL;
        var w = (rotation == glCanvas.ROTATION_CLOCK90 || rotation == glCanvas.ROTATION_CLOCK270) ? picHeight : picWidth;
        var h = (rotation == glCanvas.ROTATION_CLOCK90 || rotation == glCanvas.ROTATION_CLOCK270) ? picWidth : picHeight;
        var left, top, right, bottom;
        var dw = w/h*gl.canvas.height;
        var dh = h/w*gl.canvas.width;

        if (dw > gl.canvas.width) {
            left = 0;
            right = 1;
            top = (gl.canvas.height - dh)/2/gl.canvas.height;
            bottom = 1 - top;
        } else {
            top = 0;
            bottom = 1;
            left = (gl.canvas.width - dw)/2/gl.canvas.width;
            right = 1 - left;
        }
        left = left*2 - 1;
        right = right*2 - 1;
        top = 1 - top*2;
        bottom = 1 - bottom*2;

        var vertexPosValues = new Float32Array([right, top, left, top, right, bottom, left, bottom]);
        // var vertexPosValues = new Float32Array([right, bottom, left, bottom, right, top, left, top]);  // for test

        gl.bindBuffer(gl.ARRAY_BUFFER, glCanvas.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexPosValues, gl.DYNAMIC_DRAW);
    }

    function updateTextureInfo(glCanvas, width, height, croppingParams, rotation)
    {
        var gl = glCanvas.contextGL;
        var tTop = croppingParams.top / height;
        var tLeft = croppingParams.left / width;
        var tBottom = tTop + croppingParams.height / height;
        var tRight = tLeft + croppingParams.width / width;
        var texInfo = [tLeft, tTop, tRight, tTop, tRight, tBottom, tLeft, tBottom];

        if (rotation == glCanvas.ROTATION_CLOCK90)
        {
            texInfo.unshift(texInfo[6], texInfo[7]);
            texInfo = texInfo.slice(0, 8);
        }
        if (rotation == glCanvas.ROTATION_CLOCK180) {
            texInfo.unshift(texInfo[4], texInfo[5], texInfo[6], texInfo[7]);
            texInfo = texInfo.slice(0, 8);
        }
        if (rotation == glCanvas.ROTATION_CLOCK270) {
            texInfo.push(texInfo[0], texInfo[1]);
            texInfo = texInfo.slice(2);
        }
        
        var a = texInfo[0];
        var b = texInfo[1];
        texInfo[0] = texInfo[2];
        texInfo[1] = texInfo[3];
        texInfo[2] = a;
        texInfo[3] = b;

        // texInfo = [1, 1, 0, 0, 1, 1, 0, 1];  // for test
        var texturePosValues = new Float32Array(texInfo);

        gl.bindBuffer(gl.ARRAY_BUFFER, glCanvas.texturePosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, texturePosValues, gl.DYNAMIC_DRAW);
    }

    /**
     * Draw the next output picture using WebGL
     */
    H264bsdCanvas.prototype.drawNextOuptutPictureGL = function (width, height, croppingParams, data, rotation, limitedColorRange = true) {
        var gl = this.contextGL;
        var texturePosBuffer = this.texturePosBuffer;
        var yTextureRef = this.yTextureRef;
        var uTextureRef = this.uTextureRef;
        var vTextureRef = this.vTextureRef;

        if (!gl || !this.glInitSucceed) {
            return;
        }

        if ((width <= 0 || height <= 0) ||
            !data || !data.length ||
            data.length != width * height * 3 / 2 ||
            (croppingParams && (croppingParams.top < 0 || croppingParams.left < 0 || croppingParams.left + croppingParams.width > width || croppingParams.top + croppingParams.height > height))
        ) {
            return;
        }

        rotation = rotation ? rotation : this.ROTATION_CLOCK0;
        croppingParams = croppingParams ? croppingParams : {"top":0, "left":0, "width":width, "height":height};

        var picSizeChange = (croppingParams.width != this.croppingParams.width || croppingParams.height != this.croppingParams.height);
        var picPosChange = (croppingParams.top != this.croppingParams.top || croppingParams.left != this.croppingParams.left);
        var canvasSizeChange = (gl.canvas.width != this.canvasWidth || gl.canvas.height != this.canvasHeight);
        var texSizeChange = (width != this.textureWidth || height != this.textureHeight);
        var rotationChange = (rotation != this.picRotation);
        

        if (picSizeChange || canvasSizeChange || rotationChange)
        {
            updateVertexInfo(this, croppingParams.width, croppingParams.height, rotation);
        }
        if (picSizeChange || picPosChange || texSizeChange || rotationChange)
        {
            updateTextureInfo(this, width, height, croppingParams, rotation);
        }

        let colorRange = limitedColorRange?0:1;
        if (colorRange != this.colorRange)
        {
            gl.uniform1i(this.colorRangeRef, colorRange);
            this.colorRange = colorRange;
        }

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        this.croppingParams = croppingParams;
        this.textureWidth = width;
        this.textureHeight = height;
        this.picRotation = rotation;
        this.canvasWidth = gl.canvas.width;
        this.canvasHeight = gl.canvas.height;

        // if (croppingParams === null) {
        //     gl.viewport(0, 0, width, height);
        // } else {
        //     gl.viewport(0, 0, croppingParams.width, croppingParams.height);

        //     var tTop = croppingParams.top / height;
        //     var tLeft = croppingParams.left / width;
        //     var tBottom = croppingParams.height / height;
        //     var tRight = croppingParams.width / width;
        //     var texturePosValues = new Float32Array([tRight, tTop, tLeft, tTop, tRight, tBottom, tLeft, tBottom]);

        //     gl.bindBuffer(gl.ARRAY_BUFFER, texturePosBuffer);
        //     gl.bufferData(gl.ARRAY_BUFFER, texturePosValues, gl.DYNAMIC_DRAW);
        // }

        gl.clearColor(this.bgColor[0], this.bgColor[1], this.bgColor[2], 255);
        gl.clear(gl.COLOR_BUFFER_BIT);


        var i420Data = data;

        var yDataLength = width * height;
        var yData = i420Data.subarray(0, yDataLength);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, yTextureRef);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width, height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, yData);

        var cbDataLength = width / 2 * height / 2;
        var cbData = i420Data.subarray(yDataLength, yDataLength + cbDataLength);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, uTextureRef);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width / 2, height / 2, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, cbData);

        var crDataLength = cbDataLength;
        var crData = i420Data.subarray(yDataLength + cbDataLength, yDataLength + cbDataLength + crDataLength);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, vTextureRef);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width / 2, height / 2, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, crData);

        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.cursorTextureRef);
        if (!this.hasCursor) {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.dummpyCursor);
        }

        gl.uniform4f(this.cursorInfoRef, 0, 0, 0, 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        this.hasWholeFrame = 1;
    };


    H264bsdCanvas.prototype.updateTextureBlock = function (width, height, x, y, data) {
        var gl = this.contextGL;

        if (gl && this.glInitSucceed) {
            var i420Data = data;

            if (!this.hasWholeFrame ||
                (width <= 0 || height <= 0) ||
                (x < 0 || y < 0) ||
                (x + width > this.textureWidth || y + height > this.textureHeight) ||
                !data ||
                data.length != width * height * 3 / 2
            ) {
                return;
            }

            var yTextureRef = this.yTextureRef;
            var uTextureRef = this.uTextureRef;
            var vTextureRef = this.vTextureRef;

            var yDataLength = width * height;
            var yData = i420Data.subarray(0, yDataLength);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, yTextureRef);
            gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, width, height, gl.LUMINANCE, gl.UNSIGNED_BYTE, yData);

            var cbDataLength = width / 2 * height / 2;
            var cbData = i420Data.subarray(yDataLength, yDataLength + cbDataLength);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, uTextureRef);
            gl.texSubImage2D(gl.TEXTURE_2D, 0, x / 2, y / 2, width / 2, height / 2, gl.LUMINANCE, gl.UNSIGNED_BYTE, cbData);

            var crDataLength = cbDataLength;
            var crData = i420Data.subarray(yDataLength + cbDataLength, yDataLength + cbDataLength + crDataLength);
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, vTextureRef);
            gl.texSubImage2D(gl.TEXTURE_2D, 0, x / 2, y / 2, width / 2, height / 2, gl.LUMINANCE, gl.UNSIGNED_BYTE, crData);

        } else {
            return;
        }
    };


    H264bsdCanvas.prototype.updateCursor = function (width, height, data) {
        var gl = this.contextGL;

        if (gl && this.glInitSucceed) {
            if ((width <= 0 || height <= 0) ||
                !data ||
                data.length != width * height * 4
            ) {
                return;
            }

            gl.activeTexture(gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D, this.cursorTextureRef);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);

            this.cursorWidth = width;
            this.cursorHeight = height;
            this.hasCursor = 1;

        } else {
            return;
        }
    };

    H264bsdCanvas.prototype.draw = function (withCursor, cursorX, cursorY, cursorLogicWidth, cursorLogicHeight) {
        var gl = this.contextGL;

        if (gl && this.glInitSucceed) {

            if (!this.hasWholeFrame ||
                (withCursor && (cursorLogicWidth < 0 || cursorLogicHeight < 0))
            ) {
                return;
            }

            var texturePosBuffer = this.texturePosBuffer;
            var yTextureRef = this.yTextureRef;
            var uTextureRef = this.uTextureRef;
            var vTextureRef = this.vTextureRef;
            var cursorTextureRef = this.cursorTextureRef;

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, yTextureRef);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, uTextureRef);

            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, vTextureRef);

            gl.activeTexture(gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D, cursorTextureRef);

            if (withCursor && this.hasCursor) {
                let cx = cursorX / this.croppingParams.width;
                let cy = cursorY / this.croppingParams.height;
                let cw = cursorLogicWidth / this.croppingParams.width;
                let ch = cursorLogicHeight / this.croppingParams.height;

                gl.uniform4f(this.cursorInfoRef, cx, cy, cw, ch);
            } else {
                gl.uniform4f(this.cursorInfoRef, 0, 0, 0, 0);
            }

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        } else {
            return;
        }
    }


    H264bsdCanvas.prototype.clear = function () {
        var gl = this.contextGL;

        if (gl && this.glInitSucceed) {
            gl.clearColor(this.bgColor[0], this.bgColor[1], this.bgColor[2], 255);
            gl.clear(gl.COLOR_BUFFER_BIT);

            this.hasWholeFrame = 0;
            this.hasCursor = 0;
        }
    }


    H264bsdCanvas.prototype.test_changeColorRange = function(limitedColorRange) {
        var gl = this.contextGL;

        if (gl && this.glInitSucceed)
        {
            colorRange = limitedColorRange?0:1;
            if (colorRange != this.colorRange)
            {
                gl.uniform1i(this.colorRangeRef, colorRange);
                this.colorRange = colorRange;
    
                this.draw(0);
            }
        }
    }

    /**
     * Draw next output picture using ARGB data on a 2d canvas.
     */
    H264bsdCanvas.prototype.drawNextOuptutPictureRGBA = function (width, height, croppingParams, data) {
        var canvas = this.canvasElement;

        var croppingParams = null;

        var argbData = data;

        var ctx = canvas.getContext('2d');
        var imageData = ctx.getImageData(0, 0, width, height);
        imageData.data.set(argbData);

        if (croppingParams === null) {
            ctx.putImageData(imageData, 0, 0);
        } else {
            ctx.putImageData(imageData, -croppingParams.left, -croppingParams.top, 0, 0, croppingParams.width, croppingParams.height);
        }
    };

    return H264bsdCanvas;

}));