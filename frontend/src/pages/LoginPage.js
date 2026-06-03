const LoginPage = ({ navigate }) => {
  const { login } = useAuth();
  const [form, setForm] = React.useState({ username: '', password: '' });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showPass, setShowPass] = React.useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.password) {
      setError('Username dan password wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Username atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ===== LEFT PANEL ===== */}
      <div className="auth-left">
        <div className="auth-left-brand">
          <div className="logo"><i className="fas fa-leaf" style={{ color: 'white' }}></i></div>
          <div className="name">FitPred</div>
        </div>
        <h2>Selamat Datang Kembali!</h2>
        <p>Lanjutkan perjalanan kesehatan Anda. Dapatkan rekomendasi diet personal dan lihat progres Anda.</p>
        <div className="auth-feature-list">
          {[
            { icon: 'fa-chart-line', text: 'Pantau riwayat kesehatan Anda' },
            { icon: 'fa-brain', text: 'Prediksi AI yang semakin akurat' },
            { icon: 'fa-utensils', text: 'Rekomendasi diet yang diperbarui' },
            { icon: 'fa-shield-heart', text: 'Data kesehatan Anda aman & terenkripsi' },
          ].map(f => (
            <div key={f.text} className="auth-feature-item">
              <div className="auth-feature-icon">
                <i className={`fas ${f.icon}`} style={{ color: 'white', fontSize: '0.9rem' }}></i>
              </div>
              <span className="auth-feature-text">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== RIGHT PANEL ===== */}
      <div className="auth-right">
        <h3 className="auth-form-title">Masuk ke Akun</h3>
        <p className="auth-form-subtitle">
          Belum punya akun?{' '}
          <span onClick={() => navigate('register')} style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}>
            Daftar di sini
          </span>
        </p>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            <i className="fas fa-circle-exclamation"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <i className="fas fa-user" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}></i>
              <input
                type="text" name="username" className="form-input"
                style={{ paddingLeft: 42 }}
                placeholder="Masukkan username Anda"
                value={form.username} onChange={handleChange}
                autoComplete="username" required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <i className="fas fa-lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}></i>
              <input
                type={showPass ? 'text' : 'password'} name="password" className="form-input"
                style={{ paddingLeft: 42, paddingRight: 46 }}
                placeholder="Masukkan password"
                value={form.password} onChange={handleChange}
                autoComplete="current-password" required
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4 }}>
                <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          {/* Tombol Masuk */}
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 8 }}>
            {loading
              ? <><div className="spinner spinner-sm"></div> Memproses...</>
              : <><i className="fas fa-right-to-bracket"></i> Masuk</>}
          </button>

          {/* Tombol Kembali — 1 saja, di bawah tombol Masuk */}
          <button type="button" className="btn btn-outline btn-full" onClick={() => navigate('landing')}
            style={{ marginTop: 12 }}>
            <i className="fas fa-arrow-left"></i> Kembali ke Beranda
          </button>
        </form>
      </div>
    </div>
  );
};
