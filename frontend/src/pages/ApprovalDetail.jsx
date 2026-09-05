import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useData } from '../context/DataContext';
import { approvalApi } from '../services/api';
import { toast } from 'react-toastify';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import CustomerContact from '../components/common/CustomerContact';
import ApprovalChain from '../components/special/ApprovalChain';
import AuditTrail from '../components/special/AuditTrail';
import BlendedRiskScore from '../components/special/BlendedRiskScore';

const ApprovalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { approvals } = useData();
  const fallbackApproval = approvals.find(a => a.id === id || a.quoteId === id) || approvals[0];
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    approvalApi.getDetails(id)
      .then(({ data }) => setDetails(data))
      .catch(() => toast.error('Unable to load approval details'))
      .finally(() => setLoading(false));
  }, [id]);

  const approval = details ? {
    ...fallbackApproval,
    id,
    quoteId: details.quote.quote_number || details.quote.id,
    customer: details.quote.customer_name,
    customerEmail: details.quote.customer_email,
    customerPhone: details.quote.customer_phone,
    approvalSteps: details.approvals,
    auditTrail: details.auditTrail,
    status: details.quote.status === 'pending_approval' ? 'pending' : details.quote.status,
  } : fallbackApproval;

  const [modalType, setModalType] = useState(null); // 'return' | 'reject' | null
  const [reasonInput, setReasonInput] = useState('');

  const handleApprove = async () => {
    try {
      const response = await approvalApi.approve(approval.id, 'Approved from approval workspace');
      toast.success(response.data.message || 'Approval submitted');
      navigate('/approvals');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Approval could not be submitted');
    }
  };

  const handleConfirmReturn = async () => {
    try {
      const response = await approvalApi.returnForRevision(approval.id, reasonInput || 'Needs business justification');
      toast.success(response.data.message || 'Quotation returned for revision');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Return request could not be submitted');
    }
    setModalType(null);
    navigate('/approvals');
  };

  const handleConfirmReject = async () => {
    try {
      const response = await approvalApi.reject(approval.id, reasonInput || 'Policy non-compliant');
      toast.success(response.data.message || 'Quotation rejected');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Rejection could not be submitted');
    }
    setModalType(null);
    navigate('/approvals');
  };

  if (loading) return <Layout><div className="p-6 text-sm text-textsub">Loading approval details...</div></Layout>;

  return (
    <Layout>
      {/* Back & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-bordercolor shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/approvals')}>
            Back to Approvals
          </Button>
          <div className="h-4 w-px bg-bordercolor"></div>
          <div>
            <h1 className="text-base font-bold text-textmain flex items-center gap-2">
              Approval Request: <span className="text-accent">{approval.quoteId}</span>
            </h1>
            <div className="flex items-center gap-3 mt-0.5">
              <CustomerContact 
                name={approval.customer} 
                email={approval.customerEmail} 
                phone={approval.customerPhone} 
              />
              <span className="text-xs text-textsub">• Gold Tier Account</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {approval.status === 'pending' && (
          <div className="flex items-center gap-2">
            <Button variant="danger" size="sm" icon={XCircle} onClick={() => setModalType('reject')}>
              Reject
            </Button>
            <Button variant="outline" size="sm" icon={RotateCcw} onClick={() => setModalType('return')}>
              Return for Revision
            </Button>
            <Button variant="success" size="sm" icon={CheckCircle} onClick={handleApprove}>
              Approve
            </Button>
          </div>
        )}
      </div>

      {/* Risk Overview Card */}
      <BlendedRiskScore
        risk={approval.blendedRisk}
        reason={approval.worstLine}
        violations={approval.violations}
      />

      {/* WHY THIS WAS FLAGGED Section */}
      <Card title="Why This Deal Was Flagged For Governance Review">
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-hoverbg border-b border-bordercolor text-textsub uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Line Product</th>
                  <th className="py-2.5 px-3 text-center">Discount Given</th>
                  <th className="py-2.5 px-3 text-center">Limit Allowed</th>
                  <th className="py-2.5 px-3 text-center">Policy Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bordercolor">
                {approval.violations && approval.violations.length > 0 ? (
                  approval.violations.map((v, i) => (
                    <tr key={i} className="hover:bg-hoverbg/40">
                      <td className="py-3 px-3 font-semibold text-textmain">{v.line}</td>
                      <td className="py-3 px-3 text-center font-bold text-rose-600">{v.discount}%</td>
                      <td className="py-3 px-3 text-center font-medium text-textsub">{v.limit}%</td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">
                          ✗ ({v.overLimit}% over limit)
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-textsub">
                      All line items are within allowable pricing thresholds.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
            <p className="font-bold text-amber-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Worst Single Line Violation: <span className="font-semibold text-amber-800">{approval.worstLine}</span>
            </p>
            <p className="text-amber-800">
              Overall Margin Impact: <span className="font-semibold">{approval.overallPattern}</span>
            </p>
          </div>
        </div>
      </Card>

      {/* APPROVAL CHAIN */}
      <ApprovalChain steps={approval.approvalSteps} />

      {/* AUDIT TRAIL */}
      <AuditTrail trail={approval.auditTrail} />

      {/* Return Modal */}
      <Modal
        isOpen={modalType === 'return'}
        onClose={() => setModalType(null)}
        title="Return Quotation for Revision"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalType(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleConfirmReturn}>Submit Return Note</Button>
          </>
        }
      >
        <p className="text-xs text-textsub mb-3">Provide feedback to sales rep on what needs modification:</p>
        <textarea
          rows="4"
          value={reasonInput}
          onChange={(e) => setReasonInput(e.target.value)}
          placeholder="e.g. Need justification for 19% service discount..."
          className="w-full text-xs text-textmain border border-bordercolor rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
        ></textarea>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={modalType === 'reject'}
        onClose={() => setModalType(null)}
        title="Reject Quotation"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalType(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleConfirmReject}>Confirm Rejection</Button>
          </>
        }
      >
        <p className="text-xs text-textsub mb-3">Please state the policy reason for rejecting this proposal:</p>
        <textarea
          rows="4"
          value={reasonInput}
          onChange={(e) => setReasonInput(e.target.value)}
          placeholder="e.g. Margin breach violates Q3 financial risk guidelines..."
          className="w-full text-xs text-textmain border border-bordercolor rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
        ></textarea>
      </Modal>
    </Layout>
  );
};

export default ApprovalDetail;
