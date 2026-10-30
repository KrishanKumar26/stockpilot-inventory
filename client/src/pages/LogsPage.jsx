import React from 'react';
import { Activity, Clock, ShieldAlert, CheckCircle, Info } from 'lucide-react';

const LogsPage = ({ logs }) => {
  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
      case 'warning':
        return {
          icon: <ShieldAlert size={14} />,
          badgeClass: 'low-stock'
        };
      case 'success':
        return {
          icon: <CheckCircle size={14} />,
          badgeClass: 'in-stock'
        };
      default:
        return {
          icon: <Info size={14} />,
          badgeClass: 'out-of-stock'
        };
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity Logs & Audit Trail</h1>
          <p style={{ color: '#8e9bb2', fontSize: '13px', marginTop: '4px' }}>
            Real-time audit log of all inventory events and alerts stored in MongoDB.
          </p>
        </div>
      </div>

      <div className="table-panel">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {logs.length === 0 ? (
            <p style={{ color: '#64748b', padding: '24px', textAlign: 'center' }}>
              No activity logs recorded yet.
            </p>
          ) : (
            logs.map((log) => {
              const { icon, badgeClass } = getSeverityBadge(log.severity);
              return (
                <div
                  key={log._id || log.id || Math.random()}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#0c121e',
                    border: '1px solid #1a2538'
                  }}
                >
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        color: log.severity === 'critical' ? '#ef4444' : '#60a5fa'
                      }}
                    >
                      <Activity size={18} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '14px' }}>
                          {log.title}
                        </span>
                        <span className={`status-badge ${badgeClass}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                          {log.category || 'Inventory'}
                        </span>
                      </div>
                      <p style={{ color: '#94a3b8', fontSize: '13px' }}>
                        {log.description}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '12px' }}>
                    <Clock size={13} />
                    <span>{new Date(log.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsPage;
