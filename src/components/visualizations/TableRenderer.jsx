import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TableRenderer = ({ visualization, className = '' }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const componentTitle = visualization?.title || 'Table';
  const tableHeaders = visualization?.data?.headers || [];
  const rawRowsData = visualization?.data?.rows || [];

  const tableRows = useMemo(() => {
    if (!rawRowsData || rawRowsData.length === 0) {
      return [];
    }
    if (typeof rawRowsData[0] === 'object' && !Array.isArray(rawRowsData[0]) && rawRowsData[0] !== null) {
      return rawRowsData.map(rowObject => {
        if (typeof rowObject !== 'object' || rowObject === null) return [];
        return tableHeaders.map(headerKey => rowObject[headerKey] !== undefined ? rowObject[headerKey] : '');
      });
    }
    return rawRowsData.filter(r => Array.isArray(r));
  }, [rawRowsData, tableHeaders]);

  const filteredRows = useMemo(() => {
    if (!searchTerm) return tableRows;
    return tableRows.filter(row =>
      row.some(cell => 
        cell !== undefined && cell !== null && cell.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [tableRows, searchTerm]);

  const sortedRows = useMemo(() => {
    if (!sortConfig.key) return filteredRows;
    const columnIndex = tableHeaders.indexOf(sortConfig.key);
    if (columnIndex === -1) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      const aValue = a[columnIndex];
      const bValue = b[columnIndex];
      const aNum = parseFloat(aValue);
      const bNum = parseFloat(bValue);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }
      const aStr = aValue !== undefined && aValue !== null ? aValue.toString().toLowerCase() : '';
      const bStr = bValue !== undefined && bValue !== null ? bValue.toString().toLowerCase() : '';
      if (sortConfig.direction === 'asc') {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
      }
    });
  }, [filteredRows, sortConfig, tableHeaders]);

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedRows.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedRows, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedRows.length / itemsPerPage);

  if (!visualization || !visualization.data || !visualization.data.headers || !visualization.data.rows) {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-lg shadow border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading table data...</p>
        </div>
      </div>
    ); 
  }

  const handleSort = (header) => {
    setSortConfig(prevConfig => ({
      key: header,
      direction: prevConfig.key === header && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const exportToCSV = () => {
    const csvContent = [
      tableHeaders.join(','),
      ...sortedRows.map(row => row.map(cell => {
        const cellString = (typeof cell === 'object' && cell !== null) 
          ? Object.entries(cell).map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`).join('; ')
          : (cell !== undefined && cell !== null ? cell.toString() : '');
        return `"${cellString.replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${componentTitle || 'table'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-white rounded-lg shadow border border-gray-200 overflow-hidden ${className}`}>
      {/* Simple Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {componentTitle}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {sortedRows.length} rows {searchTerm && (
                  <span className="text-blue-600">
                    ({filteredRows.length} filtered)
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  showSearch || searchTerm
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {showSearch ? 'Hide Search' : 'Search'}
              </button>
              
              <button
                onClick={exportToCSV}
                className="px-4 py-2 rounded-md text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Export CSV
              </button>
            </div>
          </div>

          {/* Large Search Input */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search table data..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-3 text-base bg-white border-2 border-blue-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                    autoFocus
                  />
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setCurrentPage(1);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Clean Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              {tableHeaders.map((header, index) => (
                <th
                  key={index}
                  onClick={() => handleSort(header)}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span>{header}</span>
                    {sortConfig.key === header && (
                      <span className="text-blue-500 text-xs ml-2">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`transition-colors ${
                    rowIndex % 2 === 0 
                      ? 'bg-white hover:bg-blue-50' 
                      : 'bg-gray-50 hover:bg-blue-50'
                  }`}
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-4 py-3 text-sm text-gray-800"
                    >
                      <div className="max-w-xs">
                        {typeof cell === 'object' && cell !== null ? (
                          <div className="space-y-1">
                            {Object.entries(cell).map(([key, value]) => (
                              <div key={key} className="text-xs text-gray-600">
                                <span className="font-medium text-blue-600">{key}:</span> {value}
                              </div>
                            ))}
                          </div>
                        ) : cell === undefined || cell === null || cell === '' ? (
                          <span className="text-gray-400">—</span>
                        ) : (
                          <span className="break-words">{cell}</span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={tableHeaders.length} className="px-4 py-8 text-center text-sm text-gray-500">
                  <div className="flex flex-col items-center space-y-2">
                    <span>{searchTerm ? 'No matching results found' : 'No data available'}</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Simple Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-sm border border-gray-300 rounded px-2 py-1 bg-white text-gray-700"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-700">per page</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              
              <div className="flex space-x-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 text-gray-700"
                >
                  Previous
                </button>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 text-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableRenderer;
