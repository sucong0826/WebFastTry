# 测试页面集成说明

## ✅ 已集成的测试页面

### 1. TF.js GPU Test (`/test/tfjs-gpu`)
- **来源**: `tfjs_webnn/tfjs_GPU`
- **功能**: TensorFlow.js GPU 加速测试
- **依赖**:
  - TensorFlow.js 4.22.0 (`4.22.0_dist_tf.min.js`)
  - WebGL Blend (`webglblend.js`)
  - 自定义测试脚本 (`zlttf_test.js`)
  - 模型文件 (`model/` 目录)

### 2. WebNN Test (`/test/webnn-test`)
- **来源**: `tfjs_webnn/webnn_test`
- **功能**: WebNN with ONNX Runtime WebGPU 测试
- **依赖**:
  - ONNX Runtime WebGPU (CDN)
  - WebGL Blend (`webglblend.js`)
  - Origin NHWC (`origin_nhwc.js`, `origin_nhwc.bin`)
  - WebNN 测试脚本 (`webnn_test.js`)
  - ONNX 模型文件 (`model.onnx`, `model_vb.onnx`)

## 📁 文件结构

```
WebFastTry/
├── public/
│   ├── tfjs-gpu/
│   │   ├── 4.22.0_dist_tf.min.js
│   │   ├── webglblend.js
│   │   ├── zlttf_test.js
│   │   └── model/          # TensorFlow.js 模型文件
│   └── webnn-test/
│       ├── webglblend.js
│       ├── origin_nhwc.js
│       ├── origin_nhwc.bin
│       ├── webnn_test.js
│       ├── model.onnx
│       └── model_vb.onnx
├── app/
│   └── test/
│       ├── tfjs-gpu/
│       │   └── page.tsx    # TF.js GPU 测试页面
│       └── webnn-test/
│           └── page.tsx     # WebNN 测试页面
└── config/
    └── testPages.ts        # 测试页面配置
```

## 🎯 功能特性

两个测试页面都包含：
- ✅ 摄像头设备选择
- ✅ 视频分辨率设置 (1280x720)
- ✅ FPS 控制 (15/20/25/27/30)
- ✅ 多个 Canvas 显示 (Downsampled, Source, Mask, Mixed)
- ✅ Start 按钮启动测试

## 🚀 部署注意事项

### 静态资源
- 所有 JavaScript 文件和模型文件已复制到 `public/` 目录
- Next.js 会自动提供 `public/` 目录下的静态文件
- 访问路径: `/tfjs-gpu/*` 和 `/webnn-test/*`

### 模型文件
- TF.js 模型文件较大，已包含在 `public/tfjs-gpu/model/` 目录
- ONNX 模型文件已复制到 `public/webnn-test/` 目录
- 确保 Vercel 部署时包含这些大文件

### 浏览器兼容性
- **TF.js GPU Test**: 需要支持 WebGL 的浏览器
- **WebNN Test**: 需要支持 WebGPU 的浏览器（Chrome 113+, Edge 113+）

### 权限要求
- 两个测试都需要摄像头权限
- 首次访问时会请求用户授权

## 🔧 配置更新

### testPages.ts
已添加两个新测试页面配置：
```typescript
{
  id: "tfjs-gpu",
  title: "TF.js GPU",
  description: "TensorFlow.js GPU acceleration test",
  icon: "Cpu",
  path: "/test/tfjs-gpu",
  category: "ML/AI"
},
{
  id: "webnn-test",
  title: "WebNN Test",
  description: "WebNN with ONNX Runtime WebGPU",
  icon: "Zap",
  path: "/test/webnn-test",
  category: "ML/AI"
}
```

### 首页图标
已添加 `Cpu` 和 `Zap` 图标支持

## 📝 使用说明

1. 访问首页，点击 "TF.js GPU" 或 "WebNN Test" 卡片
2. 选择摄像头设备
3. 设置视频分辨率和 FPS
4. 点击 "Start" 按钮开始测试
5. 观察各个 Canvas 的输出结果

## ⚠️ 已知问题

1. **origin_nhwc.bin 路径**: `origin_nhwc.js` 中使用相对路径 `origin_nhwc.bin`，确保文件在同一目录
2. **模型加载**: 某些模型文件可能较大，首次加载需要时间
3. **WebGPU 支持**: WebNN Test 需要现代浏览器支持 WebGPU

## 🔄 后续优化建议

1. 添加加载进度指示器
2. 添加错误处理和用户提示
3. 优化大文件加载（使用 CDN 或压缩）
4. 添加性能监控和 FPS 显示
5. 支持更多模型文件选择
