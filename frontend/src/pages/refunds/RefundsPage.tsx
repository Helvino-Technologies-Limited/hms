import { useState, useCallback, useEffect } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { pharmacyApi, pharmacyRefundApi } from '../../api/services';
import { useAuthStore } from '../../store/authStore';
import type { PharmacyRefund, Prescription } from '../../types';

export default function RefundsPage() {
  const { userId } = useAuthStore();

  const [refunds, setRefunds] = useState<PharmacyRefund[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [dispensedRx, setDispensedRx] = useState<Prescription[]>([]);
  const [dispensedPage, setDispensedPage] = useState(0);
  const [dispensedTotalPages, setDispensedTotalPages] = useState(1);
  const [loadingDispensed, setLoadingDispensed] = useState(false);
  const [rxSearch, setRxSearch] = useState('');
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [refundForm, setRefundForm] = useState({ quantityReturned: 1, reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pharmacyRefundApi.getAll(page);
      setRefunds(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } catch { /* handled */ } finally { setLoading(false); }
  }, [page]);

  const fetchDispensedRx = useCallback(async () => {
    setLoadingDispensed(true);
    try {
      const res = await pharmacyApi.getDispensedRx(dispensedPage);
      setDispensedRx(res.data.data.content);
      setDispensedTotalPages(res.data.data.totalPages);
    } catch { /* handled */ } finally { setLoadingDispensed(false); }
  }, [dispensedPage]);

  useEffect(() => { fetchRefunds(); }, [fetchRefunds]);
  useEffect(() => { if (modalOpen) fetchDispensedRx(); }, [modalOpen, fetchDispensedRx]);

  const openModal = () => {
    setSelectedRx(null);
    setRefundForm({ quantityReturned: 1, reason: '' });
    setRxSearch('');
    setDispensedPage(0);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRx) return;
    setSubmitting(true);
    try {
      await pharmacyRefundApi.create({
        prescriptionId: selectedRx.id,
        quantityReturned: refundForm.quantityReturned,
        refundAmount: 0,
        reason: refundForm.reason,
        processedById: Number(userId || 0),
      });
      setModalOpen(false);
      setSelectedRx(null);
      fetchRefunds();
    } catch { /* handled */ } finally { setSubmitting(false); }
  };

  const refundColumns = [
    {
      key: 'patientName', label: 'Patient',
      render: (r: PharmacyRefund) => (
        <div>
          <div className="font-medium text-gray-900">{r.patientName || '—'}</div>
          <div className="text-xs text-gray-500">{r.patientNo || ''}</div>
        </div>
      ),
    },
    { key: 'drugName', label: 'Drug' },
    { key: 'quantityReturned', label: 'Qty Returned' },
    {
      key: 'refundAmount', label: 'Refund Amount',
      render: (r: PharmacyRefund) => `KES ${(r.refundAmount || 0).toLocaleString()}`,
    },
    { key: 'reason', label: 'Reason' },
    {
      key: 'status', label: 'Status',
      render: (r: PharmacyRefund) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          r.status === 'APPROVED' ? 'bg-green-100 text-green-800'
          : r.status === 'REJECTED' ? 'bg-red-100 text-red-800'
          : 'bg-yellow-100 text-yellow-800'
        }`}>
          {r.status || 'PENDING'}
        </span>
      ),
    },
    { key: 'processedByName', label: 'Processed By' },
    {
      key: 'createdAt', label: 'Date',
      render: (r: PharmacyRefund) => new Date(r.createdAt).toLocaleString(),
    },
  ];

  const dispensedColumns = [
    {
      key: 'patientName', label: 'Patient',
      render: (rx: Prescription) => (
        <div>
          <div className="font-medium text-gray-900">{rx.patientName || '—'}</div>
          <div className="text-xs text-gray-500">{rx.patientNo || ''}</div>
        </div>
      ),
    },
    { key: 'drugName', label: 'Drug' },
    { key: 'dosage', label: 'Dosage' },
    { key: 'quantityDispensed', label: 'Qty Dispensed' },
    {
      key: 'dispensedAt', label: 'Dispensed At',
      render: (rx: Prescription) => rx.dispensedAt ? new Date(rx.dispensedAt).toLocaleString() : '—',
    },
    {
      key: 'select', label: 'Select',
      render: (rx: Prescription) => (
        <button
          onClick={() => { setSelectedRx(rx); setRefundForm({ quantityReturned: 1, reason: '' }); }}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
            selectedRx?.id === rx.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
          }`}
        >
          {selectedRx?.id === rx.id ? 'Selected' : 'Select'}
        </button>
      ),
    },
  ];

  const filteredRx = dispensedRx.filter((rx) =>
    !rxSearch ||
    rx.patientName?.toLowerCase().includes(rxSearch.toLowerCase()) ||
    rx.drugName?.toLowerCase().includes(rxSearch.toLowerCase()) ||
    rx.patientNo?.toLowerCase().includes(rxSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Pharmacy Refunds</h1>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium"
        >
          <RotateCcw className="w-4 h-4" /> Process Refund
        </button>
      </div>

      <DataTable
        columns={refundColumns}
        data={refunds}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        loading={loading}
      />

      {/* Process Refund Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setSelectedRx(null); }} title="Process Drug Refund" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-500">Select a dispensed prescription, then fill in the refund details.</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Dispensed Prescriptions</label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={rxSearch}
                onChange={(e) => setRxSearch(e.target.value)}
                placeholder="Filter by patient name or drug..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="max-h-52 overflow-y-auto border border-gray-200 rounded-lg">
              <DataTable
                columns={dispensedColumns}
                data={filteredRx}
                page={dispensedPage}
                totalPages={dispensedTotalPages}
                onPageChange={setDispensedPage}
                loading={loadingDispensed}
              />
            </div>
          </div>

          {selectedRx && (
            <div className="bg-orange-50 rounded-lg p-3">
              <p className="text-sm font-semibold text-orange-900 mb-1">Selected: {selectedRx.drugName}</p>
              <p className="text-xs text-orange-700">Patient: {selectedRx.patientName} ({selectedRx.patientNo})</p>
              <p className="text-xs text-orange-700">
                Qty Dispensed: {selectedRx.quantityDispensed} | Dispensed: {selectedRx.dispensedAt ? new Date(selectedRx.dispensedAt).toLocaleDateString() : '—'}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Returned *</label>
              <input
                type="number"
                min={1}
                max={selectedRx?.quantityDispensed || 999}
                value={refundForm.quantityReturned}
                onChange={(e) => setRefundForm((p) => ({ ...p, quantityReturned: Number(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
              <select
                value={refundForm.reason}
                onChange={(e) => setRefundForm((p) => ({ ...p, reason: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">Select reason</option>
                <option value="Wrong drug dispensed">Wrong drug dispensed</option>
                <option value="Patient adverse reaction">Patient adverse reaction</option>
                <option value="Prescription cancelled">Prescription cancelled</option>
                <option value="Drug not required">Drug not required</option>
                <option value="Excess quantity">Excess quantity</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setModalOpen(false); setSelectedRx(null); }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedRx || !refundForm.reason}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {submitting ? 'Processing...' : 'Submit Refund'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
