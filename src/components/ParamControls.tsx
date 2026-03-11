import type { MidjourneyParams } from '../lib/db';
import './ParamControls.css';

interface ParamControlsProps {
    params: MidjourneyParams;
    onChange: (params: MidjourneyParams) => void;
}

const VERSIONS = ['7', '6.1', '6', '5.2', '5.1', '5', 'niji 7', 'niji 6', 'niji 5'];
const ASPECT_PRESETS = ['1:1', '4:3', '3:2', '16:9', '9:16', '2:3', '3:4', '4:5', '5:4'];
const QUALITY_OPTIONS = [0.25, 0.5, 1];

export default function ParamControls({ params, onChange }: ParamControlsProps) {
    const update = <K extends keyof MidjourneyParams>(key: K, value: MidjourneyParams[K]) => {
        onChange({ ...params, [key]: value });
    };

    return (
        <div className="param-controls">
            <h3 className="param-controls-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Midjourney パラメータ
            </h3>

            <div className="param-grid">
                {/* Version */}
                <div className="param-item">
                    <label className="form-label">バージョン</label>
                    <select
                        className="form-select"
                        value={params.version}
                        onChange={(e) => update('version', e.target.value)}
                    >
                        {VERSIONS.map((v) => (
                            <option key={v} value={v}>
                                {v.startsWith('niji') ? `🎨 ${v}` : `v${v}`}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Aspect Ratio */}
                <div className="param-item">
                    <label className="form-label">アスペクト比</label>
                    <div className="aspect-presets">
                        {ASPECT_PRESETS.map((ar) => (
                            <button
                                key={ar}
                                className={`aspect-btn ${params.aspectRatio === ar ? 'active' : ''}`}
                                onClick={() => update('aspectRatio', ar)}
                            >
                                {ar}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stylize */}
                <div className="param-item param-item-full">
                    <label className="form-label">スタイライズ (--s)</label>
                    <div className="range-slider">
                        <input
                            type="range"
                            min="0"
                            max="1000"
                            step="10"
                            value={params.stylize}
                            onChange={(e) => update('stylize', Number(e.target.value))}
                        />
                        <span className="range-value">{params.stylize}</span>
                    </div>
                </div>

                {/* Chaos */}
                <div className="param-item param-item-full">
                    <label className="form-label">カオス (--c)</label>
                    <div className="range-slider">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={params.chaos}
                            onChange={(e) => update('chaos', Number(e.target.value))}
                        />
                        <span className="range-value">{params.chaos}</span>
                    </div>
                </div>

                {/* Quality */}
                <div className="param-item">
                    <label className="form-label">品質 (--q)</label>
                    <div className="segment-buttons">
                        {QUALITY_OPTIONS.map((q) => (
                            <button
                                key={q}
                                className={`segment-btn ${params.quality === q ? 'active' : ''}`}
                                onClick={() => update('quality', q)}
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Weird */}
                <div className="param-item param-item-full">
                    <label className="form-label">ウィアード (--w)</label>
                    <div className="range-slider">
                        <input
                            type="range"
                            min="0"
                            max="3000"
                            step="50"
                            value={params.weird}
                            onChange={(e) => update('weird', Number(e.target.value))}
                        />
                        <span className="range-value">{params.weird}</span>
                    </div>
                </div>

                {/* Seed */}
                <div className="param-item">
                    <label className="form-label">シード (--seed)</label>
                    <input
                        type="number"
                        className="form-input"
                        placeholder="ランダム"
                        value={params.seed ?? ''}
                        onChange={(e) => update('seed', e.target.value ? Number(e.target.value) : undefined)}
                    />
                </div>

                {/* Stop */}
                <div className="param-item">
                    <label className="form-label">ストップ (--stop)</label>
                    <div className="range-slider">
                        <input
                            type="range"
                            min="10"
                            max="100"
                            step="5"
                            value={params.stop}
                            onChange={(e) => update('stop', Number(e.target.value))}
                        />
                        <span className="range-value">{params.stop}%</span>
                    </div>
                </div>

                {/* Tile */}
                <div className="param-item">
                    <label className="form-label">タイル (--tile)</label>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={params.tile}
                            onChange={(e) => update('tile', e.target.checked)}
                        />
                        <span className="toggle-track" />
                    </label>
                </div>

                {/* Style Reference */}
                <div className="param-item param-item-full">
                    <label className="form-label">スタイルリファレンス (--sref)</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="URL を入力..."
                        value={params.styleRef}
                        onChange={(e) => update('styleRef', e.target.value)}
                    />
                </div>

                {/* Character Reference */}
                <div className="param-item param-item-full">
                    <label className="form-label">キャラクターリファレンス (--cref)</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="URL を入力..."
                        value={params.characterRef}
                        onChange={(e) => update('characterRef', e.target.value)}
                    />
                </div>

                {/* No (Negative) */}
                <div className="param-item param-item-full">
                    <label className="form-label">除外キーワード (--no)</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="除外したい要素をカンマ区切りで..."
                        value={params.no}
                        onChange={(e) => update('no', e.target.value)}
                    />
                </div>

                {/* Personalize */}
                <div className="param-item param-item-full">
                    <label className="form-label">パーソナライズ (--p)</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="パーソナライズコード..."
                        value={params.personalize}
                        onChange={(e) => update('personalize', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}
