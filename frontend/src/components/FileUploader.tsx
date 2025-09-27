"use client";

import { useRef, useState } from "react";
import api from "@/lib/api";

type UploadResponse = {
  structure: any[];
  logicTree: any[];
};

type Props = {
  onUploaded: (response: UploadResponse, files: File[]) => void;
};

export default function FileUploader({ onUploaded }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));

    try {
      setLoading(true);
      setError(null);
      const res = await api.post<UploadResponse>("/upload", fd);
      onUploaded(res.data, files);
    } catch (err: any) {
      setError(err.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Select Files
        </button>
        <p className="mt-2 text-sm text-gray-600">
          {files.length > 0
            ? `${files.length} file(s) selected`
            : "or drag and drop files here"}
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Selected Files:</h3>
          <ul className="text-sm text-gray-700 max-h-40 overflow-y-auto border rounded p-2">
            {files.map((file, i) => (
              <li key={i} className="truncate">
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </li>
            ))}
          </ul>
          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload Files"}
          </button>
        </div>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}