const { useState, useEffect, useRef } = React;

const Navbar = ({ currentPage, navigate }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const scrollToFeatures = () => {
    if (currentPage !== 'landing') {
      navigate('landing');
      setTimeout(() => {
        const el = document.getElementById('fitur');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      const el = document.getElementById('fitur');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    if (currentPage !== 'landing') {
      navigate('landing');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navLinks = user
    ? [
        { label: 'Dashboard', page: 'dashboard', icon: 'fa-chart-pie', onClick: () => navigate('dashboard') },
        { label: 'Prediksi', page: 'predict', icon: 'fa-stethoscope', onClick: () => navigate('predict') },
        { label: 'Riwayat', page: 'history', icon: 'fa-clock-rotate-left', onClick: () => navigate('history') },
      ]
    : [
        { label: 'Beranda', page: 'landing', icon: 'fa-house', onClick: scrollToTop },
        { label: 'Fitur', page: 'fitur', icon: 'fa-star', onClick: scrollToFeatures },
      ];

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand" onClick={() => navigate(user ? 'dashboard' : 'landing')}>
            <div className="navbar-logo"><i className="fas fa-leaf"></i></div>
            <div className="navbar-brand-name">Fit<span>Pred</span></div>
          </div>

          <div className="navbar-nav">
            {navLinks.map(link => (
              <div key={link.label}
                className={`nav-link ${currentPage === link.page ? 'active' : ''}`}
                onClick={link.onClick}>
                {link.label}
              </div>
            ))}
          </div>

          <div className="navbar-actions">
            {user ? (
              <div className="dropdown" ref={dropdownRef}>
                <div className="navbar-user" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <div className="navbar-avatar">
                    {user.avatar_url
                      ? <img src={user.avatar_url} alt={user.username} />
                      : getInitials(user.full_name || user.username)}
                  </div>
                  <span className="navbar-user-name">{user.full_name || user.username}</span>
                  <i className={`fas fa-chevron-${dropdownOpen ? 'up' : 'down'}`} style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}></i>
                </div>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-soft)' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{user.full_name || user.username}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{user.email}</div>
                    </div>
                    <div className="dropdown-item" onClick={() => { navigate('profile'); setDropdownOpen(false); }}>
                      <i className="fas fa-user"></i> Profil Saya
                    </div>
                    <div className="dropdown-item" onClick={() => { navigate('predict'); setDropdownOpen(false); }}>
                      <i className="fas fa-stethoscope"></i> Cek Kesehatan
                    </div>
                    <div className="dropdown-item" onClick={() => { navigate('history'); setDropdownOpen(false); }}>
                      <i className="fas fa-clock-rotate-left"></i> Riwayat
                    </div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item danger" onClick={() => { logout(); setDropdownOpen(false); }}>
                      <i className="fas fa-right-from-bracket"></i> Keluar
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('login')}>Masuk</button>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('register')}>Daftar</button>
              </>
            )}
            <div className="navbar-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
              <i className={`fas ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        {navLinks.map(link => (
          <div key={link.label} className={`nav-link ${currentPage === link.page ? 'active' : ''}`}
            onClick={() => { link.onClick(); setMobileOpen(false); }}>
            <i className={`fas ${link.icon}`}></i> {link.label}
          </div>
        ))}
        {user ? (
          <>
            <div className="nav-link" onClick={() => { navigate('profile'); setMobileOpen(false); }}>
              <i className="fas fa-user"></i> Profil
            </div>
            <div className="nav-link" style={{ color: 'var(--color-danger)' }} onClick={() => { logout(); setMobileOpen(false); }}>
              <i className="fas fa-right-from-bracket"></i> Keluar
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="btn btn-outline btn-full" onClick={() => { navigate('login'); setMobileOpen(false); }}>Masuk</button>
            <button className="btn btn-primary btn-full" onClick={() => { navigate('register'); setMobileOpen(false); }}>Daftar</button>
          </div>
        )}
      </div>
    </>
  );
};
