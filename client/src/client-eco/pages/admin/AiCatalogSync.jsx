import React, { useEffect, useState } from 'react';
import {
  ArrowPathIcon,
  PlayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/admin/AdminLayout';
import { getCatalogStatus, syncCatalog, uploadAiDocument } from '../../services/aiService';

const formatTimestamp = (value) => {
  if (!value) return 'Chua co';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Chua co';
  return date.toLocaleString('vi-VN');
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

  const loadStatus = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getCatalogStatus();
      setStatus(data);
    } catch (err) {
      setError(err?.message || 'Khong the tai trang thai catalog');
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
      setError(err?.message || 'Khong the dong bo catalog');
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
    } catch (err) {
      setUploadError(err?.message || 'Khong the upload tai lieu');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const lastResult = status?.lastSyncResult;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">AI Catalog</p>
            <h1 className="text-2xl font-semibold text-gray-900">Dong bo catalog QA</h1>
            <p className="text-sm text-gray-500 mt-2">
              Theo doi trang thai index Qdrant va chay dong bo thu cong khi can.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadStatus}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-400"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Tai lai
            </button>
            <button
              type="button"
              onClick={handleSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold disabled:opacity-60"
            >
              <PlayIcon className="w-4 h-4" />
              {isSyncing ? 'Dang dong bo...' : 'Dong bo ngay'}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 px-4 py-3 rounded-xl">
            <ExclamationTriangleIcon className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-700">Trang thai hien tai</p>
              {status?.running ? (
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">Dang chay</span>
              ) : (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">San sang</span>
              )}
            </div>

            {isLoading ? (
              <p className="text-sm text-gray-500">Dang tai...</p>
            ) : (
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    Lan dong bo gan nhat
                  </span>
                  <span className="font-semibold text-gray-800">{formatTimestamp(status?.lastSyncAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Ly do</span>
                  <span className="font-semibold text-gray-800">{status?.lastSyncReason || 'Chua co'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Dang cho</span>
                  <span className="font-semibold text-gray-800">{status?.pending ? 'Co' : 'Khong'}</span>
                </div>
                {status?.lastSyncError && (
                  <div className="text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">
                    {status.lastSyncError}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
              <p className="text-sm font-semibold text-gray-700">Ket qua dong bo</p>
            </div>
            {isLoading ? (
              <p className="text-sm text-gray-500">Dang tai...</p>
            ) : lastResult ? (
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Trang thai</span>
                  <span className="font-semibold text-gray-800">{lastResult.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>San pham</span>
                  <span className="font-semibold text-gray-800">{lastResult.counts?.products ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Khuyen mai</span>
                  <span className="font-semibold text-gray-800">{lastResult.counts?.promotions ?? 0}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Chua co du lieu dong bo.</p>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <CloudArrowUpIcon className="w-4 h-4 text-emerald-500" />
            <p className="text-sm font-semibold text-gray-700">Upload tai lieu RAG</p>
          </div>
          <p className="text-xs text-gray-500">
            Ho tro PDF, DOCX, PPTX, XLSX. Toi da 25MB. Chi admin moi duoc upload.
          </p>

          <div className="mt-4">
            <label className="flex flex-col items-center justify-center gap-3 border border-dashed border-gray-200 rounded-2xl px-4 py-6 text-gray-500 text-sm cursor-pointer hover:border-gray-400">
              <CloudArrowUpIcon className="w-6 h-6" />
              <span>Keo tha hoac click de chon file</span>
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
                <div className="h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-gray-900 transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Upload {uploadProgress}%</p>
              </div>
            )}

            {uploadResult && (
              <div className="mt-4 text-xs text-emerald-700 bg-emerald-50 px-3 py-3 rounded-xl flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 mt-0.5" />
                <div>
                  <p className="font-semibold">Upload thanh cong</p>
                  <p>{uploadResult.fileName} - {uploadResult.chunkCount} chunks</p>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="mt-4 text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-xl">
                {uploadError}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AiCatalogSync;
