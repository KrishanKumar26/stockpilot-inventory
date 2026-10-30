import React from 'react';
import { FileText, Truck, CheckCircle2 } from 'lucide-react';

const AutomatedReorderPipeline = ({ purchaseOrders, onAdvanceStatus }) => {
  const getIconAndClass = (status) => {
    switch (status) {
      case 'Sent':
        return {
          icon: <FileText size={16} />,
          boxClass: 'sent'
        };
      case 'In Transit':
        return {
          icon: <Truck size={16} />,
          boxClass: 'transit'
        };
      case 'Delivered':
        return {
          icon: <CheckCircle2 size={16} />,
          boxClass: 'delivered'
        };
      default:
        return {
          icon: <FileText size={16} />,
          boxClass: 'sent'
        };
    }
  };

  return (
    <div className="widget-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 className="widget-title" style={{ marginBottom: 0 }}>Automated Reorder Pipeline</h3>
      </div>

      <div className="pipeline-list">
        {purchaseOrders.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#64748b' }}>No active purchase orders.</p>
        ) : (
          purchaseOrders.map((po) => {
            const { icon, boxClass } = getIconAndClass(po.status);
            return (
              <div key={po.id} className="pipeline-item">
                <div
                  className={`pipeline-icon-box ${boxClass}`}
                  title={`Status: ${po.status}. Click to change status.`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onAdvanceStatus && onAdvanceStatus(po)}
                >
                  {icon}
                </div>
                <div className="pipeline-info" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="pipeline-po">
                      {po.po_number} {po.status}
                    </span>
                    {po.status !== 'Delivered' && onAdvanceStatus && (
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#3b82f6',
                          fontSize: '11px',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                        onClick={() => onAdvanceStatus(po)}
                      >
                        {po.status === 'Sent' ? 'Mark In Transit' : 'Mark Delivered'}
                      </button>
                    )}
                  </div>
                  <span className="pipeline-sub">
                    {po.supplier ? `Supplier: ${po.supplier}` : po.eta_days}
                  </span>
                  {po.supplier && po.eta_days && (
                    <span className="pipeline-sub" style={{ color: '#475569', fontSize: '11px' }}>
                      {po.eta_days} • Qty: {po.quantity}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AutomatedReorderPipeline;
