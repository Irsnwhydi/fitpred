const Footer = ({ navigate }) => (
  <footer className="footer">
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24, marginBottom: 40 }}>
        <div style={{ maxWidth: 340 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-leaf" style={{ color: 'white', fontSize: '1.1rem' }}></i>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
              Fit<span style={{ color: "var(--color-secondary-light)" }}>Pred</span>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.7 }}>
            Platform prediksi pola makan dan diet berbasis AI untuk hidup lebih sehat.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: 16 }}>
            Capstone Project — Healthy Lives & Well-being
          </p>
        </div>

        <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>Navigasi</div>
            <ul style={{ listStyle: 'none' }}>
              {[
                { label: 'Beranda', page: 'landing' },
                { label: 'Dashboard', page: 'dashboard' },
                { label: 'Cek Kesehatan', page: 'predict' },
                { label: 'Riwayat', page: 'history' },
              ].map(item => (
                <li key={item.label} style={{ marginBottom: 10 }}>
                  <span onClick={() => navigate(item.page)}
                    style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = 'var(--color-secondary-light)'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.65)'}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>Akun</div>
            <ul style={{ listStyle: 'none' }}>
              {[
                { label: 'Daftar', page: 'register' },
                { label: 'Masuk', page: 'login' },
                { label: 'Profil', page: 'profile' },
                      ].map(item => (
                <li key={item.label} style={{ marginBottom: 10 }}>
                  <span onClick={() => navigate(item.page)}
                    style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = 'var(--color-secondary-light)'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.65)'}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div style={{ paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', margin: 0 }}>
          © {new Date().getFullYear()} FitPred. Capstone Project — Healthy Lives & Well-being.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', margin: 0 }}>
          Dikembangkan oleh Tim Fullstack Web Developer, AI Engineer & Data Science
        </p>
      </div>
    </div>
  </footer>
);
