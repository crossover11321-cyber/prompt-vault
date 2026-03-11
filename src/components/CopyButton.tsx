import { useState, useCallback } from 'react';
import { copyToClipboard } from '../lib/commandBuilder';

interface CopyButtonProps {
    text: string;
    className?: string;
    label?: string;
}

export default function CopyButton({ text, className = '', label }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();
        const success = await copyToClipboard(text);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [text]);

    return (
        <button
            className={`btn ${copied ? 'btn-copied' : 'btn-secondary'} ${className}`}
            onClick={handleCopy}
            title="クリップボードにコピー"
        >
            {copied ? (
                <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {label !== undefined ? 'コピー済み' : ''}
                </>
            ) : (
                <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    {label !== undefined ? label : ''}
                </>
            )}
        </button>
    );
}
