import React, { useEffect, useState } from 'react';
import {
  ArrowPathIcon,
  PlayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CloudArrowUpIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  deleteAiDocument,
  getAiDocuments,
  getCatalogStatus,
  syncCatalog,
  uploadAiDocument
} from '../../services/aiService';

const formatTimestamp = (value) => {
  if (!value) return 'Chua co';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Chua co';
  return date.toLocaleString('vi-VN');
};

const formatBytes = (value) => {
  const size = Number(value) || 0;
  if (!size) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let index = 0;
  let current = size;
  while (current >= 1024 && index < units.length - 1) {
    current /= 1024;
    index += 1;
  }
  return `${current.toFixed(current < 10 && index > 0 ? 1 : 0)} ${units[index]}`;
};

const AiCatalogSync = () => {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [docsError, setDocsError] = useState('');
  const [deletingFile, setDeletingFile] = useState('');

  const loadStatus = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getCatalogStatus();
      setStatus(data);
    } catch (err) {
      setError(err?.message || 'Không thể tải trạng thái catalog');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setError('');
    try {
      await syncCatalog({ reason: 'manual' });
      await loadStatus();
    } catch (err) {
      setError(err?.message || 'Không thể đồng bộ catalog');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploadResult(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadAiDocument({
        file,
        onProgress: setUploadProgress
      });
      setUploadResult(result);
      await loadDocuments();
    } catch (err) {
      setUploadError(err?.message || 'Không thể upload tài liệu');
    } finally {
      setIsUploading(false);
    }
  };

  const loadDocuments = async () => {
    setDocsLoading(true);
    setDocsError('');
    try {
      const data = await getAiDocuments();
      setDocuments(data?.items || []);
    } catch (err) {
      setDocsError(err?.message || 'Không thể tải danh sách tài liệu');
    } finally {
      setDocsLoading(false);
    }
  };

  const handleDeleteDocument = async (fileName) => {
    if (!fileName) return;
    setDeletingFile(fileName);
    setDocsError('');

    try {
      await deleteAiDocument({ fileName });
      await loadDocuments();
    } catch (err) {
      setDocsError(err?.message || 'Không thể xóa tài liệu');
    } finally {
      setDeletingFile('');
    }
  };

  useEffect(() => {
    loadStatus();
    loadDocuments();
  }, []);

  const lastResult = status?.lastSyncResult;

  return (
    <AdminLayout>
      <div className="min-h-screen space-y-6 bg-transparent p-4 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary dark:text-emerald-400">AI Catalog</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">Đồng bộ catalog QA</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Theo dõi trạng thái index Qdrant và chạy đồng bộ thủ công khi cần.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadStatus}
              className="inline-flex items-center gap-2 rounded-xl border border-water/30 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-water/10 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Tai lai
            </button>
            <button
              type="button"
              onClick={handleSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-water px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-water/25 transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60 dark:from-emerald-600 dark:to-teal-600 dark:shadow-emerald-950/30"
            >
              <PlayIcon className="w-4 h-4" />
              {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200/60 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
            <ExclamationTriangleIcon className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-panel rounded-3xl border border-water/30 p-6 shadow-xl dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">Trạng thái hiện tại</p>
              {status?.running ? (
                <span className="rounded-full border border-amber-200/60 bg-amber-100/80 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300">Dang chay</span>
              ) : (
                <span className="rounded-full border border-emerald-200/60 bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">San sang</span>
              )}
            </div>

            {isLoading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Đang tải...</p>
            ) : (
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    Lần đồng bộ gần nhất
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-white">{formatTimestamp(status?.lastSyncAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Lý do</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{status?.lastSyncReason || 'Chưa có'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Đang chờ</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{status?.pending ? 'Có' : 'Không'}</span>
                </div>
                {status?.lastSyncError && (
                  <div className="rounded-lg border border-rose-200/60 bg-rose-50/80 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
                    {status.lastSyncError}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="glass-panel rounded-3xl border border-water/30 p-6 shadow-xl dark:border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
              <p className="text-sm font-semibold text-slate-800 dark:text-white">Kết quả đồng bộ</p>
            </div>
            {isLoading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Đang tải...</p>
            ) : lastResult ? (
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Trạng thái</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{lastResult.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sản phẩm</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{lastResult.counts?.products ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Khuyến mãi</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{lastResult.counts?.promotions ?? 0}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có dữ liệu đồng bộ.</p>
            )}
          </div>
        </div>

        <div className="glass-panel rounded-3xl border border-water/30 p-6 shadow-xl dark:border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <CloudArrowUpIcon className="w-4 h-4 text-emerald-500" />
            <p className="text-sm font-semibold text-slate-800 dark:text-white">Upload tài liệu RAG</p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hỗ trợ PDF, DOCX, PPTX, XLSX. Tối đa 25MB. Chỉ admin mới được upload.
          </p>

          <div className="mt-4">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-water/30 bg-water/5 px-4 py-6 text-sm text-slate-500 transition hover:border-primary/50 hover:bg-water/10 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:border-emerald-400/50 dark:hover:bg-white/10">
              <CloudArrowUpIcon className="w-6 h-6" />
              <span>Kéo thả hoặc click để chọn file</span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx,.pptx,.xlsx"
                onChange={handleUpload}
                disabled={isUploading}
              />
            </label>

            {isUploading && (
              <div className="mt-4">
                <div className="h-2 rounded-full bg-water/20 dark:bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-primary to-water transition-all dark:from-emerald-500 dark:to-teal-400"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Upload {uploadProgress}%</p>
              </div>
            )}

            {uploadResult && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200/60 bg-emerald-50/80 px-3 py-3 text-xs text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                <CheckCircleIcon className="w-4 h-4 mt-0.5" />
                <div>
                  <p className="font-semibold">Upload thành công</p>
                  <p>{uploadResult.fileName} - {uploadResult.chunkCount} chunks</p>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="mt-4 rounded-xl border border-rose-200/60 bg-rose-50/80 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
                {uploadError}
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel rounded-3xl border border-water/30 p-6 shadow-xl dark:border-white/10">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">Tài liệu đã upload</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Danh sách tài liệu trong thư mục RAG.</p>
            </div>
            <button
              type="button"
              onClick={loadDocuments}
              className="inline-flex items-center gap-2 rounded-xl border border-water/30 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-water/10 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Tải lại
            </button>
          </div>

          {docsError && (
            <div className="mb-4 rounded-xl border border-rose-200/60 bg-rose-50/80 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
              {docsError}
            </div>
          )}

          {docsLoading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Đang tải danh sách...</p>
          ) : documents.length ? (
            <div className="divide-y divide-water/10 dark:divide-white/10">
              {documents.map((doc) => (
                <div key={doc.fileName} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{doc.fileName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatBytes(doc.sizeBytes)} • {formatTimestamp(doc.uploadedAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteDocument(doc.fileName)}
                    disabled={deletingFile === doc.fileName}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200/60 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60 dark:border-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-950/30"
                  >
                    <TrashIcon className="w-4 h-4" />
                    {deletingFile === doc.fileName ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có tài liệu nào.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AiCatalogSync;
