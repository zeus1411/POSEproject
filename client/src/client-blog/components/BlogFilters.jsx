// BlogFilters.jsx
import React from 'react';

const BlogFilters = ({ categories, tags, filters, onChangeFilters, onClearFilters }) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <input
        type="text"
        value={filters.search}
        onChange={(e) => onChangeFilters({ ...filters, search: e.target.value, page: 1 })}
        placeholder="Search blogs..."
        className="border rounded px-3 py-1 w-full"
      />

      {/* Category */}
      <div>
        <label className="font-semibold mb-1 block">Category</label>
        <select
          value={filters.category}
          onChange={(e) => onChangeFilters({ ...filters, category: e.target.value, page: 1 })}
          className="border rounded px-3 py-1 w-full"
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="font-semibold mb-1 block">Tags</label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag._id}
              onClick={() => onChangeFilters({ ...filters, tag: tag._id, page: 1 })}
              className={`px-2 py-1 text-sm rounded-full border ${
                filters.tag === tag._id ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
            >
              {tag.name}
            </button>
          ))}
          {filters.tag && (
            <button
              onClick={() => onChangeFilters({ ...filters, tag: '', page: 1 })}
              className="px-2 py-1 text-sm rounded-full border bg-red-200 text-red-800"
            >
              Clear Tag
            </button>
          )}
        </div>
      </div>

      {/* Clear All */}
      {(filters.search || filters.category || filters.tag) && (
        <button
          onClick={onClearFilters}
          className="mt-2 px-3 py-1 text-sm rounded border bg-red-200 text-red-800"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
};

export default BlogFilters;