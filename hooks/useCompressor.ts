import { useState } from 'react';
import { loadFFmpeg, getVideoDuration } from '@/utils/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

export type CompressionStatus = 'idle' | 'loading' | 'analyzing' | 'compressing' | 'verifying' | 'done' | 'error';

export const useCompressor = () => {
  const [status, setStatus] = useState<CompressionStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedFile, setCompressedFile] = useState<Uint8Array | null>(null);

  const compressVideo = async (file: File, targetSizeMB: number) => {
    try {
      setStatus('loading');
      setMessage('Loading FFmpeg engine...');
      const ffmpeg = await loadFFmpeg();

      ffmpeg.on('progress', ({ progress: p }) => {
        setProgress(Math.round(p * 100));
      });

      setStatus('analyzing');
      setMessage('Analyzing video duration...');
      
      const duration = await getVideoDuration(file);
      const originalSizeBytes = file.size;
      setOriginalSize(originalSizeBytes);

      const targetSizeBytes = targetSizeMB * 1024 * 1024;
      
      if (originalSizeBytes <= targetSizeBytes) {
         setStatus('done');
         setMessage('File is already smaller than target size!');
         const buffer = await file.arrayBuffer();
         setCompressedFile(new Uint8Array(buffer));
         return;
      }

      const safeTargetBytes = targetSizeBytes * 0.95;
      let currentBitrateBps = Math.floor((safeTargetBytes * 8) / duration);

      const inputFileName = 'input.mp4';
      await ffmpeg.writeFile(inputFileName, await fetchFile(file));

      let metTarget = false;
      let passCount = 1;
      const MAX_PASSES = 10;
      let bestFile: Uint8Array | null = null;
      
      while (!metTarget && passCount <= MAX_PASSES) {
        setStatus('compressing');
        setMessage(`Compressing (Pass ${passCount}) at ${Math.round(currentBitrateBps/1024)} kbps...`);
        
        const outputFileName = `output_pass_${passCount}.mp4`;

        await ffmpeg.exec([
          '-i', inputFileName,
          '-c:v', 'libx264',
          '-b:v', `${currentBitrateBps}`,
          '-preset', 'superfast',
          '-c:a', 'aac',
          '-b:a', '128k',
          outputFileName
        ]);

        setStatus('verifying');
        setMessage('Verifying output size...');

        const outData = await ffmpeg.readFile(outputFileName) as Uint8Array;
        
        if (outData.byteLength <= targetSizeBytes) {
          metTarget = true;
          bestFile = outData;
          setMessage(`Compression successful on pass ${passCount}!`);
        } else {
          currentBitrateBps = Math.floor(currentBitrateBps * 0.95);
          passCount++;
          bestFile = outData;
        }
      }

      setStatus('done');
      if (bestFile) {
        setCompressedFile(bestFile);
      }
      
    } catch (err: unknown) {
      console.error(err);
      setStatus('error');
      setMessage((err as Error).message || 'An error occurred during compression.');
    }
  };

  const reset = () => {
    setStatus('idle');
    setProgress(0);
    setMessage('');
    setOriginalSize(0);
    setCompressedFile(null);
  };

  return {
    compressVideo,
    status,
    progress,
    message,
    originalSize,
    compressedFile,
    reset,
  };
};
