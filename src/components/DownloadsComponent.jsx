import React from "react";

const DownloadsComponent = ({ downloads, loading }) => {
  if (loading) {
    return (
      <div className="mt-6 p-4 bg-slate-800 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-emerald-400 border-t-transparent rounded-full"></div>
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
