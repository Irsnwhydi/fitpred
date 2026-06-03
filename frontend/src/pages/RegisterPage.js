const RegisterPage = ({ navigate }) => {
  const { register } = useAuth();
  const [form, setForm] = React.useState({
    full_name: '', username: '', password: '', confirmPassword: '',
    gender: '', date_of_birth: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showPass, setShowPass] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [step, setStep] = React.useState(1);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const validateStep1 = () => {
    if (!form.full_name.trim()) return 'Nama lengkap wajib diisi.';
    if (!form.username.trim()) return 'Username wajib diisi.';
    if (form.username.length < 3) return 'Username minimal 3 karakter.';
    if (/\s/.test(form.username)) return 'Username tidak boleh mengandung spasi.';
    if (!form.password) return 'Password wajib diisi.';
    if (form.password.length < 6) return 'Password minimal 6 karakter.';
    if (form.password !== form.confirmPassword) return 'Konfirmasi password tidak cocok.';
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        full_name: form.full_name.trim(),
        username: form.username.trim().toLowerCase(),
        password: form.password,
        gender: form.gender,
        date_of_birth: form.date_of_birth,
      });
      navigate('dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9!@#$%]/.test(pw)) s++;
    return s;
  };
  const strength = pwStrength(form.password);
  const strengthColor = ['', '#C97070', '#D4A853', '#D4A853', '#6BA68C'][strength] || '';
  const strengthLabel = ['', 'Lemah', 'Cukup', 'Baik', 'Kuat'][strength] || '';

  const ProgressBar = () => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {['Akun', 'Profil'].map((s, i) => (
          <React.Fragment key={s}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step > i + 1 ? 'var(--color-primary)' : step === i + 1 ? 'var(--color-primary)' : 'var(--color-border)',
                color: step >= i + 1 ? 'white' : 'var(--color-text-muted)',
                fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.3s',
                boxShadow: step === i + 1 ? '0 4px 14px rgba(91,142,125,0.4)' : 'none'
              }}>
                {step > i + 1 ? <i className="fas fa-check" style={{ fontSize: '0.85rem' }}></i> : i + 1}
              </div>
              <span style={{ fontSize: '0.72rem', marginTop: 5, color: step === i + 1 ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: step === i + 1 ? 600 : 400 }}>{s}</span>
            </div>
            {i < 1 && (
              <div style={{ flex: 1, height: 2, margin: '0 10px', marginBottom: 18, background: step > 1 ? 'var(--color-primary)' : 'var(--color-border)', transition: 'background 0.3s' }}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      {/* ===== LEFT PANEL ===== */}
      <div className="auth-left">
        <div className="auth-left-brand">
          <div className="logo"><i className="fas fa-leaf" style={{ color: 'white' }}></i></div>
          <div className="name">FitPred</div>
        </div>
        <h2>Mulai Perjalanan Sehat Anda</h2>
        <p>Buat akun gratis dan dapatkan akses ke fitur prediksi kesehatan berbasis AI secara lengkap.</p>
        <div className="auth-feature-list">
          {[
            { icon: 'fa-robot', text: 'Analisis AI dengan 41+ parameter kesehatan' },
            { icon: 'fa-chart-line', text: 'Rekomendasi diet personal dari model ML' },
            { icon: 'fa-chart-area', text: 'Dashboard analitik dengan Streamlit terintegrasi' },
            { icon: 'fa-lock', text: 'Data Anda aman dengan enkripsi JWT & bcrypt' },
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
      <div className="auth-right" style={{ maxWidth: 520 }}>
        <h3 className="auth-form-title">Buat Akun Baru</h3>
        <p className="auth-form-subtitle">
          Sudah punya akun?{' '}
          <span onClick={() => navigate('login')} style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}>
            Masuk di sini
          </span>
        </p>

        <ProgressBar />

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            <i className="fas fa-circle-exclamation"></i> {error}
          </div>
        )}

        {/* ===== STEP 1: Akun ===== */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <div className="form-group">
              <label className="form-label">Nama Lengkap <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-id-card" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}></i>
                <input type="text" name="full_name" className="form-input" style={{ paddingLeft: 42 }}
                  placeholder="Contoh: Budi Santoso"
                  value={form.full_name} onChange={handleChange} autoComplete="name" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Username <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-at" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}></i>
                <input type="text" name="username" className="form-input" style={{ paddingLeft: 42 }}
                  placeholder="Contoh: budi_santoso (min. 3 karakter)"
                  value={form.username} onChange={handleChange} autoComplete="username" required />
              </div>
              <div className="form-helper">Hanya huruf, angka, dan underscore. Tanpa spasi.</div>
            </div>

            <div className="form-group">
              <label className="form-label">Password <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}></i>
                <input type={showPass ? 'text' : 'password'} name="password" className="form-input"
                  style={{ paddingLeft: 42, paddingRight: 46 }}
                  placeholder="Min. 6 karakter"
                  value={form.password} onChange={handleChange} autoComplete="new-password" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4 }}>
                  <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {form.password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Kekuatan Password</span>
                    <span style={{ fontSize: '0.75rem', color: strengthColor, fontWeight: 600 }}>{strengthLabel}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: strength >= i ? strengthColor : 'var(--color-border)', transition: 'background 0.3s' }}></div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Konfirmasi Password <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-lock-open" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}></i>
                <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" className="form-input"
                  style={{ paddingLeft: 42, paddingRight: 46 }}
                  placeholder="Ulangi password"
                  value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4 }}>
                  <i className={`fas ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <div className="form-error">Password tidak cocok</div>
              )}
              {form.confirmPassword && form.password === form.confirmPassword && form.confirmPassword.length >= 6 && (
                <div style={{ fontSize: '0.78rem', color: 'var(--color-success)', marginTop: 4 }}>
                  <i className="fas fa-check"></i> Password cocok
                </div>
              )}
            </div>

            {/* Tombol Lanjut */}
            <button type="button" className="btn btn-primary btn-full btn-lg" onClick={handleNext}>
              Lanjut <i className="fas fa-arrow-right"></i>
            </button>

            {/* Tombol Kembali — 1 saja, di bawah Lanjut */}
            <button type="button" className="btn btn-outline btn-full" onClick={() => navigate('landing')}
              style={{ marginTop: 12 }}>
              <i className="fas fa-arrow-left"></i> Kembali ke Beranda
            </button>
          </div>
        )}

        {/* ===== STEP 2: Profil ===== */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="animate-fadeIn">
            {/* Ringkasan akun */}
            <div style={{ background: 'var(--color-primary-ultra-light)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.1rem', fontFamily: 'var(--font-display)', flexShrink: 0 }}>
                {form.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--color-primary-dark)', fontSize: '0.95rem' }}>{form.full_name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>@{form.username}</div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Jenis Kelamin</label>
                <select name="gender" className="form-select" value={form.gender} onChange={handleChange}>
                  <option value="">Pilih...</option>
                  <option value="Male"> Laki-laki</option>
                  <option value="Female"> Perempuan</option>
                  <option value="Other"> Lainnya</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tanggal Lahir</label>
                <input type="date" name="date_of_birth" className="form-input"
                  value={form.date_of_birth} onChange={handleChange} />
              </div>
            </div>

            <div className="alert alert-info" style={{ marginBottom: 20 }}>
              <i className="fas fa-circle-info"></i>
              <span>Data kesehatan lengkap dapat dilengkapi di halaman Profil setelah login.</span>
            </div>

            {/* Tombol Selesai & Daftar */}
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading
                ? <><div className="spinner spinner-sm"></div> Mendaftar...</>
                : <><i className="fas fa-check"></i> Selesai & Daftar</>}
            </button>

            {/* Tombol Kembali — 1 saja, di bawah Daftar */}
            <button type="button" className="btn btn-outline btn-full" onClick={() => setStep(1)}
              style={{ marginTop: 12 }}>
              <i className="fas fa-arrow-left"></i> Kembali ke Langkah Sebelumnya
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
