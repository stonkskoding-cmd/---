import { useCallback } from 'react';
import FileUploadZone from './FileUploadZone';

const MATERIAL_TYPES = [
  { value: 'text', label: 'Текст' },
  { value: 'image', label: 'Изображение' },
  { value: 'video', label: 'Видео' },
  { value: 'file', label: 'Файл' },
];

export default function PackageMaterialsEditor({
  materials,
  setMaterials,
  materialUploadIndex,
  onMaterialFileUpload,
  fieldErrors,
}) {
  const addRow = () => {
    setMaterials((prev) => [
      ...prev,
      { type: 'text', title: '', content: '', url: '', order: prev.length },
    ]);
  };

  const removeRow = (index) => {
    setMaterials((prev) => prev.filter((_, i) => i !== index).map((m, i) => ({ ...m, order: i })));
  };

  const update = (index, field, value) => {
    setMaterials((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const moveRow = useCallback(
    (from, to) => {
      if (to < 0 || to >= materials.length) return;
      setMaterials((prev) => {
        const next = [...prev];
        const [row] = next.splice(from, 1);
        next.splice(to, 0, row);
        return next.map((m, i) => ({ ...m, order: i }));
      });
    },
    [materials.length, setMaterials],
  );

  return (
    <div className="space-y-3 border-t border-gray-200 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[#244E77]">Материалы пакета</h3>
          <p className="text-xs text-gray-500">
            Порядок в списке = порядок уроков. Перетащите строку за ⋮⋮ или используйте стрелки.
          </p>
        </div>
        <button
          type="button"
          onClick={addRow}
          className="rounded-lg border border-[#244E77] bg-white px-3 py-1.5 text-xs font-semibold text-[#244E77] transition hover:bg-[#244E77] hover:text-white"
        >
          + Материал
        </button>
      </div>
      {fieldErrors?.materials ? (
        <p className="text-xs text-red-600">{fieldErrors.materials}</p>
      ) : null}

      <div className="max-h-[min(50vh,22rem)] space-y-3 overflow-y-auto pr-1 sm:max-h-80">
        {materials.map((m, index) => (
          <div
            key={`mat-${index}`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', String(index));
              e.dataTransfer.effectAllowed = 'move';
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const from = Number(e.dataTransfer.getData('text/plain'));
              if (!Number.isNaN(from)) moveRow(from, index);
            }}
            className="rounded-xl border border-gray-200 bg-gradient-to-b from-white to-gray-50/80 p-3 shadow-sm"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className="cursor-grab select-none text-gray-400 active:cursor-grabbing"
                title="Перетащить"
                aria-hidden
              >
                ⋮⋮
              </span>
              <select
                value={m.type}
                onChange={(e) => {
                  const v = e.target.value;
                  setMaterials((prev) =>
                    prev.map((row, i) =>
                      i === index
                        ? {
                            ...row,
                            type: v,
                            url: v === 'text' ? '' : row.url,
                            content: v === 'text' ? row.content || row.url : '',
                          }
                        : row,
                    ),
                  );
                }}
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs font-medium"
              >
                {MATERIAL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  title="Вверх"
                  disabled={index === 0}
                  onClick={() => moveRow(index, index - 1)}
                  className="rounded border border-gray-200 px-2 py-0.5 text-xs disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  title="Вниз"
                  disabled={index === materials.length - 1}
                  onClick={() => moveRow(index, index + 1)}
                  className="rounded border border-gray-200 px-2 py-0.5 text-xs disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  Удалить
                </button>
              </div>
            </div>
            <input
              type="text"
              placeholder="Заголовок урока"
              value={m.title}
              onChange={(e) => update(index, 'title', e.target.value)}
              className="mb-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#244E77] focus:ring-1 focus:ring-[#244E77]/20"
            />
            {m.type === 'text' ? (
              <textarea
                placeholder="Текст урока"
                value={m.content}
                onChange={(e) => update(index, 'content', e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#244E77]"
              />
            ) : (
              <div className="space-y-2">
                <input
                  type="url"
                  placeholder="Ссылка на видео или файл (https://…)"
                  value={m.url}
                  onChange={(e) => update(index, 'url', e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#244E77]"
                />
                <FileUploadZone
                  id={`mat-upload-${index}`}
                  compact
                  accept="image/*,video/*,.pdf,.doc,.docx,.zip"
                  disabled={materialUploadIndex === index}
                  uploading={materialUploadIndex === index}
                  progress={materialUploadIndex === index ? 72 : 0}
                  onFile={(file) => onMaterialFileUpload(index, file)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
