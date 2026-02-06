export class OriginNhwc {

  constructor() {

    this.graph_ = null;

    this.context_ = null;

    this.inputTensors_ = {};

    this.outputTensors_ = {};

  }



  async build(contextOptions) {

    // Load weights ArrayBuffer from origin_nhwc.bin (absolute path for Next.js/SPA routes)
        async function loadWeightsArrayBuffer() {
            const response = await fetch('/webnn-test/origin_nhwc.bin');
            if (!response.ok) {
                throw new Error('Failed to fetch weights: ' + response.statusText);
            }
            return await response.arrayBuffer();
        }

        const weights_array_buffer = await loadWeightsArrayBuffer();



    this.context_ = await navigator.ml.createContext(contextOptions);
    const builder = new MLGraphBuilder(this.context_);


    // Create graph constant operands.

    let var_yuv2rgb_weight_buffer;
    if (0 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_yuv2rgb_weight_buffer = new Float32Array(weights_array_buffer, 0, 36 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 0, 36);
        const buf = new Uint8Array(36);
        buf.set(tmp);
        var_yuv2rgb_weight_buffer = new Float32Array(buf.buffer, 0, 36 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_yuv2rgb_weight = builder.constant(
        {dataType: 'float32', shape: [3, 3, 1, 1]},
        var_yuv2rgb_weight_buffer
    );

    let var_yuv2rgb_bias_buffer;
    if (36 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_yuv2rgb_bias_buffer = new Float32Array(weights_array_buffer, 36, 12 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 36, 12);
        const buf = new Uint8Array(12);
        buf.set(tmp);
        var_yuv2rgb_bias_buffer = new Float32Array(buf.buffer, 0, 12 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_yuv2rgb_bias = builder.constant(
        {dataType: 'float32', shape: [3]},
        var_yuv2rgb_bias_buffer
    );

    let var_model_encoder_initial_block_conv_weight_buffer;
    if (48 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_initial_block_conv_weight_buffer = new Float32Array(weights_array_buffer, 48, 1728 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 48, 1728);
        const buf = new Uint8Array(1728);
        buf.set(tmp);
        var_model_encoder_initial_block_conv_weight_buffer = new Float32Array(buf.buffer, 0, 1728 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_initial_block_conv_weight = builder.constant(
        {dataType: 'float32', shape: [16, 3, 3, 3]},
        var_model_encoder_initial_block_conv_weight_buffer
    );

    let var_model_encoder_initial_block_conv_bias_buffer;
    if (1776 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_initial_block_conv_bias_buffer = new Float32Array(weights_array_buffer, 1776, 64 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 1776, 64);
        const buf = new Uint8Array(64);
        buf.set(tmp);
        var_model_encoder_initial_block_conv_bias_buffer = new Float32Array(buf.buffer, 0, 64 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_initial_block_conv_bias = builder.constant(
        {dataType: 'float32', shape: [16]},
        var_model_encoder_initial_block_conv_bias_buffer
    );

    let var_model_encoder_layers_0_conv_weight_buffer;
    if (1840 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_0_conv_weight_buffer = new Float32Array(weights_array_buffer, 1840, 18432 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 1840, 18432);
        const buf = new Uint8Array(18432);
        buf.set(tmp);
        var_model_encoder_layers_0_conv_weight_buffer = new Float32Array(buf.buffer, 0, 18432 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_0_conv_weight = builder.constant(
        {dataType: 'float32', shape: [32, 16, 3, 3]},
        var_model_encoder_layers_0_conv_weight_buffer
    );

    let var_model_encoder_layers_0_conv_bias_buffer;
    if (20272 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_0_conv_bias_buffer = new Float32Array(weights_array_buffer, 20272, 128 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 20272, 128);
        const buf = new Uint8Array(128);
        buf.set(tmp);
        var_model_encoder_layers_0_conv_bias_buffer = new Float32Array(buf.buffer, 0, 128 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_0_conv_bias = builder.constant(
        {dataType: 'float32', shape: [32]},
        var_model_encoder_layers_0_conv_bias_buffer
    );

    let var_model_encoder_layers_1_conv3x3_1_0_weight_buffer;
    if (20400 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_1_conv3x3_1_0_weight_buffer = new Float32Array(weights_array_buffer, 20400, 1152 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 20400, 1152);
        const buf = new Uint8Array(1152);
        buf.set(tmp);
        var_model_encoder_layers_1_conv3x3_1_0_weight_buffer = new Float32Array(buf.buffer, 0, 1152 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_1_conv3x3_1_0_weight = builder.constant(
        {dataType: 'float32', shape: [32, 1, 3, 3]},
        var_model_encoder_layers_1_conv3x3_1_0_weight_buffer
    );

    let var_model_encoder_layers_1_conv3x3_1_0_bias_buffer;
    if (21552 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_1_conv3x3_1_0_bias_buffer = new Float32Array(weights_array_buffer, 21552, 128 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 21552, 128);
        const buf = new Uint8Array(128);
        buf.set(tmp);
        var_model_encoder_layers_1_conv3x3_1_0_bias_buffer = new Float32Array(buf.buffer, 0, 128 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_1_conv3x3_1_0_bias = builder.constant(
        {dataType: 'float32', shape: [32]},
        var_model_encoder_layers_1_conv3x3_1_0_bias_buffer
    );

    let var_model_encoder_layers_1_conv3x3_2_0_weight_buffer;
    if (21680 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_1_conv3x3_2_0_weight_buffer = new Float32Array(weights_array_buffer, 21680, 1152 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 21680, 1152);
        const buf = new Uint8Array(1152);
        buf.set(tmp);
        var_model_encoder_layers_1_conv3x3_2_0_weight_buffer = new Float32Array(buf.buffer, 0, 1152 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_1_conv3x3_2_0_weight = builder.constant(
        {dataType: 'float32', shape: [32, 1, 3, 3]},
        var_model_encoder_layers_1_conv3x3_2_0_weight_buffer
    );

    let var_model_encoder_layers_1_conv3x3_2_0_bias_buffer;
    if (22832 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_1_conv3x3_2_0_bias_buffer = new Float32Array(weights_array_buffer, 22832, 128 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 22832, 128);
        const buf = new Uint8Array(128);
        buf.set(tmp);
        var_model_encoder_layers_1_conv3x3_2_0_bias_buffer = new Float32Array(buf.buffer, 0, 128 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_1_conv3x3_2_0_bias = builder.constant(
        {dataType: 'float32', shape: [32]},
        var_model_encoder_layers_1_conv3x3_2_0_bias_buffer
    );

    let var_model_encoder_layers_2_conv3x3_1_0_weight_buffer;
    if (22960 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_2_conv3x3_1_0_weight_buffer = new Float32Array(weights_array_buffer, 22960, 1152 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 22960, 1152);
        const buf = new Uint8Array(1152);
        buf.set(tmp);
        var_model_encoder_layers_2_conv3x3_1_0_weight_buffer = new Float32Array(buf.buffer, 0, 1152 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_2_conv3x3_1_0_weight = builder.constant(
        {dataType: 'float32', shape: [32, 1, 3, 3]},
        var_model_encoder_layers_2_conv3x3_1_0_weight_buffer
    );

    let var_model_encoder_layers_2_conv3x3_1_0_bias_buffer;
    if (24112 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_2_conv3x3_1_0_bias_buffer = new Float32Array(weights_array_buffer, 24112, 128 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 24112, 128);
        const buf = new Uint8Array(128);
        buf.set(tmp);
        var_model_encoder_layers_2_conv3x3_1_0_bias_buffer = new Float32Array(buf.buffer, 0, 128 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_2_conv3x3_1_0_bias = builder.constant(
        {dataType: 'float32', shape: [32]},
        var_model_encoder_layers_2_conv3x3_1_0_bias_buffer
    );

    let var_model_encoder_layers_2_conv3x3_2_0_weight_buffer;
    if (24240 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_2_conv3x3_2_0_weight_buffer = new Float32Array(weights_array_buffer, 24240, 1152 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 24240, 1152);
        const buf = new Uint8Array(1152);
        buf.set(tmp);
        var_model_encoder_layers_2_conv3x3_2_0_weight_buffer = new Float32Array(buf.buffer, 0, 1152 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_2_conv3x3_2_0_weight = builder.constant(
        {dataType: 'float32', shape: [32, 1, 3, 3]},
        var_model_encoder_layers_2_conv3x3_2_0_weight_buffer
    );

    let var_model_encoder_layers_2_conv3x3_2_0_bias_buffer;
    if (25392 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_2_conv3x3_2_0_bias_buffer = new Float32Array(weights_array_buffer, 25392, 128 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 25392, 128);
        const buf = new Uint8Array(128);
        buf.set(tmp);
        var_model_encoder_layers_2_conv3x3_2_0_bias_buffer = new Float32Array(buf.buffer, 0, 128 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_2_conv3x3_2_0_bias = builder.constant(
        {dataType: 'float32', shape: [32]},
        var_model_encoder_layers_2_conv3x3_2_0_bias_buffer
    );

    let var_model_encoder_layers_3_conv3x3_1_0_weight_buffer;
    if (25520 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_3_conv3x3_1_0_weight_buffer = new Float32Array(weights_array_buffer, 25520, 1152 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 25520, 1152);
        const buf = new Uint8Array(1152);
        buf.set(tmp);
        var_model_encoder_layers_3_conv3x3_1_0_weight_buffer = new Float32Array(buf.buffer, 0, 1152 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_3_conv3x3_1_0_weight = builder.constant(
        {dataType: 'float32', shape: [32, 1, 3, 3]},
        var_model_encoder_layers_3_conv3x3_1_0_weight_buffer
    );

    let var_model_encoder_layers_3_conv3x3_1_0_bias_buffer;
    if (26672 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_3_conv3x3_1_0_bias_buffer = new Float32Array(weights_array_buffer, 26672, 128 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 26672, 128);
        const buf = new Uint8Array(128);
        buf.set(tmp);
        var_model_encoder_layers_3_conv3x3_1_0_bias_buffer = new Float32Array(buf.buffer, 0, 128 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_3_conv3x3_1_0_bias = builder.constant(
        {dataType: 'float32', shape: [32]},
        var_model_encoder_layers_3_conv3x3_1_0_bias_buffer
    );

    let var_model_encoder_layers_3_conv3x3_2_0_weight_buffer;
    if (26800 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_3_conv3x3_2_0_weight_buffer = new Float32Array(weights_array_buffer, 26800, 1152 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 26800, 1152);
        const buf = new Uint8Array(1152);
        buf.set(tmp);
        var_model_encoder_layers_3_conv3x3_2_0_weight_buffer = new Float32Array(buf.buffer, 0, 1152 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_3_conv3x3_2_0_weight = builder.constant(
        {dataType: 'float32', shape: [32, 1, 3, 3]},
        var_model_encoder_layers_3_conv3x3_2_0_weight_buffer
    );

    let var_model_encoder_layers_3_conv3x3_2_0_bias_buffer;
    if (27952 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_3_conv3x3_2_0_bias_buffer = new Float32Array(weights_array_buffer, 27952, 128 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 27952, 128);
        const buf = new Uint8Array(128);
        buf.set(tmp);
        var_model_encoder_layers_3_conv3x3_2_0_bias_buffer = new Float32Array(buf.buffer, 0, 128 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_3_conv3x3_2_0_bias = builder.constant(
        {dataType: 'float32', shape: [32]},
        var_model_encoder_layers_3_conv3x3_2_0_bias_buffer
    );

    let var_model_encoder_layers_4_conv_weight_buffer;
    if (28080 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_4_conv_weight_buffer = new Float32Array(weights_array_buffer, 28080, 73728 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 28080, 73728);
        const buf = new Uint8Array(73728);
        buf.set(tmp);
        var_model_encoder_layers_4_conv_weight_buffer = new Float32Array(buf.buffer, 0, 73728 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_4_conv_weight = builder.constant(
        {dataType: 'float32', shape: [64, 32, 3, 3]},
        var_model_encoder_layers_4_conv_weight_buffer
    );

    let var_model_encoder_layers_4_conv_bias_buffer;
    if (101808 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_4_conv_bias_buffer = new Float32Array(weights_array_buffer, 101808, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 101808, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_model_encoder_layers_4_conv_bias_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_4_conv_bias = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_model_encoder_layers_4_conv_bias_buffer
    );

    let var_model_encoder_layers_5_conv3x3_1_0_weight_buffer;
    if (102064 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_5_conv3x3_1_0_weight_buffer = new Float32Array(weights_array_buffer, 102064, 2304 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 102064, 2304);
        const buf = new Uint8Array(2304);
        buf.set(tmp);
        var_model_encoder_layers_5_conv3x3_1_0_weight_buffer = new Float32Array(buf.buffer, 0, 2304 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_5_conv3x3_1_0_weight = builder.constant(
        {dataType: 'float32', shape: [64, 1, 3, 3]},
        var_model_encoder_layers_5_conv3x3_1_0_weight_buffer
    );

    let var_model_encoder_layers_5_conv3x3_1_0_bias_buffer;
    if (104368 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_5_conv3x3_1_0_bias_buffer = new Float32Array(weights_array_buffer, 104368, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 104368, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_model_encoder_layers_5_conv3x3_1_0_bias_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_5_conv3x3_1_0_bias = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_model_encoder_layers_5_conv3x3_1_0_bias_buffer
    );

    let var_model_encoder_layers_5_conv3x3_2_0_weight_buffer;
    if (104624 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_5_conv3x3_2_0_weight_buffer = new Float32Array(weights_array_buffer, 104624, 6400 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 104624, 6400);
        const buf = new Uint8Array(6400);
        buf.set(tmp);
        var_model_encoder_layers_5_conv3x3_2_0_weight_buffer = new Float32Array(buf.buffer, 0, 6400 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_5_conv3x3_2_0_weight = builder.constant(
        {dataType: 'float32', shape: [64, 1, 5, 5]},
        var_model_encoder_layers_5_conv3x3_2_0_weight_buffer
    );

    let var_model_encoder_layers_5_conv3x3_2_0_bias_buffer;
    if (111024 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_5_conv3x3_2_0_bias_buffer = new Float32Array(weights_array_buffer, 111024, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 111024, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_model_encoder_layers_5_conv3x3_2_0_bias_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_5_conv3x3_2_0_bias = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_model_encoder_layers_5_conv3x3_2_0_bias_buffer
    );

    let var_model_encoder_layers_6_conv3x3_1_0_weight_buffer;
    if (111280 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_6_conv3x3_1_0_weight_buffer = new Float32Array(weights_array_buffer, 111280, 6400 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 111280, 6400);
        const buf = new Uint8Array(6400);
        buf.set(tmp);
        var_model_encoder_layers_6_conv3x3_1_0_weight_buffer = new Float32Array(buf.buffer, 0, 6400 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_6_conv3x3_1_0_weight = builder.constant(
        {dataType: 'float32', shape: [64, 1, 5, 5]},
        var_model_encoder_layers_6_conv3x3_1_0_weight_buffer
    );

    let var_model_encoder_layers_6_conv3x3_1_0_bias_buffer;
    if (117680 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_6_conv3x3_1_0_bias_buffer = new Float32Array(weights_array_buffer, 117680, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 117680, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_model_encoder_layers_6_conv3x3_1_0_bias_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_6_conv3x3_1_0_bias = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_model_encoder_layers_6_conv3x3_1_0_bias_buffer
    );

    let var_model_encoder_layers_6_conv3x3_2_0_weight_buffer;
    if (117936 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_6_conv3x3_2_0_weight_buffer = new Float32Array(weights_array_buffer, 117936, 6400 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 117936, 6400);
        const buf = new Uint8Array(6400);
        buf.set(tmp);
        var_model_encoder_layers_6_conv3x3_2_0_weight_buffer = new Float32Array(buf.buffer, 0, 6400 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_6_conv3x3_2_0_weight = builder.constant(
        {dataType: 'float32', shape: [64, 1, 5, 5]},
        var_model_encoder_layers_6_conv3x3_2_0_weight_buffer
    );

    let var_model_encoder_layers_6_conv3x3_2_0_bias_buffer;
    if (124336 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_6_conv3x3_2_0_bias_buffer = new Float32Array(weights_array_buffer, 124336, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 124336, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_model_encoder_layers_6_conv3x3_2_0_bias_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_6_conv3x3_2_0_bias = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_model_encoder_layers_6_conv3x3_2_0_bias_buffer
    );

    let var_model_encoder_layers_7_conv3x3_1_0_weight_buffer;
    if (124592 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_7_conv3x3_1_0_weight_buffer = new Float32Array(weights_array_buffer, 124592, 6400 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 124592, 6400);
        const buf = new Uint8Array(6400);
        buf.set(tmp);
        var_model_encoder_layers_7_conv3x3_1_0_weight_buffer = new Float32Array(buf.buffer, 0, 6400 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_7_conv3x3_1_0_weight = builder.constant(
        {dataType: 'float32', shape: [64, 1, 5, 5]},
        var_model_encoder_layers_7_conv3x3_1_0_weight_buffer
    );

    let var_model_encoder_layers_7_conv3x3_1_0_bias_buffer;
    if (130992 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_7_conv3x3_1_0_bias_buffer = new Float32Array(weights_array_buffer, 130992, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 130992, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_model_encoder_layers_7_conv3x3_1_0_bias_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_7_conv3x3_1_0_bias = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_model_encoder_layers_7_conv3x3_1_0_bias_buffer
    );

    let var_model_encoder_layers_7_conv3x3_2_0_weight_buffer;
    if (131248 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_7_conv3x3_2_0_weight_buffer = new Float32Array(weights_array_buffer, 131248, 12544 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 131248, 12544);
        const buf = new Uint8Array(12544);
        buf.set(tmp);
        var_model_encoder_layers_7_conv3x3_2_0_weight_buffer = new Float32Array(buf.buffer, 0, 12544 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_7_conv3x3_2_0_weight = builder.constant(
        {dataType: 'float32', shape: [64, 1, 7, 7]},
        var_model_encoder_layers_7_conv3x3_2_0_weight_buffer
    );

    let var_model_encoder_layers_7_conv3x3_2_0_bias_buffer;
    if (143792 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_7_conv3x3_2_0_bias_buffer = new Float32Array(weights_array_buffer, 143792, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 143792, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_model_encoder_layers_7_conv3x3_2_0_bias_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_7_conv3x3_2_0_bias = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_model_encoder_layers_7_conv3x3_2_0_bias_buffer
    );

    let var_model_encoder_layers_8_conv3x3_1_0_weight_buffer;
    if (144048 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_8_conv3x3_1_0_weight_buffer = new Float32Array(weights_array_buffer, 144048, 2304 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 144048, 2304);
        const buf = new Uint8Array(2304);
        buf.set(tmp);
        var_model_encoder_layers_8_conv3x3_1_0_weight_buffer = new Float32Array(buf.buffer, 0, 2304 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_8_conv3x3_1_0_weight = builder.constant(
        {dataType: 'float32', shape: [64, 1, 3, 3]},
        var_model_encoder_layers_8_conv3x3_1_0_weight_buffer
    );

    let var_model_encoder_layers_8_conv3x3_1_0_bias_buffer;
    if (146352 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_8_conv3x3_1_0_bias_buffer = new Float32Array(weights_array_buffer, 146352, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 146352, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_model_encoder_layers_8_conv3x3_1_0_bias_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_8_conv3x3_1_0_bias = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_model_encoder_layers_8_conv3x3_1_0_bias_buffer
    );

    let var_model_encoder_layers_8_conv3x3_2_0_weight_buffer;
    if (146608 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_8_conv3x3_2_0_weight_buffer = new Float32Array(weights_array_buffer, 146608, 6400 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 146608, 6400);
        const buf = new Uint8Array(6400);
        buf.set(tmp);
        var_model_encoder_layers_8_conv3x3_2_0_weight_buffer = new Float32Array(buf.buffer, 0, 6400 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_8_conv3x3_2_0_weight = builder.constant(
        {dataType: 'float32', shape: [64, 1, 5, 5]},
        var_model_encoder_layers_8_conv3x3_2_0_weight_buffer
    );

    let var_model_encoder_layers_8_conv3x3_2_0_bias_buffer;
    if (153008 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_8_conv3x3_2_0_bias_buffer = new Float32Array(weights_array_buffer, 153008, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 153008, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_model_encoder_layers_8_conv3x3_2_0_bias_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_8_conv3x3_2_0_bias = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_model_encoder_layers_8_conv3x3_2_0_bias_buffer
    );

    let var_model_encoder_layers_9_conv3x3_1_0_weight_buffer;
    if (153264 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_9_conv3x3_1_0_weight_buffer = new Float32Array(weights_array_buffer, 153264, 6400 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 153264, 6400);
        const buf = new Uint8Array(6400);
        buf.set(tmp);
        var_model_encoder_layers_9_conv3x3_1_0_weight_buffer = new Float32Array(buf.buffer, 0, 6400 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_9_conv3x3_1_0_weight = builder.constant(
        {dataType: 'float32', shape: [64, 1, 5, 5]},
        var_model_encoder_layers_9_conv3x3_1_0_weight_buffer
    );

    let var_model_encoder_layers_9_conv3x3_1_0_bias_buffer;
    if (159664 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_9_conv3x3_1_0_bias_buffer = new Float32Array(weights_array_buffer, 159664, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 159664, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_model_encoder_layers_9_conv3x3_1_0_bias_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_9_conv3x3_1_0_bias = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_model_encoder_layers_9_conv3x3_1_0_bias_buffer
    );

    let var_model_encoder_layers_9_conv3x3_2_0_weight_buffer;
    if (159920 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_9_conv3x3_2_0_weight_buffer = new Float32Array(weights_array_buffer, 159920, 6400 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 159920, 6400);
        const buf = new Uint8Array(6400);
        buf.set(tmp);
        var_model_encoder_layers_9_conv3x3_2_0_weight_buffer = new Float32Array(buf.buffer, 0, 6400 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_9_conv3x3_2_0_weight = builder.constant(
        {dataType: 'float32', shape: [64, 1, 5, 5]},
        var_model_encoder_layers_9_conv3x3_2_0_weight_buffer
    );

    let var_model_encoder_layers_9_conv3x3_2_0_bias_buffer;
    if (166320 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_9_conv3x3_2_0_bias_buffer = new Float32Array(weights_array_buffer, 166320, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 166320, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_model_encoder_layers_9_conv3x3_2_0_bias_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_9_conv3x3_2_0_bias = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_model_encoder_layers_9_conv3x3_2_0_bias_buffer
    );

    let var_model_encoder_layers_10_conv3x3_1_0_weight_buffer;
    if (166576 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_10_conv3x3_1_0_weight_buffer = new Float32Array(weights_array_buffer, 166576, 6400 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 166576, 6400);
        const buf = new Uint8Array(6400);
        buf.set(tmp);
        var_model_encoder_layers_10_conv3x3_1_0_weight_buffer = new Float32Array(buf.buffer, 0, 6400 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_10_conv3x3_1_0_weight = builder.constant(
        {dataType: 'float32', shape: [64, 1, 5, 5]},
        var_model_encoder_layers_10_conv3x3_1_0_weight_buffer
    );

    let var_model_encoder_layers_10_conv3x3_1_0_bias_buffer;
    if (172976 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_10_conv3x3_1_0_bias_buffer = new Float32Array(weights_array_buffer, 172976, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 172976, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_model_encoder_layers_10_conv3x3_1_0_bias_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_10_conv3x3_1_0_bias = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_model_encoder_layers_10_conv3x3_1_0_bias_buffer
    );

    let var_model_encoder_layers_10_conv3x3_2_0_weight_buffer;
    if (173232 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_10_conv3x3_2_0_weight_buffer = new Float32Array(weights_array_buffer, 173232, 12544 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 173232, 12544);
        const buf = new Uint8Array(12544);
        buf.set(tmp);
        var_model_encoder_layers_10_conv3x3_2_0_weight_buffer = new Float32Array(buf.buffer, 0, 12544 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_10_conv3x3_2_0_weight = builder.constant(
        {dataType: 'float32', shape: [64, 1, 7, 7]},
        var_model_encoder_layers_10_conv3x3_2_0_weight_buffer
    );

    let var_model_encoder_layers_10_conv3x3_2_0_bias_buffer;
    if (185776 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_encoder_layers_10_conv3x3_2_0_bias_buffer = new Float32Array(weights_array_buffer, 185776, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 185776, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_model_encoder_layers_10_conv3x3_2_0_bias_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_encoder_layers_10_conv3x3_2_0_bias = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_model_encoder_layers_10_conv3x3_2_0_bias_buffer
    );

    let var_model_seg_weight_buffer;
    if (186032 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_seg_weight_buffer = new Float32Array(weights_array_buffer, 186032, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 186032, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_model_seg_weight_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_seg_weight = builder.constant(
        {dataType: 'float32', shape: [1, 64, 1, 1]},
        var_model_seg_weight_buffer
    );

    let var_model_seg_bias_buffer;
    if (186288 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_seg_bias_buffer = new Float32Array(weights_array_buffer, 186288, 4 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 186288, 4);
        const buf = new Uint8Array(4);
        buf.set(tmp);
        var_model_seg_bias_buffer = new Float32Array(buf.buffer, 0, 4 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_seg_bias = builder.constant(
        {dataType: 'float32', shape: [1]},
        var_model_seg_bias_buffer
    );

    let var_model_up_weight_buffer;
    if (186292 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_model_up_weight_buffer = new Float32Array(weights_array_buffer, 186292, 1024 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 186292, 1024);
        const buf = new Uint8Array(1024);
        buf.set(tmp);
        var_model_up_weight_buffer = new Float32Array(buf.buffer, 0, 1024 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_model_up_weight = builder.constant(
        {dataType: 'float32', shape: [1, 1, 16, 16]},
        var_model_up_weight_buffer
    );

    let var_338_buffer;
    if (187316 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_338_buffer = new Float32Array(weights_array_buffer, 187316, 4096 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 187316, 4096);
        const buf = new Uint8Array(4096);
        buf.set(tmp);
        var_338_buffer = new Float32Array(buf.buffer, 0, 4096 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_338 = builder.constant(
        {dataType: 'float32', shape: [32, 32, 1, 1]},
        var_338_buffer
    );

    let var_339_buffer;
    if (191412 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_339_buffer = new Float32Array(weights_array_buffer, 191412, 128 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 191412, 128);
        const buf = new Uint8Array(128);
        buf.set(tmp);
        var_339_buffer = new Float32Array(buf.buffer, 0, 128 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_339 = builder.constant(
        {dataType: 'float32', shape: [32]},
        var_339_buffer
    );

    let var_341_buffer;
    if (191540 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_341_buffer = new Float32Array(weights_array_buffer, 191540, 4096 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 191540, 4096);
        const buf = new Uint8Array(4096);
        buf.set(tmp);
        var_341_buffer = new Float32Array(buf.buffer, 0, 4096 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_341 = builder.constant(
        {dataType: 'float32', shape: [32, 32, 1, 1]},
        var_341_buffer
    );

    let var_342_buffer;
    if (195636 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_342_buffer = new Float32Array(weights_array_buffer, 195636, 128 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 195636, 128);
        const buf = new Uint8Array(128);
        buf.set(tmp);
        var_342_buffer = new Float32Array(buf.buffer, 0, 128 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_342 = builder.constant(
        {dataType: 'float32', shape: [32]},
        var_342_buffer
    );

    let var_344_buffer;
    if (195764 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_344_buffer = new Float32Array(weights_array_buffer, 195764, 4096 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 195764, 4096);
        const buf = new Uint8Array(4096);
        buf.set(tmp);
        var_344_buffer = new Float32Array(buf.buffer, 0, 4096 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_344 = builder.constant(
        {dataType: 'float32', shape: [32, 32, 1, 1]},
        var_344_buffer
    );

    let var_345_buffer;
    if (199860 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_345_buffer = new Float32Array(weights_array_buffer, 199860, 128 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 199860, 128);
        const buf = new Uint8Array(128);
        buf.set(tmp);
        var_345_buffer = new Float32Array(buf.buffer, 0, 128 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_345 = builder.constant(
        {dataType: 'float32', shape: [32]},
        var_345_buffer
    );

    let var_347_buffer;
    if (199988 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_347_buffer = new Float32Array(weights_array_buffer, 199988, 4096 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 199988, 4096);
        const buf = new Uint8Array(4096);
        buf.set(tmp);
        var_347_buffer = new Float32Array(buf.buffer, 0, 4096 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_347 = builder.constant(
        {dataType: 'float32', shape: [32, 32, 1, 1]},
        var_347_buffer
    );

    let var_348_buffer;
    if (204084 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_348_buffer = new Float32Array(weights_array_buffer, 204084, 128 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 204084, 128);
        const buf = new Uint8Array(128);
        buf.set(tmp);
        var_348_buffer = new Float32Array(buf.buffer, 0, 128 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_348 = builder.constant(
        {dataType: 'float32', shape: [32]},
        var_348_buffer
    );

    let var_350_buffer;
    if (204212 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_350_buffer = new Float32Array(weights_array_buffer, 204212, 4096 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 204212, 4096);
        const buf = new Uint8Array(4096);
        buf.set(tmp);
        var_350_buffer = new Float32Array(buf.buffer, 0, 4096 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_350 = builder.constant(
        {dataType: 'float32', shape: [32, 32, 1, 1]},
        var_350_buffer
    );

    let var_351_buffer;
    if (208308 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_351_buffer = new Float32Array(weights_array_buffer, 208308, 128 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 208308, 128);
        const buf = new Uint8Array(128);
        buf.set(tmp);
        var_351_buffer = new Float32Array(buf.buffer, 0, 128 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_351 = builder.constant(
        {dataType: 'float32', shape: [32]},
        var_351_buffer
    );

    let var_353_buffer;
    if (208436 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_353_buffer = new Float32Array(weights_array_buffer, 208436, 4096 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 208436, 4096);
        const buf = new Uint8Array(4096);
        buf.set(tmp);
        var_353_buffer = new Float32Array(buf.buffer, 0, 4096 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_353 = builder.constant(
        {dataType: 'float32', shape: [32, 32, 1, 1]},
        var_353_buffer
    );

    let var_354_buffer;
    if (212532 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_354_buffer = new Float32Array(weights_array_buffer, 212532, 128 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 212532, 128);
        const buf = new Uint8Array(128);
        buf.set(tmp);
        var_354_buffer = new Float32Array(buf.buffer, 0, 128 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_354 = builder.constant(
        {dataType: 'float32', shape: [32]},
        var_354_buffer
    );

    let var_356_buffer;
    if (212660 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_356_buffer = new Float32Array(weights_array_buffer, 212660, 4096 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 212660, 4096);
        const buf = new Uint8Array(4096);
        buf.set(tmp);
        var_356_buffer = new Float32Array(buf.buffer, 0, 4096 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_356 = builder.constant(
        {dataType: 'float32', shape: [32, 32, 1, 1]},
        var_356_buffer
    );

    let var_357_buffer;
    if (216756 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_357_buffer = new Float32Array(weights_array_buffer, 216756, 128 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 216756, 128);
        const buf = new Uint8Array(128);
        buf.set(tmp);
        var_357_buffer = new Float32Array(buf.buffer, 0, 128 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_357 = builder.constant(
        {dataType: 'float32', shape: [32]},
        var_357_buffer
    );

    let var_359_buffer;
    if (216884 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_359_buffer = new Float32Array(weights_array_buffer, 216884, 4096 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 216884, 4096);
        const buf = new Uint8Array(4096);
        buf.set(tmp);
        var_359_buffer = new Float32Array(buf.buffer, 0, 4096 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_359 = builder.constant(
        {dataType: 'float32', shape: [32, 32, 1, 1]},
        var_359_buffer
    );

    let var_360_buffer;
    if (220980 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_360_buffer = new Float32Array(weights_array_buffer, 220980, 128 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 220980, 128);
        const buf = new Uint8Array(128);
        buf.set(tmp);
        var_360_buffer = new Float32Array(buf.buffer, 0, 128 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_360 = builder.constant(
        {dataType: 'float32', shape: [32]},
        var_360_buffer
    );

    let var_362_buffer;
    if (221108 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_362_buffer = new Float32Array(weights_array_buffer, 221108, 4096 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 221108, 4096);
        const buf = new Uint8Array(4096);
        buf.set(tmp);
        var_362_buffer = new Float32Array(buf.buffer, 0, 4096 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_362 = builder.constant(
        {dataType: 'float32', shape: [32, 32, 1, 1]},
        var_362_buffer
    );

    let var_363_buffer;
    if (225204 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_363_buffer = new Float32Array(weights_array_buffer, 225204, 128 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 225204, 128);
        const buf = new Uint8Array(128);
        buf.set(tmp);
        var_363_buffer = new Float32Array(buf.buffer, 0, 128 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_363 = builder.constant(
        {dataType: 'float32', shape: [32]},
        var_363_buffer
    );

    let var_365_buffer;
    if (225332 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_365_buffer = new Float32Array(weights_array_buffer, 225332, 16384 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 225332, 16384);
        const buf = new Uint8Array(16384);
        buf.set(tmp);
        var_365_buffer = new Float32Array(buf.buffer, 0, 16384 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_365 = builder.constant(
        {dataType: 'float32', shape: [64, 64, 1, 1]},
        var_365_buffer
    );

    let var_366_buffer;
    if (241716 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_366_buffer = new Float32Array(weights_array_buffer, 241716, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 241716, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_366_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_366 = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_366_buffer
    );

    let var_368_buffer;
    if (241972 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_368_buffer = new Float32Array(weights_array_buffer, 241972, 16384 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 241972, 16384);
        const buf = new Uint8Array(16384);
        buf.set(tmp);
        var_368_buffer = new Float32Array(buf.buffer, 0, 16384 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_368 = builder.constant(
        {dataType: 'float32', shape: [64, 64, 1, 1]},
        var_368_buffer
    );

    let var_369_buffer;
    if (258356 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_369_buffer = new Float32Array(weights_array_buffer, 258356, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 258356, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_369_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_369 = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_369_buffer
    );

    let var_371_buffer;
    if (258612 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_371_buffer = new Float32Array(weights_array_buffer, 258612, 16384 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 258612, 16384);
        const buf = new Uint8Array(16384);
        buf.set(tmp);
        var_371_buffer = new Float32Array(buf.buffer, 0, 16384 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_371 = builder.constant(
        {dataType: 'float32', shape: [64, 64, 1, 1]},
        var_371_buffer
    );

    let var_372_buffer;
    if (274996 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_372_buffer = new Float32Array(weights_array_buffer, 274996, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 274996, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_372_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_372 = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_372_buffer
    );

    let var_374_buffer;
    if (275252 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_374_buffer = new Float32Array(weights_array_buffer, 275252, 16384 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 275252, 16384);
        const buf = new Uint8Array(16384);
        buf.set(tmp);
        var_374_buffer = new Float32Array(buf.buffer, 0, 16384 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_374 = builder.constant(
        {dataType: 'float32', shape: [64, 64, 1, 1]},
        var_374_buffer
    );

    let var_375_buffer;
    if (291636 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_375_buffer = new Float32Array(weights_array_buffer, 291636, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 291636, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_375_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_375 = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_375_buffer
    );

    let var_377_buffer;
    if (291892 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_377_buffer = new Float32Array(weights_array_buffer, 291892, 16384 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 291892, 16384);
        const buf = new Uint8Array(16384);
        buf.set(tmp);
        var_377_buffer = new Float32Array(buf.buffer, 0, 16384 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_377 = builder.constant(
        {dataType: 'float32', shape: [64, 64, 1, 1]},
        var_377_buffer
    );

    let var_378_buffer;
    if (308276 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_378_buffer = new Float32Array(weights_array_buffer, 308276, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 308276, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_378_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_378 = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_378_buffer
    );

    let var_380_buffer;
    if (308532 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_380_buffer = new Float32Array(weights_array_buffer, 308532, 16384 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 308532, 16384);
        const buf = new Uint8Array(16384);
        buf.set(tmp);
        var_380_buffer = new Float32Array(buf.buffer, 0, 16384 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_380 = builder.constant(
        {dataType: 'float32', shape: [64, 64, 1, 1]},
        var_380_buffer
    );

    let var_381_buffer;
    if (324916 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_381_buffer = new Float32Array(weights_array_buffer, 324916, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 324916, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_381_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_381 = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_381_buffer
    );

    let var_383_buffer;
    if (325172 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_383_buffer = new Float32Array(weights_array_buffer, 325172, 16384 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 325172, 16384);
        const buf = new Uint8Array(16384);
        buf.set(tmp);
        var_383_buffer = new Float32Array(buf.buffer, 0, 16384 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_383 = builder.constant(
        {dataType: 'float32', shape: [64, 64, 1, 1]},
        var_383_buffer
    );

    let var_384_buffer;
    if (341556 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_384_buffer = new Float32Array(weights_array_buffer, 341556, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 341556, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_384_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_384 = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_384_buffer
    );

    let var_386_buffer;
    if (341812 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_386_buffer = new Float32Array(weights_array_buffer, 341812, 16384 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 341812, 16384);
        const buf = new Uint8Array(16384);
        buf.set(tmp);
        var_386_buffer = new Float32Array(buf.buffer, 0, 16384 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_386 = builder.constant(
        {dataType: 'float32', shape: [64, 64, 1, 1]},
        var_386_buffer
    );

    let var_387_buffer;
    if (358196 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_387_buffer = new Float32Array(weights_array_buffer, 358196, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 358196, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_387_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_387 = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_387_buffer
    );

    let var_389_buffer;
    if (358452 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_389_buffer = new Float32Array(weights_array_buffer, 358452, 16384 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 358452, 16384);
        const buf = new Uint8Array(16384);
        buf.set(tmp);
        var_389_buffer = new Float32Array(buf.buffer, 0, 16384 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_389 = builder.constant(
        {dataType: 'float32', shape: [64, 64, 1, 1]},
        var_389_buffer
    );

    let var_390_buffer;
    if (374836 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_390_buffer = new Float32Array(weights_array_buffer, 374836, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 374836, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_390_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_390 = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_390_buffer
    );

    let var_392_buffer;
    if (375092 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_392_buffer = new Float32Array(weights_array_buffer, 375092, 16384 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 375092, 16384);
        const buf = new Uint8Array(16384);
        buf.set(tmp);
        var_392_buffer = new Float32Array(buf.buffer, 0, 16384 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_392 = builder.constant(
        {dataType: 'float32', shape: [64, 64, 1, 1]},
        var_392_buffer
    );

    let var_393_buffer;
    if (391476 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_393_buffer = new Float32Array(weights_array_buffer, 391476, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 391476, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_393_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_393 = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_393_buffer
    );

    let var_395_buffer;
    if (391732 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_395_buffer = new Float32Array(weights_array_buffer, 391732, 16384 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 391732, 16384);
        const buf = new Uint8Array(16384);
        buf.set(tmp);
        var_395_buffer = new Float32Array(buf.buffer, 0, 16384 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_395 = builder.constant(
        {dataType: 'float32', shape: [64, 64, 1, 1]},
        var_395_buffer
    );

    let var_396_buffer;
    if (408116 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_396_buffer = new Float32Array(weights_array_buffer, 408116, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 408116, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_396_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_396 = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_396_buffer
    );

    let var_398_buffer;
    if (408372 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_398_buffer = new Float32Array(weights_array_buffer, 408372, 16384 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 408372, 16384);
        const buf = new Uint8Array(16384);
        buf.set(tmp);
        var_398_buffer = new Float32Array(buf.buffer, 0, 16384 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_398 = builder.constant(
        {dataType: 'float32', shape: [64, 64, 1, 1]},
        var_398_buffer
    );

    let var_399_buffer;
    if (424756 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_399_buffer = new Float32Array(weights_array_buffer, 424756, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 424756, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_399_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_399 = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_399_buffer
    );

    let var_401_buffer;
    if (425012 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_401_buffer = new Float32Array(weights_array_buffer, 425012, 16384 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 425012, 16384);
        const buf = new Uint8Array(16384);
        buf.set(tmp);
        var_401_buffer = new Float32Array(buf.buffer, 0, 16384 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_401 = builder.constant(
        {dataType: 'float32', shape: [64, 64, 1, 1]},
        var_401_buffer
    );

    let var_402_buffer;
    if (441396 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_402_buffer = new Float32Array(weights_array_buffer, 441396, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 441396, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_402_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_402 = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_402_buffer
    );

    let var_404_buffer;
    if (441652 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_404_buffer = new Float32Array(weights_array_buffer, 441652, 16384 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 441652, 16384);
        const buf = new Uint8Array(16384);
        buf.set(tmp);
        var_404_buffer = new Float32Array(buf.buffer, 0, 16384 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_404 = builder.constant(
        {dataType: 'float32', shape: [64, 64, 1, 1]},
        var_404_buffer
    );

    let var_405_buffer;
    if (458036 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_405_buffer = new Float32Array(weights_array_buffer, 458036, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 458036, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_405_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_405 = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_405_buffer
    );

    let var_407_buffer;
    if (458292 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_407_buffer = new Float32Array(weights_array_buffer, 458292, 16384 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 458292, 16384);
        const buf = new Uint8Array(16384);
        buf.set(tmp);
        var_407_buffer = new Float32Array(buf.buffer, 0, 16384 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_407 = builder.constant(
        {dataType: 'float32', shape: [64, 64, 1, 1]},
        var_407_buffer
    );

    let var_408_buffer;
    if (474676 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_408_buffer = new Float32Array(weights_array_buffer, 474676, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 474676, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_408_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_408 = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_408_buffer
    );

    let var_410_buffer;
    if (474932 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_410_buffer = new Float32Array(weights_array_buffer, 474932, 16384 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 474932, 16384);
        const buf = new Uint8Array(16384);
        buf.set(tmp);
        var_410_buffer = new Float32Array(buf.buffer, 0, 16384 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_410 = builder.constant(
        {dataType: 'float32', shape: [64, 64, 1, 1]},
        var_410_buffer
    );

    let var_411_buffer;
    if (491316 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_411_buffer = new Float32Array(weights_array_buffer, 491316, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 491316, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_411_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_411 = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_411_buffer
    );

    let var_413_buffer;
    if (491572 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_413_buffer = new Float32Array(weights_array_buffer, 491572, 16384 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 491572, 16384);
        const buf = new Uint8Array(16384);
        buf.set(tmp);
        var_413_buffer = new Float32Array(buf.buffer, 0, 16384 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_413 = builder.constant(
        {dataType: 'float32', shape: [64, 64, 1, 1]},
        var_413_buffer
    );

    let var_414_buffer;
    if (507956 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_414_buffer = new Float32Array(weights_array_buffer, 507956, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 507956, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_414_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_414 = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_414_buffer
    );

    let var_416_buffer;
    if (508212 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_416_buffer = new Float32Array(weights_array_buffer, 508212, 16384 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 508212, 16384);
        const buf = new Uint8Array(16384);
        buf.set(tmp);
        var_416_buffer = new Float32Array(buf.buffer, 0, 16384 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_416 = builder.constant(
        {dataType: 'float32', shape: [64, 64, 1, 1]},
        var_416_buffer
    );

    let var_417_buffer;
    if (524596 % Float32Array.BYTES_PER_ELEMENT === 0) {
        var_417_buffer = new Float32Array(weights_array_buffer, 524596, 256 / Float32Array.BYTES_PER_ELEMENT);
    } else {
        // Offset is not aligned, copy to a new Uint8Array and create typed array from it
        const tmp = new Uint8Array(weights_array_buffer, 524596, 256);
        const buf = new Uint8Array(256);
        buf.set(tmp);
        var_417_buffer = new Float32Array(buf.buffer, 0, 256 / Float32Array.BYTES_PER_ELEMENT);
    }
    const var_417 = builder.constant(
        {dataType: 'float32', shape: [64]},
        var_417_buffer
    );

    // Create graph input operands and tensors.

    // Transpose input from NCHW -> NHWC.

    const input = builder.transpose(
        builder.input('input', {dataType: 'float32', shape: [1, 3, 144, 256]}),
        { permutation: [0, 2, 3, 1] }
    );

    this.inputTensors_['input'] = await this.context_.createTensor(
        {dataType: 'float32', shape: [1, 3, 144, 256], writable: true}
    );

    // Create graph operators.

    // Re-create constant operand from transposed weights.

    const var_yuv2rgb_weight_transposed = builder.constant(
        {dataType: 'float32', shape: [3, 1, 1, 3]},
        new Float32Array(weights_array_buffer, 0, 36 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_210 = builder.conv2d(
        input, var_yuv2rgb_weight_transposed,
        {
            bias: var_yuv2rgb_bias, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    // Re-create constant operand from transposed weights.

    const var_model_encoder_initial_block_conv_weight_transposed = builder.constant(
        {dataType: 'float32', shape: [16, 3, 3, 3]},
        new Float32Array(weights_array_buffer, 48, 1728 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_211 = builder.conv2d(
        var_210, var_model_encoder_initial_block_conv_weight_transposed,
        {
            bias: var_model_encoder_initial_block_conv_bias, strides: [2, 2], padding: [1, 1, 1, 1], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    const var_212 = builder.relu(var_211);

    // Re-create constant operand from transposed weights.

    const var_model_encoder_layers_0_conv_weight_transposed = builder.constant(
        {dataType: 'float32', shape: [32, 3, 3, 16]},
        new Float32Array(weights_array_buffer, 1840, 18432 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_213 = builder.conv2d(
        var_212, var_model_encoder_layers_0_conv_weight_transposed,
        {
            bias: var_model_encoder_layers_0_conv_bias, strides: [2, 2], padding: [1, 1, 1, 1], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    const var_214 = builder.relu(var_213);

    // Re-create constant operand from transposed weights.

    const var_model_encoder_layers_1_conv3x3_1_0_weight_transposed = builder.constant(
        {dataType: 'float32', shape: [1, 3, 3, 32]},
        new Float32Array(weights_array_buffer, 20400, 1152 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_215 = builder.conv2d(
        var_214, var_model_encoder_layers_1_conv3x3_1_0_weight_transposed,
        {
            bias: var_model_encoder_layers_1_conv3x3_1_0_bias, strides: [1, 1], padding: [1, 1, 1, 1], dilations: [1, 1], groups: 32, filterLayout: 'ihwo', inputLayout: 'nhwc'
        }
    );

    const var_216 = builder.relu(var_215);

    // Re-create constant operand from transposed weights.

    const var_338_transposed = builder.constant(
        {dataType: 'float32', shape: [32, 1, 1, 32]},
        new Float32Array(weights_array_buffer, 187316, 4096 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_337 = builder.conv2d(
        var_216, var_338_transposed,
        {
            bias: var_339, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    const var_219 = builder.relu(var_337);

    // Re-create constant operand from transposed weights.

    const var_model_encoder_layers_1_conv3x3_2_0_weight_transposed = builder.constant(
        {dataType: 'float32', shape: [1, 3, 3, 32]},
        new Float32Array(weights_array_buffer, 21680, 1152 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_220 = builder.conv2d(
        var_219, var_model_encoder_layers_1_conv3x3_2_0_weight_transposed,
        {
            bias: var_model_encoder_layers_1_conv3x3_2_0_bias, strides: [1, 1], padding: [1, 1, 1, 1], dilations: [1, 1], groups: 32, filterLayout: 'ihwo', inputLayout: 'nhwc'
        }
    );

    const var_221 = builder.relu(var_220);

    // Re-create constant operand from transposed weights.

    const var_341_transposed = builder.constant(
        {dataType: 'float32', shape: [32, 1, 1, 32]},
        new Float32Array(weights_array_buffer, 191540, 4096 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_340 = builder.conv2d(
        var_221, var_341_transposed,
        {
            bias: var_342, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    // Re-create constant operand from transposed weights.

    const var_344_transposed = builder.constant(
        {dataType: 'float32', shape: [32, 1, 1, 32]},
        new Float32Array(weights_array_buffer, 195764, 4096 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_343 = builder.conv2d(
        var_214, var_344_transposed,
        {
            bias: var_345, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    const var_226 = builder.add(var_340, var_343);

    const var_227 = builder.relu(var_226);

    // Re-create constant operand from transposed weights.

    const var_model_encoder_layers_2_conv3x3_1_0_weight_transposed = builder.constant(
        {dataType: 'float32', shape: [1, 3, 3, 32]},
        new Float32Array(weights_array_buffer, 22960, 1152 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_228 = builder.conv2d(
        var_227, var_model_encoder_layers_2_conv3x3_1_0_weight_transposed,
        {
            bias: var_model_encoder_layers_2_conv3x3_1_0_bias, strides: [1, 1], padding: [1, 1, 1, 1], dilations: [1, 1], groups: 32, filterLayout: 'ihwo', inputLayout: 'nhwc'
        }
    );

    const var_229 = builder.relu(var_228);

    // Re-create constant operand from transposed weights.

    const var_347_transposed = builder.constant(
        {dataType: 'float32', shape: [32, 1, 1, 32]},
        new Float32Array(weights_array_buffer, 199988, 4096 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_346 = builder.conv2d(
        var_229, var_347_transposed,
        {
            bias: var_348, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    const var_232 = builder.relu(var_346);

    // Re-create constant operand from transposed weights.

    const var_model_encoder_layers_2_conv3x3_2_0_weight_transposed = builder.constant(
        {dataType: 'float32', shape: [1, 3, 3, 32]},
        new Float32Array(weights_array_buffer, 24240, 1152 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_233 = builder.conv2d(
        var_232, var_model_encoder_layers_2_conv3x3_2_0_weight_transposed,
        {
            bias: var_model_encoder_layers_2_conv3x3_2_0_bias, strides: [1, 1], padding: [1, 1, 1, 1], dilations: [1, 1], groups: 32, filterLayout: 'ihwo', inputLayout: 'nhwc'
        }
    );

    const var_234 = builder.relu(var_233);

    // Re-create constant operand from transposed weights.

    const var_350_transposed = builder.constant(
        {dataType: 'float32', shape: [32, 1, 1, 32]},
        new Float32Array(weights_array_buffer, 204212, 4096 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_349 = builder.conv2d(
        var_234, var_350_transposed,
        {
            bias: var_351, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    // Re-create constant operand from transposed weights.

    const var_353_transposed = builder.constant(
        {dataType: 'float32', shape: [32, 1, 1, 32]},
        new Float32Array(weights_array_buffer, 208436, 4096 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_352 = builder.conv2d(
        var_227, var_353_transposed,
        {
            bias: var_354, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    const var_239 = builder.add(var_349, var_352);

    const var_240 = builder.relu(var_239);

    // Re-create constant operand from transposed weights.

    const var_model_encoder_layers_3_conv3x3_1_0_weight_transposed = builder.constant(
        {dataType: 'float32', shape: [1, 3, 3, 32]},
        new Float32Array(weights_array_buffer, 25520, 1152 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_241 = builder.conv2d(
        var_240, var_model_encoder_layers_3_conv3x3_1_0_weight_transposed,
        {
            bias: var_model_encoder_layers_3_conv3x3_1_0_bias, strides: [1, 1], padding: [1, 1, 1, 1], dilations: [1, 1], groups: 32, filterLayout: 'ihwo', inputLayout: 'nhwc'
        }
    );

    const var_242 = builder.relu(var_241);

    // Re-create constant operand from transposed weights.

    const var_356_transposed = builder.constant(
        {dataType: 'float32', shape: [32, 1, 1, 32]},
        new Float32Array(weights_array_buffer, 212660, 4096 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_355 = builder.conv2d(
        var_242, var_356_transposed,
        {
            bias: var_357, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    const var_245 = builder.relu(var_355);

    // Re-create constant operand from transposed weights.

    const var_model_encoder_layers_3_conv3x3_2_0_weight_transposed = builder.constant(
        {dataType: 'float32', shape: [1, 3, 3, 32]},
        new Float32Array(weights_array_buffer, 26800, 1152 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_246 = builder.conv2d(
        var_245, var_model_encoder_layers_3_conv3x3_2_0_weight_transposed,
        {
            bias: var_model_encoder_layers_3_conv3x3_2_0_bias, strides: [1, 1], padding: [1, 1, 1, 1], dilations: [1, 1], groups: 32, filterLayout: 'ihwo', inputLayout: 'nhwc'
        }
    );

    const var_247 = builder.relu(var_246);

    // Re-create constant operand from transposed weights.

    const var_359_transposed = builder.constant(
        {dataType: 'float32', shape: [32, 1, 1, 32]},
        new Float32Array(weights_array_buffer, 216884, 4096 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_358 = builder.conv2d(
        var_247, var_359_transposed,
        {
            bias: var_360, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    // Re-create constant operand from transposed weights.

    const var_362_transposed = builder.constant(
        {dataType: 'float32', shape: [32, 1, 1, 32]},
        new Float32Array(weights_array_buffer, 221108, 4096 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_361 = builder.conv2d(
        var_240, var_362_transposed,
        {
            bias: var_363, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    const var_252 = builder.add(var_358, var_361);

    const var_253 = builder.relu(var_252);

    // Re-create constant operand from transposed weights.

    const var_model_encoder_layers_4_conv_weight_transposed = builder.constant(
        {dataType: 'float32', shape: [64, 3, 3, 32]},
        new Float32Array(weights_array_buffer, 28080, 73728 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_254 = builder.conv2d(
        var_253, var_model_encoder_layers_4_conv_weight_transposed,
        {
            bias: var_model_encoder_layers_4_conv_bias, strides: [2, 2], padding: [1, 1, 1, 1], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    const var_255 = builder.relu(var_254);

    // Re-create constant operand from transposed weights.

    const var_model_encoder_layers_5_conv3x3_1_0_weight_transposed = builder.constant(
        {dataType: 'float32', shape: [1, 3, 3, 64]},
        new Float32Array(weights_array_buffer, 102064, 2304 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_256 = builder.conv2d(
        var_255, var_model_encoder_layers_5_conv3x3_1_0_weight_transposed,
        {
            bias: var_model_encoder_layers_5_conv3x3_1_0_bias, strides: [1, 1], padding: [1, 1, 1, 1], dilations: [1, 1], groups: 64, filterLayout: 'ihwo', inputLayout: 'nhwc'
        }
    );

    const var_257 = builder.relu(var_256);

    // Re-create constant operand from transposed weights.

    const var_365_transposed = builder.constant(
        {dataType: 'float32', shape: [64, 1, 1, 64]},
        new Float32Array(weights_array_buffer, 225332, 16384 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_364 = builder.conv2d(
        var_257, var_365_transposed,
        {
            bias: var_366, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    const var_260 = builder.relu(var_364);

    // Re-create constant operand from transposed weights.

    const var_model_encoder_layers_5_conv3x3_2_0_weight_transposed = builder.constant(
        {dataType: 'float32', shape: [1, 5, 5, 64]},
        new Float32Array(weights_array_buffer, 104624, 6400 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_261 = builder.conv2d(
        var_260, var_model_encoder_layers_5_conv3x3_2_0_weight_transposed,
        {
            bias: var_model_encoder_layers_5_conv3x3_2_0_bias, strides: [1, 1], padding: [2, 2, 2, 2], dilations: [1, 1], groups: 64, filterLayout: 'ihwo', inputLayout: 'nhwc'
        }
    );

    const var_262 = builder.relu(var_261);

    // Re-create constant operand from transposed weights.

    const var_368_transposed = builder.constant(
        {dataType: 'float32', shape: [64, 1, 1, 64]},
        new Float32Array(weights_array_buffer, 241972, 16384 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_367 = builder.conv2d(
        var_262, var_368_transposed,
        {
            bias: var_369, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    // Re-create constant operand from transposed weights.

    const var_371_transposed = builder.constant(
        {dataType: 'float32', shape: [64, 1, 1, 64]},
        new Float32Array(weights_array_buffer, 258612, 16384 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_370 = builder.conv2d(
        var_255, var_371_transposed,
        {
            bias: var_372, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    const var_267 = builder.add(var_367, var_370);

    const var_268 = builder.relu(var_267);

    // Re-create constant operand from transposed weights.

    const var_model_encoder_layers_6_conv3x3_1_0_weight_transposed = builder.constant(
        {dataType: 'float32', shape: [1, 5, 5, 64]},
        new Float32Array(weights_array_buffer, 111280, 6400 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_269 = builder.conv2d(
        var_268, var_model_encoder_layers_6_conv3x3_1_0_weight_transposed,
        {
            bias: var_model_encoder_layers_6_conv3x3_1_0_bias, strides: [1, 1], padding: [2, 2, 2, 2], dilations: [1, 1], groups: 64, filterLayout: 'ihwo', inputLayout: 'nhwc'
        }
    );

    const var_270 = builder.relu(var_269);

    // Re-create constant operand from transposed weights.

    const var_374_transposed = builder.constant(
        {dataType: 'float32', shape: [64, 1, 1, 64]},
        new Float32Array(weights_array_buffer, 275252, 16384 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_373 = builder.conv2d(
        var_270, var_374_transposed,
        {
            bias: var_375, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    const var_273 = builder.relu(var_373);

    // Re-create constant operand from transposed weights.

    const var_model_encoder_layers_6_conv3x3_2_0_weight_transposed = builder.constant(
        {dataType: 'float32', shape: [1, 5, 5, 64]},
        new Float32Array(weights_array_buffer, 117936, 6400 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_274 = builder.conv2d(
        var_273, var_model_encoder_layers_6_conv3x3_2_0_weight_transposed,
        {
            bias: var_model_encoder_layers_6_conv3x3_2_0_bias, strides: [1, 1], padding: [2, 2, 2, 2], dilations: [1, 1], groups: 64, filterLayout: 'ihwo', inputLayout: 'nhwc'
        }
    );

    const var_275 = builder.relu(var_274);

    // Re-create constant operand from transposed weights.

    const var_377_transposed = builder.constant(
        {dataType: 'float32', shape: [64, 1, 1, 64]},
        new Float32Array(weights_array_buffer, 291892, 16384 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_376 = builder.conv2d(
        var_275, var_377_transposed,
        {
            bias: var_378, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    // Re-create constant operand from transposed weights.

    const var_380_transposed = builder.constant(
        {dataType: 'float32', shape: [64, 1, 1, 64]},
        new Float32Array(weights_array_buffer, 308532, 16384 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_379 = builder.conv2d(
        var_268, var_380_transposed,
        {
            bias: var_381, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    const var_280 = builder.add(var_376, var_379);

    const var_281 = builder.relu(var_280);

    // Re-create constant operand from transposed weights.

    const var_model_encoder_layers_7_conv3x3_1_0_weight_transposed = builder.constant(
        {dataType: 'float32', shape: [1, 5, 5, 64]},
        new Float32Array(weights_array_buffer, 124592, 6400 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_282 = builder.conv2d(
        var_281, var_model_encoder_layers_7_conv3x3_1_0_weight_transposed,
        {
            bias: var_model_encoder_layers_7_conv3x3_1_0_bias, strides: [1, 1], padding: [2, 2, 2, 2], dilations: [1, 1], groups: 64, filterLayout: 'ihwo', inputLayout: 'nhwc'
        }
    );

    const var_283 = builder.relu(var_282);

    // Re-create constant operand from transposed weights.

    const var_383_transposed = builder.constant(
        {dataType: 'float32', shape: [64, 1, 1, 64]},
        new Float32Array(weights_array_buffer, 325172, 16384 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_382 = builder.conv2d(
        var_283, var_383_transposed,
        {
            bias: var_384, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    const var_286 = builder.relu(var_382);

    // Re-create constant operand from transposed weights.

    const var_model_encoder_layers_7_conv3x3_2_0_weight_transposed = builder.constant(
        {dataType: 'float32', shape: [1, 7, 7, 64]},
        new Float32Array(weights_array_buffer, 131248, 12544 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_287 = builder.conv2d(
        var_286, var_model_encoder_layers_7_conv3x3_2_0_weight_transposed,
        {
            bias: var_model_encoder_layers_7_conv3x3_2_0_bias, strides: [1, 1], padding: [3, 3, 3, 3], dilations: [1, 1], groups: 64, filterLayout: 'ihwo', inputLayout: 'nhwc'
        }
    );

    const var_288 = builder.relu(var_287);

    // Re-create constant operand from transposed weights.

    const var_386_transposed = builder.constant(
        {dataType: 'float32', shape: [64, 1, 1, 64]},
        new Float32Array(weights_array_buffer, 341812, 16384 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_385 = builder.conv2d(
        var_288, var_386_transposed,
        {
            bias: var_387, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    // Re-create constant operand from transposed weights.

    const var_389_transposed = builder.constant(
        {dataType: 'float32', shape: [64, 1, 1, 64]},
        new Float32Array(weights_array_buffer, 358452, 16384 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_388 = builder.conv2d(
        var_281, var_389_transposed,
        {
            bias: var_390, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    const var_293 = builder.add(var_385, var_388);

    const var_294 = builder.relu(var_293);

    // Re-create constant operand from transposed weights.

    const var_model_encoder_layers_8_conv3x3_1_0_weight_transposed = builder.constant(
        {dataType: 'float32', shape: [1, 3, 3, 64]},
        new Float32Array(weights_array_buffer, 144048, 2304 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_295 = builder.conv2d(
        var_294, var_model_encoder_layers_8_conv3x3_1_0_weight_transposed,
        {
            bias: var_model_encoder_layers_8_conv3x3_1_0_bias, strides: [1, 1], padding: [1, 1, 1, 1], dilations: [1, 1], groups: 64, filterLayout: 'ihwo', inputLayout: 'nhwc'
        }
    );

    const var_296 = builder.relu(var_295);

    // Re-create constant operand from transposed weights.

    const var_392_transposed = builder.constant(
        {dataType: 'float32', shape: [64, 1, 1, 64]},
        new Float32Array(weights_array_buffer, 375092, 16384 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_391 = builder.conv2d(
        var_296, var_392_transposed,
        {
            bias: var_393, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    const var_299 = builder.relu(var_391);

    // Re-create constant operand from transposed weights.

    const var_model_encoder_layers_8_conv3x3_2_0_weight_transposed = builder.constant(
        {dataType: 'float32', shape: [1, 5, 5, 64]},
        new Float32Array(weights_array_buffer, 146608, 6400 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_300 = builder.conv2d(
        var_299, var_model_encoder_layers_8_conv3x3_2_0_weight_transposed,
        {
            bias: var_model_encoder_layers_8_conv3x3_2_0_bias, strides: [1, 1], padding: [2, 2, 2, 2], dilations: [1, 1], groups: 64, filterLayout: 'ihwo', inputLayout: 'nhwc'
        }
    );

    const var_301 = builder.relu(var_300);

    // Re-create constant operand from transposed weights.

    const var_395_transposed = builder.constant(
        {dataType: 'float32', shape: [64, 1, 1, 64]},
        new Float32Array(weights_array_buffer, 391732, 16384 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_394 = builder.conv2d(
        var_301, var_395_transposed,
        {
            bias: var_396, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    // Re-create constant operand from transposed weights.

    const var_398_transposed = builder.constant(
        {dataType: 'float32', shape: [64, 1, 1, 64]},
        new Float32Array(weights_array_buffer, 408372, 16384 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_397 = builder.conv2d(
        var_294, var_398_transposed,
        {
            bias: var_399, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    const var_306 = builder.add(var_394, var_397);

    const var_307 = builder.relu(var_306);

    // Re-create constant operand from transposed weights.

    const var_model_encoder_layers_9_conv3x3_1_0_weight_transposed = builder.constant(
        {dataType: 'float32', shape: [1, 5, 5, 64]},
        new Float32Array(weights_array_buffer, 153264, 6400 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_308 = builder.conv2d(
        var_307, var_model_encoder_layers_9_conv3x3_1_0_weight_transposed,
        {
            bias: var_model_encoder_layers_9_conv3x3_1_0_bias, strides: [1, 1], padding: [2, 2, 2, 2], dilations: [1, 1], groups: 64, filterLayout: 'ihwo', inputLayout: 'nhwc'
        }
    );

    const var_309 = builder.relu(var_308);

    // Re-create constant operand from transposed weights.

    const var_401_transposed = builder.constant(
        {dataType: 'float32', shape: [64, 1, 1, 64]},
        new Float32Array(weights_array_buffer, 425012, 16384 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_400 = builder.conv2d(
        var_309, var_401_transposed,
        {
            bias: var_402, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    const var_312 = builder.relu(var_400);

    // Re-create constant operand from transposed weights.

    const var_model_encoder_layers_9_conv3x3_2_0_weight_transposed = builder.constant(
        {dataType: 'float32', shape: [1, 5, 5, 64]},
        new Float32Array(weights_array_buffer, 159920, 6400 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_313 = builder.conv2d(
        var_312, var_model_encoder_layers_9_conv3x3_2_0_weight_transposed,
        {
            bias: var_model_encoder_layers_9_conv3x3_2_0_bias, strides: [1, 1], padding: [2, 2, 2, 2], dilations: [1, 1], groups: 64, filterLayout: 'ihwo', inputLayout: 'nhwc'
        }
    );

    const var_314 = builder.relu(var_313);

    // Re-create constant operand from transposed weights.

    const var_404_transposed = builder.constant(
        {dataType: 'float32', shape: [64, 1, 1, 64]},
        new Float32Array(weights_array_buffer, 441652, 16384 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_403 = builder.conv2d(
        var_314, var_404_transposed,
        {
            bias: var_405, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    // Re-create constant operand from transposed weights.

    const var_407_transposed = builder.constant(
        {dataType: 'float32', shape: [64, 1, 1, 64]},
        new Float32Array(weights_array_buffer, 458292, 16384 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_406 = builder.conv2d(
        var_307, var_407_transposed,
        {
            bias: var_408, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    const var_319 = builder.add(var_403, var_406);

    const var_320 = builder.relu(var_319);

    // Re-create constant operand from transposed weights.

    const var_model_encoder_layers_10_conv3x3_1_0_weight_transposed = builder.constant(
        {dataType: 'float32', shape: [1, 5, 5, 64]},
        new Float32Array(weights_array_buffer, 166576, 6400 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_321 = builder.conv2d(
        var_320, var_model_encoder_layers_10_conv3x3_1_0_weight_transposed,
        {
            bias: var_model_encoder_layers_10_conv3x3_1_0_bias, strides: [1, 1], padding: [2, 2, 2, 2], dilations: [1, 1], groups: 64, filterLayout: 'ihwo', inputLayout: 'nhwc'
        }
    );

    const var_322 = builder.relu(var_321);

    // Re-create constant operand from transposed weights.

    const var_410_transposed = builder.constant(
        {dataType: 'float32', shape: [64, 1, 1, 64]},
        new Float32Array(weights_array_buffer, 474932, 16384 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_409 = builder.conv2d(
        var_322, var_410_transposed,
        {
            bias: var_411, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    const var_325 = builder.relu(var_409);

    // Re-create constant operand from transposed weights.

    const var_model_encoder_layers_10_conv3x3_2_0_weight_transposed = builder.constant(
        {dataType: 'float32', shape: [1, 7, 7, 64]},
        new Float32Array(weights_array_buffer, 173232, 12544 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_326 = builder.conv2d(
        var_325, var_model_encoder_layers_10_conv3x3_2_0_weight_transposed,
        {
            bias: var_model_encoder_layers_10_conv3x3_2_0_bias, strides: [1, 1], padding: [3, 3, 3, 3], dilations: [1, 1], groups: 64, filterLayout: 'ihwo', inputLayout: 'nhwc'
        }
    );

    const var_327 = builder.relu(var_326);

    // Re-create constant operand from transposed weights.

    const var_413_transposed = builder.constant(
        {dataType: 'float32', shape: [64, 1, 1, 64]},
        new Float32Array(weights_array_buffer, 491572, 16384 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_412 = builder.conv2d(
        var_327, var_413_transposed,
        {
            bias: var_414, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    // Re-create constant operand from transposed weights.

    const var_416_transposed = builder.constant(
        {dataType: 'float32', shape: [64, 1, 1, 64]},
        new Float32Array(weights_array_buffer, 508212, 16384 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_415 = builder.conv2d(
        var_320, var_416_transposed,
        {
            bias: var_417, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    const var_332 = builder.add(var_412, var_415);

    const var_333 = builder.relu(var_332);

    // Re-create constant operand from transposed weights.

    const var_model_seg_weight_transposed = builder.constant(
        {dataType: 'float32', shape: [1, 1, 1, 64]},
        new Float32Array(weights_array_buffer, 186032, 256 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_334 = builder.conv2d(
        var_333, var_model_seg_weight_transposed,
        {
            bias: var_model_seg_bias, strides: [1, 1], padding: [0, 0, 0, 0], dilations: [1, 1], groups: 1, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    // Re-create constant operand from transposed weights.

    const var_model_up_weight_transposed = builder.constant(
        {dataType: 'float32', shape: [1, 16, 16, 1]},
        new Float32Array(weights_array_buffer, 186292, 1024 / Float32Array.BYTES_PER_ELEMENT)
    );

    const var_335 = builder.convTranspose2d(
        var_334, var_model_up_weight_transposed,
        {
            bias: undefined, strides: [8, 8], padding: [4, 4, 4, 4], dilations: [1, 1], groups: 1, outputSizes: undefined, filterLayout: 'ohwi', inputLayout: 'nhwc'
        }
    );

    const output = builder.sigmoid(var_335);

    // Build graph with output operands.

    // Transpose output from NHWC TO NCHW.

    const output_nchw = builder.transpose(
        output,
        { permutation: [0, 3, 1, 2] }
    );

    this.graph_ = await builder.build({'output': output_nchw});

    // Create graph output tensors.

    this.outputTensors_['output'] = await this.context_.createTensor(
        {dataType: output_nchw.dataType, shape: output_nchw.shape, readable: true}
    );

  }

  async run(inputs) {

    // Set input buffers to input tensors using writeTensor (sync)

    for (const name in inputs) {

      if (!(name in this.inputTensors_)) throw new Error(`Unknown input: ${name}`);

      this.context_.writeTensor(this.inputTensors_[name], inputs[name]);

    }

    // Compute the graph

    await this.context_.dispatch(this.graph_, this.inputTensors_, this.outputTensors_);

    // Read output tensors to buffers using readTensor (async)

    const outputs = {};

    for (const name in this.outputTensors_) {

      const tensor = this.outputTensors_[name];

      const buffer = await this.context_.readTensor(tensor);

      let typedArrayCtor;

      switch (tensor.dataType) {

        case 'float32': typedArrayCtor = Float32Array; break;

        case 'float16': typedArrayCtor = Float16Array; break;

        case 'int32': typedArrayCtor = Int32Array; break;

        case 'uint8': typedArrayCtor = Uint8Array; break;

        case 'int8': typedArrayCtor = Int8Array; break;

        case 'uint32': typedArrayCtor = Uint32Array; break;

        case 'int64': typedArrayCtor = BigInt64Array; break;

        case 'uint64': typedArrayCtor = BigUint64Array; break;

        default: throw new Error(`Unhandled tensor dataType: ${tensor.dataType}`);

      }

      outputs[name] = new typedArrayCtor(buffer);

    }

    return outputs;

  }

}