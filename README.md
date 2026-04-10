# 🗜 S-Video Compressor

> Smart, client-side video compression without the technical jargon. Just set your target size and let the algorithm do the heavy lifting!

## 🎥 Preview

<img width="2560" height="1327" alt="Screenshot 2569-04-10 at 16 51 28" src="https://github.com/user-attachments/assets/f43ea6d0-f3e1-4f54-b7d8-0bede6f6c03e" />

## 📝 Short Info
**S-Video Compressor** was born out of a desire for a minimalist, "it just works" video scaling tool. Instead of tweaking complex bitrates or codec profiles, you simply specify exactly how large you want your file to be (e.g., "10MB"), and the app recursively optimizes the file securely within your own browser—meaning no video ever leaves your local device. 

## ✨ Features
- **Auto-Target Brain:** Calculates required bitrates dynamically based on the target file size mathematically via the formula: `Bitrate = (TargetSize * 8) / Duration`.
- **Recursive Safety Loop:** Automatically re-encodes (always iterating from the original source file to preserve quality) in reduced increments until the specific boundary constraint is met perfectly.
- **Client-Side WASM Engine:** Powered entirely in-browser using WebAssembly. Total privacy, high deployment velocity, and zero backend uploading/downloading required.
- **Micro-Animations & Parallax:** Fluid glassmorphism UI utilizing `framer-motion` spring physics to track mouse cursor depth and movement gracefully for an Apple TV-style card tilt.

## 🛠 Technologies
- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Core Processing:** `ffmpeg.wasm` (`@ffmpeg/ffmpeg`)
- **Icons:** Lucide React

## 🔄 The Process
The development process started by focusing entirely on the underlying math. Setting up a reliable FFmpeg layer passing multi-threaded commands via `SharedArrayBuffer` boundaries is complex. This engine was abstracted away into a custom `useCompressor` React hook that continuously compares resultant bytes against the user target, restarting the pass at `95%` bitrate reduction increments until the strict target requirement is fulfilled. Only after the core loop proved bulletproof were the actual sleek, dark-mode styling and interactive mouse-tracking components bridged over it using Framer Motion capabilities. 

## 🧠 What I Learned
- **WebAssembly (WASM):** Deeply interfacing with heavy C ports like FFmpeg in the browser context highlighted the strict memory and execution limitations of JavaScript runtime environments.
- **Security Headers & Cross-Origin Isolation:** Managing `COOP/COEP` headers (Cross-Origin Opener Policy & Embedder Policy) natively inside Next.js config just to authorize `SharedArrayBuffer` privileges safely.
- **React Spring Physics:** Managing smooth interface micro-interactions tied to browser pointer events natively (`useMotionValue` & `useSpring`) rather than relying on arbitrary, rigid CSS transition keyframes.

## 🌱 Overall Growth
This project represented a significant leap in understanding how "thick-client architecture" can function without a backend server logic loop. Handling these intensive video streaming algorithms offline entirely via the client empowers building more resilient, deeply private applications that drastically alleviate database and computational costs. It simultaneously solidified my mastery of complex React Hooks controlling async Wasm operations.

## 🚀 Future Improvements
- Add support for batch-processing multiple videos in an asynchronous queue.
- Implement granular override toggles for power-users who *do* want to explicitly change codecs (like HEVC / H.265 compression).
- Hardware acceleration detection to offload processing to the client's localized GPU when available via the WebCodecs API instead of purely WASM CPU-bound routines.

---
*Built with passion.*
