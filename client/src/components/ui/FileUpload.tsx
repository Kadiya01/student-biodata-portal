import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, RefreshCw } from 'lucide-react';

interface FileUploadProps {
  value?: string; // Base64 string
  onChange: (base64: string) => void;
  label?: string;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  value,
  onChange,
  label,
  error,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File, maxWidth = 300, quality = 0.6): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
          const width = Math.round(img.width * scale);
          const height = Math.round(img.height * scale);
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('Could not get canvas context')); return; }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, or JPEG).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit.');
      return;
    }

    try {
      const compressed = await compressImage(file);
      onChange(compressed);
    } catch {
      alert('Failed to process image. Please try another file.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <span className="text-xs font-semibold text-slate-700 select-none">
          {label}
        </span>
      )}
      
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={value ? undefined : handleButtonClick}
        className={`relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all duration-200 cursor-pointer min-h-[160px]
          ${dragActive ? 'border-brand-primary bg-teal-50/45 scale-[0.99]' : 'border-slate-200 hover:border-brand-secondary bg-white'}
          ${error ? 'border-rose-400 bg-rose-50/20' : ''}
          ${value ? 'cursor-default' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />

        {value ? (
          <div className="relative group flex flex-col items-center">
            <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-soft border-2 border-brand-primary/20 relative">
              <img src={value} alt="Passport Photograph" className="w-full h-full object-cover" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleButtonClick}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Change Photo
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <X className="w-3 h-3" /> Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5">
            <div className="p-3 bg-teal-50 rounded-xl text-brand-primary">
              <Upload className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Upload passport photograph
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Drag and drop image here, or click to browse
              </p>
            </div>
            <span className="text-[10px] text-slate-400">
              Supports JPG, JPEG, PNG (Max 2MB)
            </span>
          </div>
        )}
      </div>

      {error && (
        <span className="text-xs font-medium text-rose-500 mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
};
