import React from 'react';
import {
  LayoutGrid,
  Box,
  Tag,
  Megaphone,
  Settings,
  HelpCircle,
  FileText,
  ShieldAlert,
  LogOut,
  Globe,
  LogIn
} from 'lucide-react';

const Sidebar = ({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  onOpenAuth,
  onGoToLanding
}) => {
  const mainNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'inventory', label: 'Inventory', icon: Box },
    { id: 'pricing', label: 'Orders & Sales', icon: Tag },
    { id: 'marketing', label: 'Analytics', icon: Megaphone },
    { id: 'customers', label: 'Activity Logs', icon: FileText }
  ];

  // Admin item
  const isAdmin = user?.role === 'admin';

  return (
    <aside className="sidebar">
      <div>
        {/* Brand Header */}
        <div className="brand-section" style={{ cursor: 'pointer' }} onClick={onGoToLanding} title="Click to view Front Page">
          <div className="brand-logo">
            <span>AI</span>
          </div>
          <div className="brand-info">
            <h2>ShopAI</h2>
            <p>Intelligent Commerce</p>
          </div>
        </div>

        {/* View Front Page link */}
        <div style={{ marginBottom: '14px', paddingLeft: '8px' }}>
          <button
            type="button"
            className="btn-secondary"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 12px',
              fontSize: '12px',
              color: '#38bdf8',
              borderColor: 'rgba(56, 189, 248, 0.3)'
            }}
            onClick={onGoToLanding}
          >
            <Globe size={14} />
            <span>Front Page / Landing</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav>
          <ul className="nav-menu">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li
                  key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </li>
              );
            })}

            {/* Admin Panel Nav Item */}
            <li
              className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
              style={{
                backgroundColor: activeTab === 'admin' ? 'var(--primary)' : 'rgba(139, 92, 246, 0.08)',
                color: activeTab === 'admin' ? '#fff' : '#c084fc',
                marginTop: '6px'
              }}
            >
              <ShieldAlert size={18} />
              <span>Admin Panel</span>
              {isAdmin && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '10px',
                    backgroundColor: '#7c3aed',
                    color: '#fff',
                    padding: '1px 6px',
                    borderRadius: '4px'
                  }}
                >
                  PRO
                </span>
              )}
            </li>
          </ul>
        </nav>
      </div>

      {/* Footer Nav & User Profile Card */}
      <div>
        <ul className="sidebar-footer" style={{ marginBottom: '16px' }}>
          <li
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} />
            <span>Settings</span>
          </li>
          <li
            className={`nav-item ${activeTab === 'help' ? 'active' : ''}`}
            onClick={() => setActiveTab('help')}
          >
            <HelpCircle size={18} />
            <span>Help Guide</span>
          </li>
        </ul>

        {/* User Profile or Sign In Box */}
        {user ? (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#0c121e',
              border: '1px solid #1c263c',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                alt={user.name}
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ overflow: 'hidden' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </span>
                <span
                  style={{
                    fontSize: '10.5px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: user.role === 'admin' ? '#c084fc' : '#38bdf8',
                    fontWeight: 700
                  }}
                >
                  {user.role}
                </span>
              </div>
            </div>

            <button
              className="icon-btn delete"
              title="Sign Out"
              onClick={onLogout}
              style={{ width: '28px', height: '28px' }}
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '8px 12px', fontSize: '13px' }}
            onClick={() => onOpenAuth('login')}
          >
            <LogIn size={15} />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
