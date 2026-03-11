import { useRef, useState, useCallback } from 'react';
import './ImageUploader.css';

interface ImageUploaderProps {
    imageDataUrl?: string;
    onChange: (dataUrl: string | undefined) => void;
}

export default function ImageUploader({ imageDataUrl, onChange }: ImageUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            onChange(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    }, [onChange]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    }, [processFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    }, [processFile]);

    if (imageDataUrl) {
        return (
            <div className="image-uploader-preview">
                <img src={imageDataUrl} alt="生成画像" />
                <div className="image-uploader-overlay">
                    <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        変更
                    </button>
                    <button className="btn btn-danger" onClick={() => onChange(undefined)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        削除
                    </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} hidden />
            </div>
        );
    }

    return (
        <div
            className={`image-uploader-dropzone ${isDragging ? 'dragging' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
        >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="image-uploader-icon">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
            </svg>
            <p className="image-uploader-text">
                画像をドラッグ&ドロップ<br />
                <span>またはクリックして選択</span>
            </p>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} hidden />
        </div>
    );
}
