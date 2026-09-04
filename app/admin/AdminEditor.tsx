'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { SiteContent } from '../content';

type ApiResponse = { ok: boolean; data?: SiteContent; version?: string; commitSha?: string; error?: string };
const clone = (data: SiteContent) => JSON.parse(JSON.stringify(data)) as SiteContent;

export default function AdminEditor() {
  const [savedState, setSavedState] = useState<SiteContent | null>(null);
  const [draftState, setDraftState] = useState<SiteContent | null>(null);
  const [version, setVersion] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingImages, setPendingImages] = useState<Record<string, File>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const previewsRef = useRef<Record<string, string>>({});
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const dirty = useMemo(() => Object.keys(pendingImages).length > 0 || (!!savedState && !!draftState && JSON.stringify(savedState) !== JSON.stringify(draftState)), [savedState, draftState, pendingImages]);

  useEffect(() => {
    fetch('/api/admin/content', { cache: 'no-store' }).then(async (response) => ({ response, body: await response.json() as ApiResponse })).then(({ response, body }) => {
      if (!response.ok || !body.data || !body.version) throw new Error(body.error || 'Could not load content');
      setSavedState(body.data); setDraftState(clone(body.data)); setVersion(body.version);
    }).catch((error: Error) => setMessage({ kind: 'error', text: error.message })).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  useEffect(() => () => { Object.values(previewsRef.current).forEach(URL.revokeObjectURL); }, []);

  function clearPendingImage(sectionId: string) {
    const preview = previewsRef.current[sectionId];
    if (preview) URL.revokeObjectURL(preview);
    const nextPreviews = { ...previewsRef.current }; delete nextPreviews[sectionId];
    previewsRef.current = nextPreviews; setPreviews(nextPreviews);
    setPendingImages((current) => { const next = { ...current }; delete next[sectionId]; return next; });
  }

  function clearAllPendingImages() {
    Object.values(previewsRef.current).forEach(URL.revokeObjectURL);
    previewsRef.current = {}; setPreviews({}); setPendingImages({});
  }

  function selectImage(sectionId: string, index: number, file: File | undefined) {
    if (!file || !draftState) return;
    const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
    const extension = extensions[file.type];
    if (!extension) { setMessage({ kind: 'error', text: 'Choose a JPEG, PNG, WebP, or GIF image.' }); return; }
    if (file.size > 3 * 1024 * 1024) { setMessage({ kind: 'error', text: 'Each image must be 3 MB or smaller.' }); return; }
    clearPendingImage(sectionId);
    const url = URL.createObjectURL(file);
    previewsRef.current = { ...previewsRef.current, [sectionId]: url }; setPreviews(previewsRef.current);
    setPendingImages((current) => ({ ...current, [sectionId]: file }));
    const sections = [...draftState.sections]; sections[index] = { ...sections[index], image: `/images/admin/${sectionId}.${extension}` };
    setDraftState({ ...draftState, sections }); setMessage(null);
  }

  async function save() {
    if (!draftState || !dirty || saving) return;
    setSaving(true); setMessage(null);
    try {
      const form = new FormData(); form.set('data', JSON.stringify(draftState)); form.set('version', version);
      Object.entries(pendingImages).forEach(([sectionId, file]) => form.set(`image:${sectionId}`, file));
      const response = await fetch('/api/admin/save', { method: 'POST', body: form });
      const body = await response.json() as ApiResponse;
      if (!response.ok || !body.data || !body.version) throw new Error(body.error || 'Save failed');
      setSavedState(body.data); setDraftState(clone(body.data)); setVersion(body.version);
      clearAllPendingImages();
      setMessage({ kind: 'success', text: `Saved in one Git commit${body.commitSha ? ` (${body.commitSha.slice(0, 7)})` : ''}.` });
    } catch (error) { setMessage({ kind: 'error', text: error instanceof Error ? error.message : 'Save failed' }); }
    finally { setSaving(false); }
  }

  function discard() { if (savedState && !saving) { clearAllPendingImages(); setDraftState(clone(savedState)); setMessage(null); } }
  async function logout() { if (dirty && !window.confirm('Discard unsaved changes and sign out?')) return; await fetch('/api/admin/logout', { method: 'POST' }); window.location.reload(); }
  if (loading) return <main className="admin-page"><p>Loading content from GitHub…</p></main>;
  if (!draftState) return <main className="admin-page"><p className="form-error">{message?.text || 'Content could not be loaded.'}</p></main>;

  return <main className="admin-page admin-dashboard">
    <div className="admin-toolbar"><div><p className="eyebrow">GITHUB-BACKED ADMIN</p><h1>Редактор витрины</h1></div><div className="toolbar-actions"><a className="secondary-button" href="/" onClick={(e) => { if (dirty && !confirm('Leave with unsaved changes?')) e.preventDefault(); }}>Открыть сайт</a><button className="secondary-button" onClick={logout}>Выйти</button></div></div>
    <div className={dirty ? 'warning-box' : 'status-box'}>{dirty ? 'Unsaved changes — nothing has been sent to GitHub yet.' : 'All changes are saved.'}</div>
    <section className="editor-card">
      <label>Название бренда<input value={draftState.siteTitle} onChange={(e) => setDraftState({ ...draftState, siteTitle: e.target.value })} /></label>
      <label>Главный заголовок<input value={draftState.heroTitle} onChange={(e) => setDraftState({ ...draftState, heroTitle: e.target.value })} /></label>
      <label>Описание<textarea value={draftState.heroDescription} onChange={(e) => setDraftState({ ...draftState, heroDescription: e.target.value })} /></label>
    </section>
    <section className="product-editor-grid">{draftState.sections.map((section, index) => <article className="editor-card" key={section.id}>
      <div className="mini-preview"><img src={previews[section.id] || section.image} alt="" /></div>
      <label>Название<input value={section.title} onChange={(e) => { const sections = [...draftState.sections]; sections[index] = { ...section, title: e.target.value }; setDraftState({ ...draftState, sections }); }} /></label>
      <label>Описание<textarea value={section.description} onChange={(e) => { const sections = [...draftState.sections]; sections[index] = { ...section, description: e.target.value }; setDraftState({ ...draftState, sections }); }} /></label>
      <label>Заменить изображение<input key={previews[section.id] ? 'pending' : 'empty'} type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={saving} onChange={(e) => selectImage(section.id, index, e.target.files?.[0])} /><small>{pendingImages[section.id] ? `${pendingImages[section.id].name} is pending. ` : ''}Preview stays local until Save. Maximum 3 MB.</small></label>
      <label>Путь / URL картинки<input value={section.image} onChange={(e) => { clearPendingImage(section.id); const sections = [...draftState.sections]; sections[index] = { ...section, image: e.target.value }; setDraftState({ ...draftState, sections }); }} /></label>
    </article>)}</section>
    <div className="save-bar"><span className={message?.kind === 'error' ? 'form-error' : ''}>{saving ? 'Saving one commit…' : message?.text}</span><button className="secondary-button" onClick={discard} disabled={!dirty || saving}>Discard changes</button><button onClick={save} disabled={!dirty || saving}>{saving ? 'Saving…' : 'Save changes'}</button></div>
  </main>;
}
