import React from "react";

const DownloadsComponent = ({ downloads, loading }) => {
  if (loading) {
    return (
      <div className="mt-6 p-4 bg-slate-800 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
          <p className="text-slate-300">Loading downloads...</p>
        </div>
      </div>
    );
  }

  if (!downloads || (Array.isArray(downloads) && downloads.length === 0)) {
    return null;
  }

  if (typeof downloads === "string") {
    return (
      <div className="mt-6 bg-slate-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Downloads
          </h2>
        </div>
        <div className="p-4 bg-slate-700">
          <ul
            className="space-y-0"
            dangerouslySetInnerHTML={{ __html: downloads }}
          />
        </div>
      </div>
    );
  }

  if (Array.isArray(downloads)) {
    return (
      <div className="mt-6 bg-slate-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Downloads
          </h2>
        </div>
        <div className="p-4 bg-slate-700">
          <div className="space-y-2">
            {downloads.map((download, index) => (
              <a
                key={index}
                href={download.href}
                download
                className="flex items-center gap-3 p-3 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors group"
              >
                <svg
                  className="w-4 h-4 text-blue-400 group-hover:text-blue-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                  />
                </svg>
                <span className="text-slate-200 group-hover:text-white font-medium">
                  {download.text || `Download ${index + 1}`}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 bg-red-900 border border-red-700 rounded-lg">
      <p className="text-red-300">Invalid downloads format.</p>
    </div>
  );
};

export default DownloadsComponent;
