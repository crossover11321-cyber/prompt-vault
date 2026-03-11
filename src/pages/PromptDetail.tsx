import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CopyButton from '../components/CopyButton';
import { getPrompt, deletePrompt, type Prompt } from '../lib/db';
import { buildImagineCommand } from '../lib/commandBuilder';
import './PromptDetail.css';

export default function PromptDetail() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [prompt, setPrompt] = useState<Prompt | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (!id) return navigate('/');
            const p = await getPrompt(Number(id));
            if (p) {
                setPrompt(p);
            } else {
                navigate('/');
            }
        };
        load();
    }, [id, navigate]);

    const command = useMemo(
        () => (prompt ? buildImagineCommand(prompt.body, prompt.params) : ''),
        [prompt]
    );

    const handleDelete = async () => {
        if (!prompt?.id) return;
        await deletePrompt(prompt.id);
        navigate('/');
    };

    if (!prompt) {
        return (
            <div className="detail-page">
                <div className="dashboard-loading"><div className="loading-spinner" /></div>
            </div>
        );
    }

    const paramsList = [
        { label: 'バージョン', value: prompt.params.version.startsWith('niji') ? prompt.params.version : `v${prompt.params.version}` },
        { label: 'アスペクト比', value: prompt.params.aspectRatio },
        { label: 'スタイライズ', value: prompt.params.stylize.toString() },
        { label: 'カオス', value: prompt.params.chaos.toString() },
        { label: '品質', value: prompt.params.quality.toString() },
        { label: 'ウィアード', value: prompt.params.weird.toString() },
        ...(prompt.params.seed !== undefined ? [{ label: 'シード', value: prompt.params.seed.toString() }] : []),
        { label: 'ストップ', value: `${prompt.params.stop}%` },
        { label: 'タイル', value: prompt.params.tile ? 'ON' : 'OFF' },
        ...(prompt.params.styleRef ? [{ label: 'スタイルRef', value: prompt.params.styleRef }] : []),
        ...(prompt.params.characterRef ? [{ label: 'キャラクターRef', value: prompt.params.characterRef }] : []),
        ...(prompt.params.no ? [{ label: '除外', value: prompt.params.no }] : []),
        ...(prompt.params.personalize ? [{ label: 'パーソナライズ', value: prompt.params.personalize }] : []),
    ];

    return (
        <div className="detail-page animate-fade-in">
            <header className="detail-header">
                <button className="btn btn-ghost" onClick={() => navigate('/')}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    一覧に戻る
                </button>
                <div className="detail-header-actions">
                    <button className="btn btn-secondary" onClick={() => navigate(`/edit/${prompt.id}`)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        編集
                    </button>
                    <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        削除
                    </button>
                </div>
            </header>

            <div className="detail-main">
                {/* Image */}
                {prompt.imageDataUrl && (
                    <div className="detail-image">
                        <img src={prompt.imageDataUrl} alt={prompt.title} />
                    </div>
                )}

                <div className="detail-content">
                    <h1 className="detail-title">{prompt.title}</h1>

                    {/* Tags */}
                    {prompt.tags.length > 0 && (
                        <div className="detail-tags">
                            {prompt.tags.map((tag) => (
                                <span key={tag} className="tag">{tag}</span>
                            ))}
                        </div>
                    )}

                    {/* Prompt Body */}
                    <div className="detail-section">
                        <h2 className="detail-section-title">プロンプト</h2>
                        <p className="detail-body">{prompt.body}</p>
                    </div>

                    {/* Parameters */}
                    <div className="detail-section">
                        <h2 className="detail-section-title">パラメータ</h2>
                        <div className="detail-params-grid">
                            {paramsList.map(({ label, value }) => (
                                <div key={label} className="detail-param">
                                    <span className="detail-param-label">{label}</span>
                                    <span className="detail-param-value">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Command */}
                    <div className="detail-section">
                        <div className="detail-command-header">
                            <h2 className="detail-section-title">コマンド</h2>
                            <CopyButton text={command} label="コピー" />
                        </div>
                        <pre className="detail-command-code">{command}</pre>
                    </div>

                    {/* Meta */}
                    <div className="detail-meta">
                        <span>作成: {prompt.createdAt.toLocaleString('ja-JP')}</span>
                        <span>更新: {prompt.updatedAt.toLocaleString('ja-JP')}</span>
                    </div>
                </div>
            </div>

            {/* Delete Confirm Modal */}
            {showDeleteConfirm && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="modal-content animate-fade-in-scale" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">プロンプトを削除しますか？</h3>
                        <p className="modal-text">「{prompt.title}」を削除します。この操作は取り消せません。</p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                                キャンセル
                            </button>
                            <button className="btn btn-danger" onClick={handleDelete}>
                                削除する
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
