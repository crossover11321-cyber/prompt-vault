import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import PromptCard from '../components/PromptCard';
import { searchPrompts, getAllTags, type Prompt, type SearchFilters } from '../lib/db';
import { exportToCSV, importFromCSV } from '../lib/backup';
import './Dashboard.css';

export default function Dashboard() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [query, setQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedVersion, setSelectedVersion] = useState('');
    const [selectedAspectRatio, setSelectedAspectRatio] = useState('');
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);

    const loadPrompts = useCallback(async () => {
        const filters: SearchFilters = {};
        if (query) filters.query = query;
        if (selectedTags.length > 0) filters.tags = selectedTags;
        if (selectedVersion) filters.version = selectedVersion;
        if (selectedAspectRatio) filters.aspectRatio = selectedAspectRatio;

        const results = await searchPrompts(filters);
        setPrompts(results);
    }, [query, selectedTags, selectedVersion, selectedAspectRatio]);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            const tags = await getAllTags();
            setAllTags(tags);
            await loadPrompts();
            setLoading(false);
        };
        init();
    }, [loadPrompts]);

    const handleTagToggle = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImporting(true);
        try {
            const count = await importFromCSV(file);
            alert(`${count} 件のプロンプトをインポートしました。`);
            await loadPrompts();
            const tags = await getAllTags();
            setAllTags(tags);
        } catch (err) {
            alert(`インポートに失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}`);
        } finally {
            setImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="dashboard-header-left">
                    <div className="app-logo">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#logo-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <defs>
                                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#7c5cfc" />
                                    <stop offset="100%" stopColor="#b44cff" />
                                </linearGradient>
                            </defs>
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="app-title">Prompt Vault</h1>
                        <p className="app-subtitle">Midjourney プロンプトマネージャー</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn btn-ghost" onClick={exportToCSV} title="CSVエクスポート">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        エクスポート
                    </button>
                    <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()} disabled={importing} title="CSVインポート">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        {importing ? 'インポート中...' : 'インポート'}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleImport}
                        style={{ display: 'none' }}
                    />
                    <button className="btn btn-primary btn-lg" onClick={() => navigate('/new')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        新規作成
                    </button>
                </div>
            </header>

            {/* Search & Filters */}
            <SearchBar
                query={query}
                onQueryChange={setQuery}
                selectedTags={selectedTags}
                onTagToggle={handleTagToggle}
                allTags={allTags}
                selectedVersion={selectedVersion}
                onVersionChange={setSelectedVersion}
                selectedAspectRatio={selectedAspectRatio}
                onAspectRatioChange={setSelectedAspectRatio}
            />

            {/* Content */}
            {loading ? (
                <div className="dashboard-loading">
                    <div className="loading-spinner" />
                </div>
            ) : prompts.length > 0 ? (
                <div className="prompt-grid">
                    {prompts.map((prompt) => (
                        <PromptCard key={prompt.id} prompt={prompt} />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">✨</div>
                    <h2 className="empty-state-title">
                        {query || selectedTags.length > 0
                            ? '一致するプロンプトがありません'
                            : 'まだプロンプトがありません'}
                    </h2>
                    <p className="empty-state-text">
                        {query || selectedTags.length > 0
                            ? '検索条件を変更してみてください。'
                            : 'Midjourneyで使ったプロンプトを保存して、あなただけのプロンプトライブラリを作りましょう。'}
                    </p>
                    {!query && selectedTags.length === 0 && (
                        <button className="btn btn-primary btn-lg" onClick={() => navigate('/new')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            最初のプロンプトを作成
                        </button>
                    )}
                </div>
            )}

            {/* Stats */}
            {prompts.length > 0 && (
                <div className="dashboard-stats">
                    <span>{prompts.length} プロンプト</span>
                </div>
            )}
        </div>
    );
}
