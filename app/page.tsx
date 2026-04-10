'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Settings, FileVideo, Download, RotateCcw, Activity } from 'lucide-react';
import { Dropzone } from '@/components/Dropzone';
import { useCompressor } from '@/hooks/useCompressor';
import { formatBytes } from '@/utils/format';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [targetSizeStr, setTargetSizeStr] = useState<string>('');
  const { compressVideo, status, progress, message, originalSize, compressedFile, reset } = useCompressor();
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { damping: 40, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [0, 1], [10, -10]);
  const rotateY = useTransform(smoothMouseX, [0, 1], [-10, 10]);
  const glowX = useTransform(smoothMouseX, [0, 1], ["0%", "100%"]);
  const glowY = useTransform(smoothMouseY, [0, 1], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    mouseX.set(x);
    mouseY.set(y);
  };

  useEffect(() => {
    if (file) {
      // Suggest 50% of original file size initially
      const sizeMB = file.size / (1024 * 1024);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTargetSizeStr((sizeMB * 0.5).toFixed(2));
    }
  }, [file]);

  useEffect(() => {
    if (compressedFile) {
      const blob = new Blob([compressedFile as unknown as BlobPart], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDownloadUrl(url);
    } else {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDownloadUrl(null);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compressedFile]);

  const handleStart = () => {
    if (!file) return;
    const targetSizeMB = parseFloat(targetSizeStr);
    if (isNaN(targetSizeMB) || targetSizeMB <= 0) {
      alert('Please enter a valid target size.');
      return;
    }
    if (targetSizeMB * 1024 * 1024 >= file.size) {
      alert('Target size should be smaller than original file size for compression.');
      return;
    }
    compressVideo(file, targetSizeMB);
  };

  const handleReset = () => {
    setFile(null);
    setTargetSizeStr('');
    reset();
  };

  return (
    <main 
      className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 relative overflow-hidden"
      onMouseMove={handleMouseMove}
      style={{ perspective: 1200 }}
    >
      {/* Background ambient light */}
      <motion.div 
        className="absolute -z-10 h-[800px] w-[800px] rounded-full bg-emerald-500/15 blur-[120px]" 
        style={{ left: glowX, top: glowY, x: "-50%", y: "-50%" }}
      />

      <motion.div 
        className="z-10 max-w-2xl w-full flex flex-col gap-8"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        
        <header className="text-center flex flex-col gap-4 items-center">
          <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-xl">
            <Settings className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent">
            S-Video Compressor
          </h1>
          <p className="text-neutral-400 max-w-lg mx-auto">
            Smart, client-side, automatic video compressor. Set your target size, and let the algorithm do the rest.
          </p>
        </header>

        <div className="w-full relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {!file && status === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full absolute inset-0"
              >
                <Dropzone onFileSelect={setFile} />
              </motion.div>
            )}

            {file && status === 'idle' && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full absolute inset-0 flex flex-col items-center justify-center p-8 rounded-3xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-xl"
              >
                <FileVideo className="w-16 h-16 text-emerald-400 mb-6" />
                <h2 className="text-xl font-semibold mb-2 text-center break-all w-full line-clamp-1">{file.name}</h2>
                <p className="text-neutral-400 mb-8">{formatBytes(file.size)}</p>

                <div className="w-full max-w-xs space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Target Size (MB)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={targetSizeStr}
                        onChange={(e) => setTargetSizeStr(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-colors placeholder:text-neutral-600"
                        placeholder="e.g. 10.5"
                      />
                      <div className="absolute right-4 top-3.5 text-neutral-500 font-medium">MB</div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setFile(null)}
                      className="px-6 py-3 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors w-1/3"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStart}
                      className="px-6 py-3 rounded-xl bg-emerald-500 text-neutral-950 font-semibold hover:bg-emerald-400 transition-colors w-2/3 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                    >
                      Compress
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {(status === 'loading' || status === 'analyzing' || status === 'compressing' || status === 'verifying') && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="w-full absolute inset-0 flex flex-col items-center justify-center p-8 rounded-3xl border border-emerald-500/30 bg-neutral-900/50 backdrop-blur-xl"
              >
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                  <Activity className="w-16 h-16 text-emerald-400 relative z-10 animate-bounce" />
                </div>
                <h3 className="text-xl font-medium text-white mb-4">Processing constraints...</h3>
                <p className="text-emerald-400/80 mb-8 font-mono text-sm tracking-wider">{message}</p>
                
                {status === 'compressing' && (
                  <div className="w-full max-w-sm space-y-2">
                    <div className="flex justify-between text-xs text-neutral-400 mb-1 font-mono">
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "linear" }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {status === 'done' && compressedFile && downloadUrl && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full absolute inset-0 flex flex-col items-center justify-center p-8 rounded-3xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-xl"
              >
                <div className="p-4 bg-emerald-500/10 rounded-full mb-6 ring-1 ring-emerald-500/30">
                  <Download className="w-12 h-12 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold mb-6">Optimization Complete</h2>
                
                <div className="flex items-center gap-8 mb-8 text-center bg-neutral-950/50 p-6 rounded-2xl w-full max-w-sm">
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Original</p>
                    <p className="text-lg font-medium text-neutral-300">{formatBytes(originalSize)}</p>
                  </div>
                  <div className="h-10 w-[1px] bg-neutral-800" />
                  <div>
                    <p className="text-xs text-emerald-500 uppercase tracking-wider mb-1">New Size</p>
                    <p className="text-lg font-bold text-emerald-400">{formatBytes(compressedFile.byteLength)}</p>
                  </div>
                </div>

                <div className="text-sm font-medium text-emerald-500 mb-8">
                  Saved {((1 - compressedFile.byteLength / originalSize) * 100).toFixed(1)}% bandwidth
                </div>

                <div className="flex gap-4 w-full max-w-sm">
                  <button
                    onClick={handleReset}
                    className="p-4 flex items-center justify-center rounded-xl border border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors aspect-square"
                    title="Compress another"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </button>
                  <a
                    href={downloadUrl}
                    download={`compressed_${file?.name || 'video.mp4'}`}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-emerald-500 text-neutral-950 font-bold hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </a>
                </div>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full absolute inset-0 flex flex-col items-center justify-center p-8 rounded-3xl border border-red-500/30 bg-red-950/10 backdrop-blur-xl"
              >
                <div className="w-16 h-16 text-red-400 mb-6">⚠️</div>
                <h2 className="text-xl font-semibold mb-2 text-white">Something went wrong</h2>
                <p className="text-neutral-400 text-center mb-8 max-w-md">{message}</p>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 rounded-xl bg-neutral-800 text-white font-medium hover:bg-neutral-700 transition-colors"
                >
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  );
}
