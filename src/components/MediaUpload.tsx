/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useRef } from 'react';

interface MediaUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
}

export default function MediaUpload({ onFileSelect, accept = 'image/*,video/*', maxSizeMB = 50 }: MediaUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File quá lớn! Giới hạn là ${maxSizeMB}MB`);
      return;
    }

    const type = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : null;
    setFileType(type);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      onFileSelect(file);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setFileType(null);
    onFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div 
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      style={{
        width: '100%',
        minHeight: '200px',
        borderRadius: '24px',
        border: `2px dashed ${isDragging ? '#1877F2' : 'rgba(255,255,255,0.1)'}`,
        background: isDragging ? 'rgba(24,119,242,0.05)' : 'rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        accept={accept}
        style={{ display: 'none' }}
      />

      {preview ? (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          {fileType === 'image' ? (
            <img 
              src={preview} 
              alt="Preview" 
              style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '12px' }} 
            />
          ) : (
            <video 
              src={preview} 
              controls 
              style={{ width: '100%', maxHeight: '400px', borderRadius: '12px' }} 
            />
          )}
          <button 
            onClick={removeFile}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(239,68,68,0.8)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}
          >
            &times;
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📁</div>
          <div style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>
            {isDragging ? 'Thả file vào đây' : 'Nhấn hoặc kéo thả file'}
          </div>
          <div style={{ color: '#64748b', fontSize: '13px', marginTop: '8px' }}>
            Hỗ trợ hình ảnh (JPG, PNG) hoặc Video (MP4)
          </div>
        </div>
      )}
    </div>
  );
}
