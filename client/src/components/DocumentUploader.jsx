import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, X, RefreshCw, Eye } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function DocumentUploader({
  documentType,
  title,
  description,
  existingDoc = null,
  onUpload,
  disabled = false,
  required = true
}) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    setError(null);
    if (!file) return;

    // Validate size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size exceeds the 5MB limit. Please upload a smaller compressed file.');
      return;
    }

    // Validate type
    const validMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validMimes.includes(file.type)) {
      setError('Unsupported file type. Only PDF, JPG, and PNG documents are accepted.');
      return;
    }

    try {
      setUploading(true);
      await onUpload(documentType, file);
    } catch (err) {
      setError(err.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 transition-all hover:border-slate-300">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            {title} {required && <span className="text-red-500 font-bold">*</span>}
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
        </div>

        {existingDoc && (
          <StatusBadge status={existingDoc.verification_status || 'Pending'} size="sm" />
        )}
      </div>

      {existingDoc ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <FileText className="w-5 h-5 text-gov-navy shrink-0" />
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {existingDoc.original_filename}
                </p>
                <p className="text-[10px] text-slate-500">
                  {existingDoc.file_size ? `${(existingDoc.file_size / 1024).toFixed(1)} KB` : 'Uploaded file'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`/api/documents/${existingDoc.id}/download`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-slate-600 hover:text-gov-navy hover:bg-slate-200 rounded-md transition-colors"
                title="Preview Document"
              >
                <Eye className="w-4 h-4" />
              </a>

              {!disabled && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Re-upload
                </button>
              )}
            </div>
          </div>

          {existingDoc.verification_remarks && (
            <div className={`p-2 rounded text-[11px] border ${
              existingDoc.verification_status === 'Rejected'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              <strong>Officer Remark:</strong> {existingDoc.verification_remarks}
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-gov-navy bg-blue-50/50'
              : 'border-slate-300 hover:border-gov-navy/60 hover:bg-slate-50/50 bg-white'
          } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-slate-200 border-t-gov-navy rounded-full animate-spin"></div>
              <p className="text-xs text-slate-600 font-semibold">Encrypting and uploading document...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <Upload className="w-6 h-6 text-slate-400" />
              <p className="text-xs font-semibold text-slate-700">
                <span className="text-gov-navy underline">Click to upload</span> or drag and drop
              </p>
              <p className="text-[10px] text-slate-400">PDF, JPG, or PNG (Max. 5MB)</p>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {error && (
        <p className="text-xs text-red-600 font-medium flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
