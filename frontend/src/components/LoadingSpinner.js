const LoadingSpinner = ({ fullScreen = false, text = 'Memuat...' }) => {
  if (fullScreen) {
    return (
      <div className="loading-screen">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '16px' }}>
            Fit<span style={{ color: 'var(--color-secondary)' }}>Pred</span>
          </div>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{text}</p>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', gap: '12px' }}>
      <div className="spinner"></div>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{text}</p>
    </div>
  );
};
