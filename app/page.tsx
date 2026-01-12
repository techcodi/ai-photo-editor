"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Wand2,
  Download,
  Sparkles,
  Sun,
  Droplet,
  Zap,
  Camera,
  RefreshCw,
} from "lucide-react";

export default function AIPhotoEditor() {
  const [originalImageData, setOriginalImageData] = useState<string | null>(
    null
  );
  const [editedImageData, setEditedImageData] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("auto");
  const [upscaleEnabled, setUpscaleEnabled] = useState(true);
  const [upscaleLevel, setUpscaleLevel] = useState("4k");
  const [blurAmount, setBlurAmount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const styles = [
    {
      id: "auto",
      name: "Auto Enhance",
      icon: Wand2,
      desc: "AI-powered enhancement",
    },
    {
      id: "vibrant",
      name: "Vibrant",
      icon: Sparkles,
      desc: "Boost colors & saturation",
    },
    {
      id: "cinematic",
      name: "Cinematic",
      icon: Camera,
      desc: "Film-like tones",
    },
    { id: "golden", name: "Golden Hour", icon: Sun, desc: "Warm sunset glow" },
    { id: "cool", name: "Cool Tone", icon: Droplet, desc: "Blue & teal vibes" },
    {
      id: "dramatic",
      name: "Dramatic",
      icon: Zap,
      desc: "High contrast & bold",
    },
    {
      id: "bw",
      name: "Black & White",
      icon: Camera,
      desc: "Classic monochrome",
    },
    { id: "vintage", name: "Vintage", icon: Camera, desc: "Retro film look" },
    { id: "sepia", name: "Sepia", icon: Sun, desc: "Old photo warmth" },
    { id: "neon", name: "Neon", icon: Zap, desc: "Vibrant neon glow" },
    { id: "pastel", name: "Pastel", icon: Sparkles, desc: "Soft dreamy tones" },
    { id: "hdr", name: "HDR", icon: Sun, desc: "High dynamic range" },
  ];

  const upscaleOptions = [
    { id: "2k", name: "2K", resolution: 2048, desc: "2048px" },
    { id: "4k", name: "4K", resolution: 3840, desc: "3840px" },
    { id: "6k", name: "6K", resolution: 6144, desc: "6144px" },
    { id: "8k", name: "8K", resolution: 7680, desc: "7680px" },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Keep original resolution, don't compress for display
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) return;

          // Use FULL original dimensions
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw with high quality settings
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, img.width, img.height);

          // Save as PNG with maximum quality (1.0)
          const imageUrl = canvas.toDataURL("image/png", 1.0);
          setOriginalImageData(imageUrl);
          setEditedImageData(null);
        };
        if (typeof event.target?.result === "string") {
          img.src = event.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const applyFilter = (imageData: ImageData, filterType: string) => {
    const data = imageData.data;

    switch (filterType) {
      case "auto":
        let min = 255,
          max = 0;
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          min = Math.min(min, avg);
          max = Math.max(max, avg);
        }
        const range = max - min || 1;
        const scale = 255 / range;

        for (let i = 0; i < data.length; i += 4) {
          data[i] = (data[i] - min) * scale;
          data[i + 1] = (data[i + 1] - min) * scale;
          data[i + 2] = (data[i + 2] - min) * scale;

          const gray =
            0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          data[i] = gray + (data[i] - gray) * 1.3;
          data[i + 1] = gray + (data[i + 1] - gray) * 1.3;
          data[i + 2] = gray + (data[i + 2] - gray) * 1.3;
        }
        break;

      case "vibrant":
        for (let i = 0; i < data.length; i += 4) {
          const gray =
            0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          data[i] = Math.min(255, (gray + (data[i] - gray) * 1.8) * 1.15);
          data[i + 1] = Math.min(
            255,
            (gray + (data[i + 1] - gray) * 1.8) * 1.15
          );
          data[i + 2] = Math.min(
            255,
            (gray + (data[i + 2] - gray) * 1.8) * 1.15
          );
        }
        break;

      case "cinematic":
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i] * 1.1 + 15;
          const g = data[i + 1] * 0.95;
          const b = data[i + 2] * 1.15 + 10;

          const contrast = 1.25;
          data[i] = (r - 128) * contrast + 128;
          data[i + 1] = (g - 128) * contrast + 128;
          data[i + 2] = (b - 128) * contrast + 128;
        }
        break;

      case "golden":
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * 1.2 + 25);
          data[i + 1] = Math.min(255, data[i + 1] * 1.08 + 15);
          data[i + 2] = Math.max(0, data[i + 2] * 0.85 - 15);
        }
        break;

      case "cool":
        for (let i = 0; i < data.length; i += 4) {
          data[i] = data[i] * 0.88;
          data[i + 1] = Math.min(255, data[i + 1] * 1.08 + 8);
          data[i + 2] = Math.min(255, data[i + 2] * 1.2 + 20);
        }
        break;

      case "dramatic":
        for (let i = 0; i < data.length; i += 4) {
          const contrast = 1.5;
          const r = (data[i] - 128) * contrast + 128;
          const g = (data[i + 1] - 128) * contrast + 128;
          const b = (data[i + 2] - 128) * contrast + 128;

          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          data[i] = gray + (r - gray) * 0.75;
          data[i + 1] = gray + (g - gray) * 0.75;
          data[i + 2] = gray + (b - gray) * 0.75;
        }
        break;

      case "bw":
        for (let i = 0; i < data.length; i += 4) {
          const gray =
            0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          const contrast = 1.2;
          const enhanced = (gray - 128) * contrast + 128;
          data[i] = enhanced;
          data[i + 1] = enhanced;
          data[i + 2] = enhanced;
        }
        break;

      case "vintage":
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * 1.1 + 30);
          data[i + 1] = Math.min(255, data[i + 1] * 0.95 + 20);
          data[i + 2] = Math.max(0, data[i + 2] * 0.8);

          const gray =
            0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          data[i] = gray + (data[i] - gray) * 0.6;
          data[i + 1] = gray + (data[i + 1] - gray) * 0.6;
          data[i + 2] = gray + (data[i + 2] - gray) * 0.6;
        }
        break;

      case "sepia":
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
          data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
          data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        }
        break;

      case "neon":
        for (let i = 0; i < data.length; i += 4) {
          const gray =
            0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          data[i] = Math.min(255, (gray + (data[i] - gray) * 2.5) * 1.2);
          data[i + 1] = Math.min(
            255,
            (gray + (data[i + 1] - gray) * 2.5) * 1.2
          );
          data[i + 2] = Math.min(
            255,
            (gray + (data[i + 2] - gray) * 2.5) * 1.2
          );

          const contrast = 1.4;
          data[i] = (data[i] - 128) * contrast + 128;
          data[i + 1] = (data[i + 1] - 128) * contrast + 128;
          data[i + 2] = (data[i + 2] - 128) * contrast + 128;
        }
        break;

      case "pastel":
        for (let i = 0; i < data.length; i += 4) {
          data[i] = data[i] * 0.85 + 50;
          data[i + 1] = data[i + 1] * 0.85 + 50;
          data[i + 2] = data[i + 2] * 0.85 + 50;

          const gray =
            0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          data[i] = gray + (data[i] - gray) * 0.7;
          data[i + 1] = gray + (data[i + 1] - gray) * 0.7;
          data[i + 2] = gray + (data[i + 2] - gray) * 0.7;
        }
        break;

      case "hdr":
        for (let i = 0; i < data.length; i += 4) {
          const contrast = 1.6;
          data[i] = (data[i] - 128) * contrast + 128;
          data[i + 1] = (data[i + 1] - 128) * contrast + 128;
          data[i + 2] = (data[i + 2] - 128) * contrast + 128;

          const gray =
            0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          data[i] = Math.min(255, gray + (data[i] - gray) * 1.5);
          data[i + 1] = Math.min(255, gray + (data[i + 1] - gray) * 1.5);
          data[i + 2] = Math.min(255, gray + (data[i + 2] - gray) * 1.5);
        }
        break;
    }

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, data[i]));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1]));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2]));
    }

    return imageData;
  };

  const upscaleImage = (
    sourceCanvas: HTMLCanvasElement,
    targetWidth: number
  ): HTMLCanvasElement => {
    const srcWidth = sourceCanvas.width;
    const srcHeight = sourceCanvas.height;
    const aspectRatio = srcHeight / srcWidth;
    const targetHeight = Math.floor(targetWidth * aspectRatio);

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = targetWidth;
    tempCanvas.height = targetHeight;

    if (!tempCtx) return sourceCanvas;

    // Bicubic-like upscaling using multiple passes
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = "high";
    tempCtx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);

    // Sharpen after upscaling
    const imageData = tempCtx.getImageData(0, 0, targetWidth, targetHeight);
    const sharpened = sharpenImage(imageData);
    tempCtx.putImageData(sharpened, 0, 0);

    return tempCanvas;
  };

  const sharpenImage = (imageData: ImageData): ImageData => {
    const data = imageData.data;
    const w = imageData.width;
    const h = imageData.height;
    const output = new Uint8ClampedArray(data);

    const strength = 0.5;

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4;

        for (let c = 0; c < 3; c++) {
          const center = data[idx + c];
          const top = data[((y - 1) * w + x) * 4 + c];
          const bottom = data[((y + 1) * w + x) * 4 + c];
          const left = data[(y * w + (x - 1)) * 4 + c];
          const right = data[(y * w + (x + 1)) * 4 + c];

          const sharp =
            center * (1 + 4 * strength) -
            strength * (top + bottom + left + right);
          output[idx + c] = Math.max(0, Math.min(255, sharp));
        }
      }
    }

    return new ImageData(output, w, h);
  };

  const applyBokehBlur = (
    canvas: HTMLCanvasElement,
    blurLevel: number
  ): HTMLCanvasElement => {
    if (blurLevel === 0) return canvas;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return canvas;
    const w = canvas.width;
    const h = canvas.height;
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const output = new Uint8ClampedArray(data);

    const centerX = w / 2;
    const centerY = h / 2;
    const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

    const radius = Math.floor(blurLevel / 2);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const distRatio = Math.min(dist / maxDist, 1);

        const localBlur = Math.floor(radius * distRatio);

        if (localBlur > 0) {
          let r = 0,
            g = 0,
            b = 0,
            count = 0;

          for (let ky = -localBlur; ky <= localBlur; ky++) {
            for (let kx = -localBlur; kx <= localBlur; kx++) {
              const nx = x + kx;
              const ny = y + ky;

              if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                const idx = (ny * w + nx) * 4;
                r += data[idx];
                g += data[idx + 1];
                b += data[idx + 2];
                count++;
              }
            }
          }

          const idx = (y * w + x) * 4;
          output[idx] = r / count;
          output[idx + 1] = g / count;
          output[idx + 2] = b / count;
        }
      }
    }

    const blurredData = new ImageData(output, w, h);
    ctx.putImageData(blurredData, 0, 0);
    return canvas;
  };

  const processImage = () => {
    if (!originalImageData) return;

    setProcessing(true);

    setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        const canvas = editCanvasRef.current;
        if (!canvas) {
          setProcessing(false);
          return;
        }
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          setProcessing(false);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        let workingCanvas: HTMLCanvasElement = canvas;
        if (upscaleEnabled) {
          const targetResObj = upscaleOptions.find(
            (o) => o.id === upscaleLevel
          );
          const targetRes = targetResObj
            ? targetResObj.resolution
            : canvas.width;
          if (canvas.width < targetRes) {
            workingCanvas = upscaleImage(canvas, targetRes);
          }
        }

        const ctx2 = workingCanvas.getContext("2d", {
          willReadFrequently: true,
        });
        if (!ctx2) {
          setProcessing(false);
          return;
        }
        const imageData = ctx2.getImageData(
          0,
          0,
          workingCanvas.width,
          workingCanvas.height
        );
        const filtered = applyFilter(imageData, selectedStyle);

        ctx2.putImageData(filtered, 0, 0);

        if (blurAmount > 0) {
          workingCanvas = applyBokehBlur(workingCanvas, blurAmount);
        }

        const result = workingCanvas.toDataURL("image/png");
        setEditedImageData(result);
        setProcessing(false);
      };
      img.src = originalImageData;
    }, 1000);
  };

  const downloadImage = () => {
    if (!editedImageData) return;
    const link = document.createElement("a");
    link.download = `edited-photo-${selectedStyle}-${
      upscaleEnabled ? upscaleLevel : "original"
    }-${Date.now()}.png`;
    link.href = editedImageData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center my-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 flex items-center justify-center gap-3">
            <Wand2 className="w-10 h-10 md:w-12 md:h-12" />
            AI Pro Photo Editor
          </h1>
          <p className="text-white/70 text-base md:text-lg">
            Upload your photo and let AI work its magic
          </p>
        </div>

        {!originalImageData ? (
          <div className="max-w-2xl mx-auto">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-4 border-dashed border-white/30 rounded-3xl p-12 md:p-16 text-center cursor-pointer hover:border-white/50 hover:bg-white/5 transition-all"
            >
              <Upload className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 text-white/60" />
              <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
                Upload Your Photo
              </h3>
              <p className="text-white/60">Click to browse or drag and drop</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/20">
                <h3 className="text-lg md:text-xl font-semibold text-white mb-4">
                  📷 Original Photo
                </h3>
                <div className="bg-black/30 rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={originalImageData}
                    alt="Original"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>
              </div>

              {editedImageData && (
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      AI Enhanced
                    </h3>
                    <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full">
                      {selectedStyle}
                    </span>
                  </div>
                  <div className="bg-black/30 rounded-xl overflow-hidden mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={editedImageData}
                      alt="AI Enhanced"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                  <button
                    onClick={downloadImage}
                    className="w-full py-3 bg-linear-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Enhanced Photo
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/20">
                <h3 className="text-lg md:text-xl font-semibold text-white mb-4">
                  🎨 Choose AI Style
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 max-h-80 overflow-y-auto pr-2">
                  {styles.map((style) => {
                    const Icon = style.icon;
                    return (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`p-3 rounded-xl transition-all ${
                          selectedStyle === style.id
                            ? "bg-blue-900 text-white shadow-lg scale-105"
                            : "bg-white/5 text-white/80 hover:bg-white/10"
                        }`}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-1" />
                        <div className="font-semibold text-xs">
                          {style.name}
                        </div>
                        <div className="text-xs opacity-70 mt-0.5 line-clamp-1">
                          {style.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 p-4 bg-white/5 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-white font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={upscaleEnabled}
                        onChange={(e) => setUpscaleEnabled(e.target.checked)}
                        className="w-4 h-4"
                      />
                      🚀 AI Upscale Quality
                    </label>
                  </div>

                  {upscaleEnabled && (
                    <div className="grid grid-cols-4 gap-2">
                      {upscaleOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setUpscaleLevel(option.id)}
                          className={`py-2 px-1 rounded-lg text-sm font-semibold transition-all ${
                            upscaleLevel === option.id
                              ? "bg-blue-900 text-white"
                              : "bg-white/10 text-white/70 hover:bg-white/20"
                          }`}
                        >
                          <div>{option.name}</div>
                          <div className="text-xs opacity-70">
                            {option.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-white font-semibold text-sm">
                        ✨ Bokeh Blur (Portrait Mode)
                      </label>
                      <span className="text-white/70 text-sm">
                        {blurAmount}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={blurAmount}
                      onChange={(e) => setBlurAmount(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-xs text-white/50">
                      Blurs background edges, keeps center sharp
                    </p>
                  </div>
                </div>

                <button
                  onClick={processImage}
                  disabled={processing}
                  className="w-full mt-6 py-4 bg-blue-900 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Processing AI Magic...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Apply AI Magic ✨
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setOriginalImageData(null);
                    setEditedImageData(null);
                    setBlurAmount(0);
                  }}
                  className="w-full mt-3 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  Upload New Photo
                </button>
              </div>

              <div className="bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-3">
                  ✨ AI Features
                </h3>
                <div className="space-y-2 text-white/80 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>12 professional color filters</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Bokeh blur effect (portrait mode)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>AI Upscaling up to 8K resolution</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Smart sharpening after upscale</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Auto color correction & balance</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>One-click professional retouching</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <canvas ref={editCanvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}
