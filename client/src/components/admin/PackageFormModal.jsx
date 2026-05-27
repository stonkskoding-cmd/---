import { useEffect, useState } from 'react';
import FileUploadZone from './FileUploadZone';
import PackageMaterialsEditor from './PackageMaterialsEditor';

const CATEGORY_OPTIONS = [
  { value: 'OGE-IST', label: 'ОГЭ История' },
  { value: 'EGE-IST', label: 'ЕГЭ История' },
  { value: 'EGE-SOC', label: 'ЕГЭ Обществознание' },
];

function countMaterials(materials) {
  if (!Array.isArray(materials)) return 0;
  return materials.filter((m) => {
    if (m.type === 'text') return (m.content || '').trim().length > 0 || (m.url || '').trim().length > 0;
    return (m.url || '').trim().length > 0 || (m.content || '').trim().length > 0;
  }).length;
}

export default function PackageFormModal({
  open,
  onClose,
  editingId,
  title,
  setTitle,
  slug,
  setSlug,
  category,
  setCategory,
  price,
  setPrice,
  description,
  setDescription,
  coverUrl,
  setCoverUrl,
  materials,
  setMaterials,
  coverUploading,
  coverUploadProgress,
  materialUploadIndex,
  materialUploadProgress,
  onCoverFile,
  onMaterialFileUpload,
  saving,
  onSubmit,
  fieldErrors,
  draftHint,
  onDiscardDraft,
}) {
  const [tab, setTab] = useState('edit');

  useEffect(() => {
    if (open) setTab('edit');
  }, [open, editingId]);

  if (!open) return null;

  const priceNum = Number(price);
  const matsCount = countMaterials(materials);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div
        className="flex max-h-[100dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="package-form-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-gradient-to-r from-[#244E77] to-[#163754] px-4 py-3 text-white sm:px-6">
          <h2 id="package-form-title" className="text-lg font-bold">
            {editingId ? 'Редактировать пакет' : 'Новый пакет'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-white/90 transition hover:bg-white/15"
            aria-label="Закрыть"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {draftHint ? (
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900 sm:px-6">
            <span>{draftHint}</span>
            <button type="button" onClick={onDiscardDraft} className="font-semibold underline hover:text-amber-700">
              Сбросить черновик
            </button>
          </div>
        ) : null}

        <div className="flex shrink-0 gap-1 border-b border-gray-200 bg-gray-50 px-2 pt-2 sm:px-4">
          <button
            type="button"
            onClick={() => setTab('edit')}
            className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition ${
              tab === 'edit' ? 'bg-white text-[#244E77] shadow-sm' : 'text-gray-600 hover:text-[#244E77]'
            }`}
          >
            Редактирование
          </button>
          <button
            type="button"
            onClick={() => setTab('preview')}
            className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition ${
              tab === 'preview' ? 'bg-white text-[#244E77] shadow-sm' : 'text-gray-600 hover:text-[#244E77]'
            }`}
          >
            Предпросмотр
          </button>
        </div>

        {tab === 'preview' ? (
          <div className="min-h-0 flex-1 overflow-y-auto bg-[#f9fafb] p-6">
            <div className="mx-auto max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
              {coverUrl ? (
                <img src={coverUrl} alt="" className="h-44 w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <div className="flex h-44 items-center justify-center bg-gradient-to-br from-[#244E77] to-[#163754] text-sm text-white/80">
                  Нет обложки
                </div>
              )}
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#D4AF37]">
                  {CATEGORY_OPTIONS.find((c) => c.value === category)?.label || category}
                </p>
                <h3 className="mt-1 text-xl font-bold text-[#244E77]">{title.trim() || 'Без названия'}</h3>
                <p className="mt-3 line-clamp-6 text-sm leading-relaxed text-gray-600">
                  {description.trim() || 'Описание не заполнено'}
                </p>
                <div className="mt-4 flex items-baseline gap-2 border-t border-gray-100 pt-4">
                  <span className="text-2xl font-bold text-[#244E77]">
                    {Number.isFinite(priceNum) && priceNum > 0 ? `${priceNum.toLocaleString('ru-RU')} ₽` : '—'}
                  </span>
                  <span className="text-sm text-gray-500">· {matsCount} материалов</span>
                </div>
              </div>
            </div>
            <p className="mx-auto mt-4 max-w-lg text-center text-xs text-gray-500">
              Так карточка будет выглядеть на сайте (упрощённо). Slug:{' '}
              <code className="rounded bg-gray-200 px-1">{slug.trim() || '…'}</code>
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
              <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-3 text-xs text-[#163754]">
                <strong className="font-semibold">API сейчас:</strong> название, slug (при редактировании), категория,
                цена, описание, обложка, материалы (JSON). Поля «скидка», «активен», «даты продаж», «SEO meta» в базе
                пока нет — при необходимости добавим миграцию Prisma.
              </div>

              <div>
                <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-600">
                  Название пакета <span className="text-red-500">*</span>
                  <span className="font-normal text-gray-400" title="Отображается в каталоге">
                    ⓘ
                  </span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[#244E77]/25 ${
                    fieldErrors.title ? 'border-red-400 bg-red-50/50' : 'border-gray-300 focus:border-[#244E77]'
                  }`}
                />
                {fieldErrors.title ? <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p> : null}
              </div>

              {editingId ? (
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Slug (URL) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2.5 font-mono text-sm outline-none focus:ring-2 focus:ring-[#244E77]/25 ${
                      fieldErrors.slug ? 'border-red-400' : 'border-gray-300 focus:border-[#244E77]'
                    }`}
                  />
                  {fieldErrors.slug ? <p className="mt-1 text-xs text-red-600">{fieldErrors.slug}</p> : null}
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Категория</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#244E77] focus:ring-2 focus:ring-[#244E77]/20"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-600">
                    Цена, ₽ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#244E77]/25 ${
                      fieldErrors.price ? 'border-red-400 bg-red-50/50' : 'border-gray-300 focus:border-[#244E77]'
                    }`}
                  />
                  {fieldErrors.price ? <p className="mt-1 text-xs text-red-600">{fieldErrors.price}</p> : null}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Описание <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#244E77]/25 ${
                    fieldErrors.description ? 'border-red-400' : 'border-gray-300 focus:border-[#244E77]'
                  }`}
                />
                {fieldErrors.description ? <p className="mt-1 text-xs text-red-600">{fieldErrors.description}</p> : null}
              </div>

              <div>
                <FileUploadZone
                  id="package-cover-upload"
                  label="Обложка пакета"
                  hint="Изображение для карточки в каталоге"
                  accept="image/*,.pdf,.doc,.docx,.zip"
                  disabled={coverUploading}
                  uploading={coverUploading}
                  progress={coverUploadProgress}
                  onFile={onCoverFile}
                />
                {coverUrl ? (
                  <div className="mt-3 flex flex-wrap items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <img
                      src={coverUrl}
                      alt="Превью обложки"
                      className="h-28 max-w-[40%] rounded-lg border border-gray-200 object-contain shadow-sm"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <a href={coverUrl} target="_blank" rel="noreferrer" className="break-all text-xs text-[#244E77] underline">
                        {coverUrl}
                      </a>
                      <button
                        type="button"
                        onClick={() => setCoverUrl('')}
                        className="mt-2 block text-xs font-medium text-red-600 hover:underline"
                      >
                        Убрать обложку
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <PackageMaterialsEditor
                materials={materials}
                setMaterials={setMaterials}
                materialUploadIndex={materialUploadIndex}
                onMaterialFileUpload={onMaterialFileUpload}
                fieldErrors={fieldErrors}
              />
            </div>

            <div className="flex shrink-0 flex-wrap gap-2 border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <button
                type="submit"
                disabled={saving}
                className="min-w-[8rem] flex-1 rounded-xl bg-gradient-to-r from-[#244E77] to-[#163754] py-3 text-sm font-bold text-[#D4AF37] shadow-md transition hover:shadow-lg disabled:opacity-50 sm:flex-none sm:px-8"
              >
                {saving ? 'Сохранение…' : editingId ? 'Сохранить' : 'Создать пакет'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border-2 border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Отмена
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
