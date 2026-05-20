import { useEffect, useState } from 'react';
import { DollarSign, FileText, Plus, Receipt, User, CreditCard, CheckCircle } from 'lucide-react';
import api from '../../lib/axios';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import Pagination from '../../components/Pagination';
import type { LaravelPaginated } from '../../types/pagination';
import type { Guest } from '../guests/GuestsPage';

type InvoiceItem = {
  id: number;
  description: string;
  type: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

type Payment = {
  id: number;
  amount: number;
  method: string;
  status: string;
  transaction_reference: string | null;
  paid_at: string | null;
};

type Stay = {
  id: number;
  status: string;
  room?: {
    id: number;
    number: string;
  } | null;
};

type Invoice = {
  id: number;
  invoice_number: string;
  status: 'draft' | 'issued' | 'paid' | 'void';
  nights: number;
  room_charges: number;
  service_charges: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  issued_at: string | null;
  guest?: Guest | null;
  items?: InvoiceItem[];
  payments?: Payment[];
  stay?: Stay | null;
};

export default function BillingPage() {
  const [data, setData] = useState<LaravelPaginated<Invoice> | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Invoice detail modal state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Add service charge modal state
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    description: '',
    unit_price: '',
    quantity: '1',
    type: 'service',
  });
  const [serviceLoading, setServiceLoading] = useState(false);

  // Record payment modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'cash',
    transaction_reference: '',
  });
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Fetch invoices
  const fetchInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (status) params.set('status', status);
      const res = await api.get<LaravelPaginated<Invoice>>(`/api/v1/invoices?${params.toString()}`);
      setData(res.data);
    } catch {
      setError('Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, status]);

  // Load single invoice details (with items and payments relation loaded)
  const loadInvoiceDetails = async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await api.get<{ data: Invoice }>(`/api/v1/invoices/${id}`);
      setSelectedInvoice(res.data.data);
    } catch {
      alert('Failed to load invoice details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    loadInvoiceDetails(invoice.id);
    setDetailOpen(true);
  };

  // Issue Invoice
  const handleIssueInvoice = async (id: number) => {
    if (!confirm('Are you sure you want to finalize and issue this invoice? You won\'t be able to edit Room Charges after issuing.')) return;
    try {
      await api.post(`/api/v1/invoices/${id}/issue`);
      fetchInvoices();
      loadInvoiceDetails(id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to issue invoice.');
    }
  };

  // Add Service Charge
  const handleAddServiceCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setServiceLoading(true);
    try {
      await api.post(`/api/v1/invoices/${selectedInvoice.id}/services`, {
        description: serviceForm.description,
        unit_price: parseFloat(serviceForm.unit_price),
        quantity: parseInt(serviceForm.quantity) || 1,
        type: serviceForm.type,
      });
      setServiceModalOpen(false);
      // Reset form
      setServiceForm({
        description: '',
        unit_price: '',
        quantity: '1',
        type: 'service',
      });
      fetchInvoices();
      loadInvoiceDetails(selectedInvoice.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add service charge.');
    } finally {
      setServiceLoading(false);
    }
  };

  // Record Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setPaymentLoading(true);
    try {
      await api.post(`/api/v1/invoices/${selectedInvoice.id}/payments`, {
        amount: parseFloat(paymentForm.amount),
        method: paymentForm.method,
        transaction_reference: paymentForm.transaction_reference || null,
      });
      setPaymentModalOpen(false);
      // Reset form
      setPaymentForm({
        amount: '',
        method: 'cash',
        transaction_reference: '',
      });
      fetchInvoices();
      loadInvoiceDetails(selectedInvoice.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record payment.');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing & Invoices</h1>
          <p className="text-sm text-slate-500 mt-1">View billing details, record payments, and manage service charges for guests stays.</p>
        </div>
      </div>

      {error && <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">{error}</div>}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-sm">
          <span className="text-slate-500">Status</span>
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="bg-transparent font-medium text-slate-700 focus:outline-none"
          >
            <option value="">All Invoices</option>
            <option value="draft">Draft</option>
            <option value="issued">Issued</option>
            <option value="paid">Paid</option>
            <option value="void">Void</option>
          </select>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900">Invoice List</div>
          {data?.meta && (
            <div className="text-xs text-slate-500">
              Total <span className="font-medium text-slate-700">{data.meta.total}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading invoices...</div>
        ) : data?.data?.length ? (
          <div>
            <div className="hidden lg:block">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left font-medium px-5 py-3">Invoice #</th>
                    <th className="text-left font-medium px-5 py-3">Guest</th>
                    <th className="text-left font-medium px-5 py-3">Nights</th>
                    <th className="text-left font-medium px-5 py-3">Total Amount</th>
                    <th className="text-left font-medium px-5 py-3">Paid</th>
                    <th className="text-left font-medium px-5 py-3">Balance Due</th>
                    <th className="text-left font-medium px-5 py-3">Status</th>
                    <th className="text-right font-medium px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.data.map((inv) => {
                    const statusColors = {
                      draft: 'bg-slate-100 text-slate-700 border-slate-250',
                      issued: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                      paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      void: 'bg-rose-50 text-rose-700 border-rose-200',
                    }[inv.status];

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/60">
                        <td className="px-5 py-3 font-semibold text-slate-900 font-mono">{inv.invoice_number}</td>
                        <td className="px-5 py-3 font-semibold text-slate-900">{inv.guest?.full_name || '—'}</td>
                        <td className="px-5 py-3 text-slate-700">{inv.nights}</td>
                        <td className="px-5 py-3 font-semibold text-slate-900">${inv.total_amount}</td>
                        <td className="px-5 py-3 text-emerald-600 font-semibold">${inv.amount_paid}</td>
                        <td className={`px-5 py-3 font-semibold ${inv.balance_due > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                          ${inv.balance_due}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(inv)}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden divide-y divide-slate-100">
              {data.data.map((inv) => {
                const statusColors = {
                  draft: 'bg-slate-100 text-slate-700 border-slate-250',
                  issued: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  void: 'bg-rose-50 text-rose-700 border-rose-200',
                }[inv.status];

                return (
                  <div key={inv.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">Inv: {inv.invoice_number}</div>
                        <div className="text-xs text-slate-500 font-semibold mt-0.5">Guest: {inv.guest?.full_name || '—'}</div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors}`}>
                        {inv.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 grid grid-cols-3 gap-2">
                      <div>
                        <div className="text-slate-400">Total</div>
                        <div className="font-semibold text-slate-900">${inv.total_amount}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Paid</div>
                        <div className="font-semibold text-emerald-600">${inv.amount_paid}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Due</div>
                        <div className={`font-semibold ${inv.balance_due > 0 ? 'text-rose-600' : 'text-slate-500'}`}>${inv.balance_due}</div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(inv)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-5 py-4 border-t border-slate-200">
              <Pagination page={data.meta.current_page} lastPage={data.meta.last_page} onPageChange={setPage} />
            </div>
          </div>
        ) : (
          <div className="p-6 text-sm text-slate-500">No invoices found.</div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      <Modal
        open={detailOpen}
        title={selectedInvoice ? `Invoice Management: ${selectedInvoice.invoice_number}` : ''}
        onClose={() => setDetailOpen(false)}
      >
        {selectedInvoice && (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
            {detailLoading ? (
              <div className="p-6 text-center text-sm text-slate-500">Loading details...</div>
            ) : (
              <>
                {/* Guest & Stay Context */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Guest
                    </h3>
                    <div className="text-sm font-semibold text-slate-900">{selectedInvoice.guest?.full_name}</div>
                    <div className="text-xs text-slate-500">{selectedInvoice.guest?.email}</div>
                    <div className="text-xs text-slate-500">{selectedInvoice.guest?.phone}</div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5" /> Stay Details
                    </h3>
                    <div className="text-sm text-slate-700">
                      <div>Room: <span className="font-semibold text-slate-900">#{selectedInvoice.stay?.room?.number}</span></div>
                      <div>Nights: <span className="font-semibold text-slate-900">{selectedInvoice.nights}</span></div>
                      <div>Status: <span className="font-semibold text-slate-900 uppercase">{selectedInvoice.stay?.status}</span></div>
                    </div>
                  </div>
                </div>

                {/* Invoice Items Table */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Invoice Line Items
                  </h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                    <table className="min-w-full divide-y divide-slate-150">
                      <thead className="bg-slate-50 text-slate-600 font-medium">
                        <tr>
                          <th className="text-left px-3 py-2">Description</th>
                          <th className="text-left px-3 py-2">Type</th>
                          <th className="text-right px-3 py-2">Qty</th>
                          <th className="text-right px-3 py-2">Unit Price</th>
                          <th className="text-right px-3 py-2">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {selectedInvoice.items?.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2 font-medium text-slate-800">{item.description}</td>
                            <td className="px-3 py-2 text-slate-500 uppercase">{item.type}</td>
                            <td className="px-3 py-2 text-right text-slate-700">{item.quantity}</td>
                            <td className="px-3 py-2 text-right text-slate-700">${item.unit_price}</td>
                            <td className="px-3 py-2 text-right font-semibold text-slate-900">${item.total_price}</td>
                          </tr>
                        ))}
                        {(!selectedInvoice.items || selectedInvoice.items.length === 0) && (
                          <tr>
                            <td colSpan={5} className="px-3 py-4 text-center text-slate-400">No items found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payments Log */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" /> Payments Received
                  </h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                    <table className="min-w-full divide-y divide-slate-150">
                      <thead className="bg-slate-50 text-slate-600 font-medium">
                        <tr>
                          <th className="text-left px-3 py-2">Date</th>
                          <th className="text-left px-3 py-2">Method</th>
                          <th className="text-left px-3 py-2">Reference</th>
                          <th className="text-right px-3 py-2">Status</th>
                          <th className="text-right px-3 py-2">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {selectedInvoice.payments?.map((payment) => (
                          <tr key={payment.id} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2 text-slate-500">
                              {payment.paid_at ? new Date(payment.paid_at).toLocaleString() : '—'}
                            </td>
                            <td className="px-3 py-2 text-slate-700 uppercase font-medium">{payment.method}</td>
                            <td className="px-3 py-2 text-slate-600 font-mono">{payment.transaction_reference || '—'}</td>
                            <td className="px-3 py-2 text-right">
                              <span className="inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-150">
                                {payment.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-emerald-600">${payment.amount}</td>
                          </tr>
                        ))}
                        {(!selectedInvoice.payments || selectedInvoice.payments.length === 0) && (
                          <tr>
                            <td colSpan={5} className="px-3 py-4 text-center text-slate-400">No payments recorded.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Accounting Totals summary */}
                <div className="flex flex-col items-end gap-2 text-sm text-slate-600 pt-3 border-t border-slate-150">
                  <div className="w-64 space-y-1.5">
                    <div className="flex justify-between">
                      <span>Room Charges:</span>
                      <span className="font-medium text-slate-900">${selectedInvoice.room_charges}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Charges:</span>
                      <span className="font-medium text-slate-900">${selectedInvoice.service_charges}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax Amount:</span>
                      <span className="font-medium text-slate-900">${selectedInvoice.tax_amount}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1.5 text-base font-bold text-slate-900">
                      <span>Total Amount:</span>
                      <span>${selectedInvoice.total_amount}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Amount Paid:</span>
                      <span>${selectedInvoice.amount_paid}</span>
                    </div>
                    <div className={`flex justify-between border-t border-slate-200 pt-1.5 font-bold text-base ${
                      selectedInvoice.balance_due > 0 ? 'text-rose-600' : 'text-slate-500'
                    }`}>
                      <span>Balance Due:</span>
                      <span>${selectedInvoice.balance_due}</span>
                    </div>
                  </div>
                </div>

                {/* Top actions toolbar */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  {selectedInvoice.status === 'draft' && (
                    <button
                      type="button"
                      onClick={() => handleIssueInvoice(selectedInvoice.id)}
                      className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-semibold transition-all shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4" /> Issue Invoice
                    </button>
                  )}
                  {selectedInvoice.status !== 'void' && selectedInvoice.status !== 'paid' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setServiceModalOpen(true)}
                        className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-all"
                      >
                        <Plus className="w-4 h-4" /> Add Charge
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentModalOpen(true)}
                        className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold transition-all shadow-sm"
                      >
                        <DollarSign className="w-4 h-4" /> Record Payment
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setDetailOpen(false)}
                    className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-all"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Add Service Charge Modal */}
      <Modal
        open={serviceModalOpen}
        title="Add Service Charge"
        onClose={() => setServiceModalOpen(false)}
      >
        <form onSubmit={handleAddServiceCharge} className="space-y-4">
          <FormField label="Service Description">
            <input
              type="text"
              required
              placeholder="e.g. Room Service Dinner, Laundry, Airport Transfer"
              value={serviceForm.description}
              onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Unit Price ($)">
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                value={serviceForm.unit_price}
                onChange={(e) => setServiceForm({ ...serviceForm, unit_price: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
              />
            </FormField>
            <FormField label="Quantity">
              <input
                type="number"
                min="1"
                required
                value={serviceForm.quantity}
                onChange={(e) => setServiceForm({ ...serviceForm, quantity: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
              />
            </FormField>
          </div>

          <FormField label="Service Type">
            <select
              value={serviceForm.type}
              onChange={(e) => setServiceForm({ ...serviceForm, type: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
            >
              <option value="service">Service Charge</option>
              <option value="food">Food & Beverage</option>
              <option value="spa">Spa & Wellness</option>
              <option value="other">Other Charge</option>
            </select>
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setServiceModalOpen(false)}
              className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={serviceLoading}
              className="h-10 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold transition-all disabled:opacity-50"
            >
              {serviceLoading ? 'Adding...' : 'Add Charge'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        open={paymentModalOpen}
        title="Record Payment"
        onClose={() => setPaymentModalOpen(false)}
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <FormField label="Payment Amount ($)" hint={selectedInvoice ? `Max outstanding: $${selectedInvoice.balance_due}` : undefined}>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={selectedInvoice?.balance_due}
              required
              placeholder="0.00"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
            />
          </FormField>

          <FormField label="Payment Method">
            <select
              value={paymentForm.method}
              onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
            >
              <option value="cash">Cash</option>
              <option value="card">Credit / Debit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="other">Other Method</option>
            </select>
          </FormField>

          <FormField label="Transaction Reference (Optional)">
            <input
              type="text"
              placeholder="e.g. Card Authorization / TXN Code / Check #"
              value={paymentForm.transaction_reference}
              onChange={(e) => setPaymentForm({ ...paymentForm, transaction_reference: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-mono"
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPaymentModalOpen(false)}
              className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={paymentLoading}
              className="h-10 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold transition-all disabled:opacity-50"
            >
              {paymentLoading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
