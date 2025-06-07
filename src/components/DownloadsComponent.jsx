const DownloadsComponent = ({ downloads, loading }) => {
  return (
    <div className="mt-6 bg-stone-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-stone-700">
        <h2 className="text-xl font-semibold text-stone-200 flex items-center gap-2">
          Downloads
        </h2>
      </div>
      <div className="p-4 bg-stone-700">
        {loading ? (
          <div className="p-4 rounded-lg bg-stone-800">
            <p className="text-stone-400">Loading downloads...</p>
          </div>
        ) : downloads ? (
          <ul
            className="space-y-2 md:space-y-3"
            dangerouslySetInnerHTML={{ __html: downloads }}
          />
        ) : (
          <div className="p-4 rounded-lg bg-stone-600">
            <p className="text-stone-300">No downloads available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadsComponent;
