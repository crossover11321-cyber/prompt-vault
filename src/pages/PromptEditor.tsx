import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ParamControls from '../components/ParamControls';
import TagInput from '../components/TagInput';
import ImageUploader from '../components/ImageUploader';
import CopyButton from '../components/CopyButton';
import { addPrompt, updatePrompt, getPrompt, getAllTags, DEFAULT_PARAMS, type MidjourneyParams } from '../lib/db';
import { buildImagineCommand } from '../lib/commandBuilder';
import './PromptEditor.css';

export default function PromptEditor() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = !!id;

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [params, setParams] = useState<MidjourneyParams>({ ...DEFAULT_PARAMS });
    const [tags, setTags] = useState<string[]>([]);
    const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
    const [allTags, setAllTags] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const init = async () => {
            const existingTags = await getAllTags();
            setAllTags(existingTags);

            if (id) {
                const prompt = await getPrompt(Number(id));
                if (prompt) {
                    setTitle(prompt.title);
                    setBody(prompt.body);
                    setParams(prompt.params);
                    setTags(prompt.tags);
                    setImageDataUrl(prompt.imageDataUrl);
                } else {
                    navigate('/');
                }
            }
        };
        init();
    }, [id, navigate]);

    const command = useMemo(() => buildImagineCommand(body, params), [body, params]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!body.trim()) return;
        setSaving(true);

        try {
            const data = {
                title: title.trim() || body.trim().slice(0, 50),
                body: body.trim(),
                params,
                tags,
                imageDataUrl,
            };

            if (isEditing) {
                await updatePrompt(Number(id), data);
            } else {
                await addPrompt(data);
            }
            navigate('/');
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="editor-page">
            <header className="editor-header">
                <button className="btn btn-ghost" onClick={() => navigate(-1)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    戻る
                </button>
                <h1 className="editor-title">{isEditing ? 'プロンプトを編集' : '新規プロンプト'}</h1>
                <div style={{ width: 80 }} />
            </header>

            <form onSubmit={handleSubmit} className="editor-form">
                <div className="editor-main">
                    {/* Left column - prompt content */}
                    <div className="editor-content">
                        <div className="form-group">
                            <label className="form-label">タイトル</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="プロンプトの名前（省略するとプロンプト本文の先頭が使われます）"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">プロンプト <span className="required">*</span></label>
                            <textarea
                                className="form-textarea prompt-body-textarea"
                                placeholder="cyberpunk city, neon lights, rain, reflections, cinematic lighting..."
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={6}
                                required
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="form-group">
                            <label className="form-label">生成画像</label>
                            <ImageUploader imageDataUrl={imageDataUrl} onChange={setImageDataUrl} />
                        </div>

                        {/* Tags */}
                        <div className="form-group">
                            <label className="form-label">タグ</label>
                            <TagInput tags={tags} onChange={setTags} allTags={allTags} />
                        </div>
                    </div>

                    {/* Right column - params + preview */}
                    <div className="editor-sidebar">
                        <ParamControls params={params} onChange={setParams} />

                        {/* Live Command Preview */}
                        <div className="command-preview">
                            <div className="command-preview-header">
                                <h3 className="command-preview-title">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="4 17 10 11 4 5" />
                                        <line x1="12" y1="19" x2="20" y2="19" />
                                    </svg>
                                    コマンドプレビュー
                                </h3>
                                <CopyButton text={command} label="コピー" />
                            </div>
                            <pre className="command-preview-code">{command}</pre>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="editor-actions">
                    <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate(-1)}>
                        キャンセル
                    </button>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={saving || !body.trim()}>
                        {saving ? '保存中...' : isEditing ? '更新する' : '保存する'}
                    </button>
                </div>
            </form>
        </div>
    );
}
