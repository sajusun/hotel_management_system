import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { getAuditLogs } from '../../api/audit';
import AuditTable from '../../components/AuditTable';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Types
interface AuditLog {
  id: number;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await getAuditLogs({ page, per_page: perPage, search });
      setLogs(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, perPage, search]);

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPerPage(Number(e.target.value));
    setPage(1);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Audit Log</h1>
      <div className="flex items-center mb-4">
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-2 py-1 mr-4"
          aria-label="Search audit logs"
        />
        <label htmlFor="perPage" className="mr-2">Rows per page:</label>
        <select id="perPage" value={perPage} onChange={handlePerPageChange} className="border rounded p-1">
          {[10, 25, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <Skeleton height={400} count={1} />
      ) : (
        <AuditTable
          logs={logs}
          page={page}
          perPage={perPage}
          total={total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
