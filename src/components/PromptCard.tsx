import { useNavigate } from 'react-router-dom';
import CopyButton from './CopyButton';
import { buildImagineCommand } from '../lib/commandBuilder';
import type { Prompt } from '../lib/db';
import './PromptCard.css';

interface PromptCardProps {
    prompt: Prompt;
}

export default function PromptCard({ prompt }: PromptCardProps) {
    const navigate = useNavigate();
    const command = buildImagineCommand(prompt.body, prompt.params);

    const paramSummary = [
        prompt.params.version.startsWith('niji') ? prompt.params.version : `v${prompt.params.version}`,
        prompt.params.aspectRatio !== '1:1' ? `--ar ${prompt.params.aspectRatio}` : null,
        prompt.params.stylize !== 100 ? `--s ${prompt.params.stylize}` : null,
        prompt.params.chaos > 0 ? `--c ${prompt.params.chaos}` : null,
    ].filter(Boolean).join('  ');

    return (
        <div
            className="prompt-card glass-card animate-fade-in"
            onClick={() => navigate(`/prompt/${prompt.id}`)}
        >
            {prompt.imageDataUrl ? (
                <div className="prompt-card-image">
                    <img src={prompt.imageDataUrl} alt={prompt.title} />
                </div>
            ) : (
                <div className="prompt-card-image prompt-card-image-placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                </div>
            )}

            <div className="prompt-card-body">
                <h3 className="prompt-card-title">{prompt.title || 'Untitled'}</h3>
                <p className="prompt-card-preview">{prompt.body}</p>

                {prompt.tags.length > 0 && (
                    <div className="prompt-card-tags">
                        {prompt.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="tag">{tag}</span>
                        ))}
                        {prompt.tags.length > 3 && (
                            <span className="tag">+{prompt.tags.length - 3}</span>
                        )}
                    </div>
                )}

                <div className="prompt-card-footer">
                    <span className="prompt-card-params">{paramSummary}</span>
                    <CopyButton text={command} />
                </div>
            </div>
        </div>
    );
}
