import './SearchBar.css';

interface SearchBarProps {
    query: string;
    onQueryChange: (query: string) => void;
    selectedTags: string[];
    onTagToggle: (tag: string) => void;
    allTags: string[];
    selectedVersion: string;
    onVersionChange: (version: string) => void;
    selectedAspectRatio: string;
    onAspectRatioChange: (ar: string) => void;
}

const VERSIONS = ['', '7', '6.1', '6', '5.2', '5.1', '5', 'niji 7', 'niji 6', 'niji 5'];
const ASPECT_RATIOS = ['', '1:1', '4:3', '3:2', '16:9', '9:16', '2:3', '3:4'];

export default function SearchBar({
    query,
    onQueryChange,
    selectedTags,
    onTagToggle,
    allTags,
    selectedVersion,
    onVersionChange,
    selectedAspectRatio,
    onAspectRatioChange,
}: SearchBarProps) {
    return (
        <div className="search-bar animate-fade-in">
            <div className="search-input-wrapper">
                <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    className="search-input"
                    placeholder="プロンプトを検索..."
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                />
                {query && (
                    <button className="search-clear" onClick={() => onQueryChange('')}>
                        ×
                    </button>
                )}
            </div>

            <div className="search-filters">
                <select
                    className="form-select filter-select"
                    value={selectedVersion}
                    onChange={(e) => onVersionChange(e.target.value)}
                >
                    <option value="">全バージョン</option>
                    {VERSIONS.filter(v => v).map((v) => (
                        <option key={v} value={v}>{v.startsWith('niji') ? `🎨 ${v}` : `v${v}`}</option>
                    ))}
                </select>

                <select
                    className="form-select filter-select"
                    value={selectedAspectRatio}
                    onChange={(e) => onAspectRatioChange(e.target.value)}
                >
                    <option value="">全比率</option>
                    {ASPECT_RATIOS.filter(ar => ar).map((ar) => (
                        <option key={ar} value={ar}>{ar}</option>
                    ))}
                </select>

                {allTags.length > 0 && (
                    <div className="filter-tags">
                        {allTags.map((tag) => (
                            <button
                                key={tag}
                                className={`tag ${selectedTags.includes(tag) ? 'tag-active' : ''}`}
                                onClick={() => onTagToggle(tag)}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
