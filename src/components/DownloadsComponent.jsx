import React from "react";

const DownloadsComponent = ({ downloads, loading }) => {
  if (loading) {
    return <p className="text-gray-500 italic">Loading downloads...</p>;
  }

  if (!downloads || (Array.isArray(downloads) && downloads.length === 0)) {
    return <p className="text-gray-500">No downloads available.</p>;
  }

  if (typeof downloads === "string") {
    return (
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Downloads</h2>
        <div dangerouslySetInnerHTML={{ __html: downloads }} />
      </div>
    );
  }

  if (Array.isArray(downloads)) {
    return (
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Downloads</h2>
        <ul>
          {downloads.map((download, index) => (
            <li key={index} className="mb-1">
              <a
                href={download.href}
                download
                className="text-blue-500 hover:underline"
              >
                {download.text || `Download ${index + 1}`}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return <p className="text-red-500">Invalid downloads format.</p>;
};

export default DownloadsComponent;
