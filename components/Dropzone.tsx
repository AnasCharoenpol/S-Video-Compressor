import React, { useCallback } from 'react';
import { UploadCloud } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  className?: string;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFileSelect, className }) => {
  const [isDragActive, setIsDragActive] = React.useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('video/')) {
          onFileSelect(file);
        } else {
          alert('Please upload a valid video file.');
        }
      }
    },
    [onFileSelect]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('video/')) {
        onFileSelect(file);
      } else {
        alert('Please upload a valid video file.');
      }
    }
  };

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center w-full h-64 md:h-80 rounded-3xl border-2 border-dashed transition-all duration-300 ease-in-out cursor-pointer group hover:bg-neutral-900/50',
        isDragActive
          ? 'border-emerald-500 bg-emerald-500/10 scale-105'
          : 'border-neutral-700 bg-neutral-950/40',
        className
      )}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input
        id="file-upload"
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleChange}
      />
      <div className="flex flex-col items-center gap-4 text-center p-6">
        <div className="p-4 rounded-full bg-neutral-800/50 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
          <UploadCloud className="w-10 h-10 text-neutral-400 group-hover:text-emerald-400 transition-colors" />
        </div>
        <div>
          <p className="text-lg font-medium text-neutral-200">
            Click to upload <span className="font-normal text-neutral-400">or drag and drop</span>
          </p>
          <p className="text-sm text-neutral-500 mt-2">MP4, MOV, WebM up to 2GB</p>
        </div>
      </div>
    </div>
  );
};
