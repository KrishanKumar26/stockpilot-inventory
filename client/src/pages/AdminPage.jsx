import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Server,
  Sliders,
  FileText,
  Trash2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Database
} from 'lucide-react';
import { api } from '../services/api';

const AdminPage = ({ currentUser, onNotification }) => {
  const [activeSubTab, setActiveSubTab] = useState('users'); // 'users' | 'health' | 'settings' | 'audit'
  const [users, setUsers] = useState([]);
  const [healthData, setHealthData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Settings form state
  const [settings, setSettings] = useState({
    defaultMinStockThreshold: 15,
    defaultReorderQuantity: 50,
    autoReorderEnabled: true,
    emailAlertsEnabled: true,
    smsAlertsEnabled: false,
    maintenanceMode: false
  });

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, healthRes, logsRes] = await Promise.all([
        api.getUsers(),
        api.getSystemHealth(),
        api.getLogs(50)
      ]);

      if (usersRes.success) setUsers(usersRes.data);
      if (healthRes.success) {
        setHealthData(healthRes.data);
        if (healthRes.data.settings) setSettings(healthRes.data.settings);
      }
      if (logsRes.success) {
        // filter auth and admin events
        setAuditLogs(logsRes.data);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.updateUserRole(userId, newRole);
      if (res.success) {
        onNotification(`Role updated to ${newRole}`);
        loadAdminData();
      } else {
        onNotification(res.message || 'Failed to update role');
      }
    } catch (err) {
      onNotification('Error updating user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const res = await api.deleteUser(userId);
        if (res.success) {
          onNotification('User deleted successfully');
          loadAdminData();
        } else {
          onNotification(res.message || 'Failed to delete user');
        }
      } catch (err) {
        onNotification('Error deleting user');
      }
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateGlobalSettings(settings);
      if (res.success) {
        onNotification('Global settings successfully updated!');
      } else {
        onNotification(res.message || 'Failed to save settings');
      }
    } catch (err) {
      onNotification('Error saving global settings');
    }
  };

  return (
    <div>
      {/* Admin Header */}
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                color: '#c084fc',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 700
              }}
            >
              ADMIN PANEL
            </span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Logged in as <strong>{currentUser?.name}</strong> ({currentUser?.role})
            </span>
          </div>
          <h1 className="page-title">Administrator Control Center</h1>
        </div>

        <button
          className="btn-secondary"
          onClick={loadAdminData}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
          Refresh Diagnostics
        </button>
      </div>

      {/* Admin Subtabs Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #1c263c', paddingBottom: '12px' }}>
        <button
          className={`btn-secondary ${activeSubTab === 'users' ? 'active-tab-btn' : ''}`}
          onClick={() => setActiveSubTab('users')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Users size={15} /> User Management ({users.length})
        </button>
        <button
          className={`btn-secondary ${activeSubTab === 'health' ? 'active-tab-btn' : ''}`}
          onClick={() => setActiveSubTab('health')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Server size={15} /> Infrastructure & Health
        </button>
        <button
          className={`btn-secondary ${activeSubTab === 'settings' ? 'active-tab-btn' : ''}`}
          onClick={() => setActiveSubTab('settings')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Sliders size={15} /> Global Policies
        </button>
        <button
          className={`btn-secondary ${activeSubTab === 'audit' ? 'active-tab-btn' : ''}`}
          onClick={() => setActiveSubTab('audit')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <FileText size={15} /> Security Audit Stream
        </button>
      </div>

      {/* 1. USER MANAGEMENT SUB-TAB */}
      {activeSubTab === 'users' && (
        <div className="table-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 className="widget-title" style={{ marginBottom: '2px' }}>Registered Team & System Users</h3>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                Role-Based Access Control (RBAC): Administrators, Managers, and Operations Staff.
              </p>
            </div>
          </div>

          <table className="custom-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="product-cell">
                      <img
                        src={u.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`}
                        alt={u.name}
                        className="product-thumb"
                        style={{ borderRadius: '50%' }}
                      />
                      <div>
                        <span className="product-name">{u.name}</span>
                        <span className="product-category-sub">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select
                      className="filter-select"
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                      value={u.role}
                      disabled={u.id === currentUser?.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="admin">Administrator</option>
                      <option value="manager">Manager</option>
                      <option value="staff">Staff</option>
                    </select>
                  </td>
                  <td>
                    <span className={`status-badge ${u.is_verified ? 'in-stock' : 'warning'}`} style={{ fontSize: '11.5px' }}>
                      <span className="status-dot"></span>
                      {u.is_verified ? 'Verified' : 'Pending OTP'}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: '#64748b', fontSize: '12px' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {u.id !== currentUser?.id && (
                      <button
                        className="icon-btn delete"
                        title="Delete User"
                        onClick={() => handleDeleteUser(u.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. INFRASTRUCTURE & HEALTH SUB-TAB */}
      {activeSubTab === 'health' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {/* PostgreSQL Card */}
            <div className="widget-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                  <Database size={20} />
                </div>
                <div>
                  <h4 style={{ color: '#fff', fontSize: '15px' }}>PostgreSQL 17</h4>
                  <span className="status-badge in-stock" style={{ fontSize: '11px', padding: '1px 6px' }}>
                    <span className="status-dot"></span> Healthy
                  </span>
                </div>
              </div>
              <ul style={{ listStyle: 'none', fontSize: '13px', color: '#8e9bb2', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Products: <strong>{healthData?.database?.postgresql?.metrics?.total_products || 6}</strong></li>
                <li>Purchase Orders: <strong>{healthData?.database?.postgresql?.metrics?.total_pos || 3}</strong></li>
                <li>Customer Orders: <strong>{healthData?.database?.postgresql?.metrics?.total_orders || 4}</strong></li>
                <li>Database: <code>stockpilot_db</code> (Port 5432)</li>
              </ul>
            </div>

            {/* MongoDB Card */}
            <div className="widget-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  <Server size={20} />
                </div>
                <div>
                  <h4 style={{ color: '#fff', fontSize: '15px' }}>MongoDB 9</h4>
                  <span className="status-badge in-stock" style={{ fontSize: '11px', padding: '1px 6px' }}>
                    <span className="status-dot"></span> Connected
                  </span>
                </div>
              </div>
              <ul style={{ listStyle: 'none', fontSize: '13px', color: '#8e9bb2', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Total Activity Logs: <strong>{healthData?.database?.mongodb?.totalLogs || 15}</strong></li>
                <li>Collection: <code>activitylogs</code></li>
                <li>Storage: <code>stockpilot_logs</code></li>
                <li>Port: 27017</li>
              </ul>
            </div>

            {/* Server Runtime Card */}
            <div className="widget-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#c084fc' }}>
                  <Cpu size={20} />
                </div>
                <div>
                  <h4 style={{ color: '#fff', fontSize: '15px' }}>Express Server</h4>
                  <span className="status-badge in-stock" style={{ fontSize: '11px', padding: '1px 6px' }}>
                    <span className="status-dot"></span> Port 5002
                  </span>
                </div>
              </div>
              <ul style={{ listStyle: 'none', fontSize: '13px', color: '#8e9bb2', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Uptime: <strong>{healthData?.server?.uptime || 'Online'}</strong></li>
                <li>Node Version: <strong>{healthData?.server?.nodeVersion || 'v24.x'}</strong></li>
                <li>Memory Heap: <strong>{healthData?.server?.memoryHeapUsedMB} MB</strong></li>
                <li>Environment: <strong>development</strong></li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 3. GLOBAL SETTINGS SUB-TAB */}
      {activeSubTab === 'settings' && (
        <div className="table-panel" style={{ maxWidth: '640px' }}>
          <h3 className="widget-title">Global Inventory Policies</h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
            System-wide defaults applied automatically to new product additions and replenishment pipelines.
          </p>

          <form onSubmit={handleSaveSettings}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Default Minimum Safety Threshold (Units)</label>
                <input
                  type="number"
                  className="form-input"
                  value={settings.defaultMinStockThreshold}
                  onChange={(e) => setSettings({ ...settings, defaultMinStockThreshold: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Default Auto-Reorder Quantity (Units)</label>
                <input
                  type="number"
                  className="form-input"
                  value={settings.defaultReorderQuantity}
                  onChange={(e) => setSettings({ ...settings, defaultReorderQuantity: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '20px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#fff', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.autoReorderEnabled}
                  onChange={(e) => setSettings({ ...settings, autoReorderEnabled: e.target.checked })}
                />
                <span>Enable Autonomous AI Reorder PO Generation</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#fff', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.emailAlertsEnabled}
                  onChange={(e) => setSettings({ ...settings, emailAlertsEnabled: e.target.checked })}
                />
                <span>Email Notifications for Low Stock & Out of Stock Alerts</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#fff', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                />
                <span style={{ color: settings.maintenanceMode ? '#f87171' : '#fff' }}>
                  Maintenance Mode (Read-only for Non-Admin Staff)
                </span>
              </label>
            </div>

            <button type="submit" className="btn-primary">
              Save Global Policies
            </button>
          </form>
        </div>
      )}

      {/* 4. SECURITY AUDIT STREAM SUB-TAB */}
      {activeSubTab === 'audit' && (
        <div className="table-panel">
          <h3 className="widget-title">Security & Audit Event Stream</h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
            MongoDB audit records tracing authentication, privilege elevations, and system modifications.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {auditLogs.map((log) => (
              <div
                key={log._id || Math.random()}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: '#0c121e',
                  border: '1px solid #1a2538',
                  borderRadius: '6px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '13px' }}>{log.title}</span>
                    <span className="status-badge in-stock" style={{ fontSize: '10px', padding: '1px 6px' }}>
                      {log.action}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#8e9bb2' }}>{log.description}</span>
                </div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
