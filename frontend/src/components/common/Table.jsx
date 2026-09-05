import React from 'react';

const Table = ({ columns = [], data = [], onRowClick, emptyMessage = 'No records found' }) => {
  return (
    <div className="w-full overflow-x-auto border border-bordercolor rounded-lg bg-surface">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-hoverbg border-b border-bordercolor text-textsub font-semibold text-xs uppercase tracking-wider">
            {columns.map((col, idx) => (
              <th key={idx} className={`py-3.5 px-4 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-bordercolor">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-textsub text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rIdx) => (
              <tr
                key={row.id || rIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-hoverbg/80' : ''}`}
              >
                {columns.map((col, cIdx) => (
                  <td key={cIdx} className={`py-3.5 px-4 text-textmain ${col.className || ''}`}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
