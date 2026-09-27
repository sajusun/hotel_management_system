import React from 'react';

interface AuditLog {
  id: number;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

interface AuditTableProps {
  logs: AuditLog[];
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
}

const AuditTable: React.FC<AuditTableProps> = ({ logs, page, perPage, total, onPageChange }) => {
  const totalPages = Math.ceil(total / perPage) || 1;

  const handlePrev = () => {
    if (page > 1) onPageChange(page - 1);
  };
  const handleNext = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  return (
    <div>
      <table className="min-w-full border" role="grid" aria-label="Audit log table">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">User</th>
            <th className="p-2 text-left">Action</th>
            <th className="p-2 text-left">Target</th>
            <th className="p-2 text-left">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-t">
              <td className="p-2">{log.user}</td>
              <td className="p-2">{log.action}</td>
              <td className="p-2">{log.target}</td>
              <td className="p-2">{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          aria-label="Previous page"
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={page >= totalPages}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AuditTable;
