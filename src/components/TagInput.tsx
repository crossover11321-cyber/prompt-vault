import { useState, useRef, useEffect } from 'react';
import './TagInput.css';

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    allTags?: string[];
    placeholder?: string;
}

export default function TagInput({ tags, onChange, allTags = [], placeholder = 'タグを追加...' }: TagInputProps) {
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (input.trim()) {
            const filtered = allTags.filter(
                (t) => t.toLowerCase().includes(input.toLowerCase()) && !tags.includes(t)
            );
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [input, allTags, tags]);

    const addTag = (tag: string) => {
        const trimmed = tag.trim();
        if (trimmed && !tags.includes(trimmed)) {
            onChange([...tags, trimmed]);
        }
        setInput('');
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const removeTag = (index: number) => {
        onChange(tags.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            if (input.trim()) addTag(input);
        } else if (e.key === 'Backspace' && !input && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    };

    return (
        <div className="tag-input-container">
            <div className="tag-input-wrapper" onClick={() => inputRef.current?.focus()}>
                {tags.map((tag, i) => (
                    <span key={tag} className="tag">
                        {tag}
                        <button className="tag-remove" onClick={() => removeTag(i)}>×</button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    className="tag-input-field"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder={tags.length === 0 ? placeholder : ''}
                />
            </div>
            {showSuggestions && (
                <div className="tag-suggestions">
                    {suggestions.map((s) => (
                        <button key={s} className="tag-suggestion-item" onMouseDown={() => addTag(s)}>
                            {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
