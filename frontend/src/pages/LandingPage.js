const LandingPage = ({ navigate }) => {
  const features = [
    { icon: 'fa-brain', color: '#9B7EA6', bg: '#F2EDF5', title: 'Prediksi AI', desc: 'Model AI canggih menganalisis 35 parameter kesehatan Anda dan memberikan rekomendasi diet personal.' },
    { icon: 'fa-utensils', color: '#E8A87C', bg: '#FDF2EA', title: 'Rencana Diet Personal', desc: 'Dapatkan rekomendasi pola makan yang disesuaikan dengan kondisi tubuh dan gaya hidup Anda.' },
    { icon: 'fa-chart-line', color: '#6B9AC4', bg: '#E8F0F8', title: 'Pantau Progres', desc: 'Lacak perkembangan rekomendasi diet Anda dari waktu ke waktu dengan visualisasi interaktif.' },
    { icon: 'fa-shield-heart', color: '#6BA68C', bg: '#E8F3EF', title: 'Deteksi Kondisi Kesehatan', desc: 'Identifikasi kondisi kesehatan yang relevan untuk rekomendasi diet yang lebih tepat.' },
    { icon: 'fa-history', color: '#D4A853', bg: '#FBF4E6', title: 'Riwayat & Progres', desc: 'Lacak semua riwayat prediksi diet Anda lengkap dengan distribusi probabilitas dan detail input kesehatan.' },
    { icon: 'fa-lock', color: '#5B8E7D', bg: '#E8F3F0', title: 'Data Aman', desc: 'Data kesehatan Anda tersimpan aman dengan enkripsi JWT dan bcrypt.' },
  ];

  const steps = [
    { n: '1', title: 'Buat Akun', desc: 'Daftarkan diri Anda dengan cepat menggunakan nama lengkap dan username.' },
    { n: '2', title: 'Input Data Kesehatan', desc: 'Masukkan 35 parameter kesehatan meliputi antropometri, gaya hidup, dan riwayat penyakit.' },
    { n: '3', title: 'Prediksi AI', desc: 'Model AI menganalisis data dan menghasilkan rekomendasi pola diet terbaik untuk Anda.' },
    { n: '4', title: 'Pantau & Tingkatkan', desc: 'Pantau riwayat prediksi dan terus perbarui data kesehatan Anda.' },
  ];

  return (
    <div>
      <section className="hero" id="beranda">
        <div className="container">
          <div className="hero-content">
            <div className="animate-fadeIn">
              <div className="hero-tag"><i className="fas fa-leaf"></i> Healthy Lives & Well-being</div>
              <h1 className="hero-title">
                <span className="highlight">FitPred</span> — Prediksi Pola Makan & Diet Berbasis AI
              </h1>
              <p className="hero-desc">
                Platform cerdas yang menganalisis 35 parameter kondisi tubuh Anda melalui pola diet dan gaya hidup untuk memberikan rekomendasi diet yang dipersonalisasi.
              </p>
              <div className="hero-actions">
                <button className="btn btn-primary btn-lg" onClick={() => navigate('register')}>
                  <i className="fas fa-rocket"></i> Mulai Sekarang — Gratis
                </button>
                <button className="btn btn-outline btn-lg" onClick={() => navigate('login')}>
                  <i className="fas fa-sign-in-alt"></i> Sudah Punya Akun
                </button>
              </div>
              <div className="hero-stats">
                {[
                  { value: '35', label: 'Parameter Kesehatan' },
                  { value: '99%', label: 'Akurasi Model AI' },
                  { value: '3', label: 'Kelas Prediksi Diet' },
                ].map(s => (
                  <div key={s.label} className="hero-stat-item">
                    <div className="value">{s.value}</div>
                    <div className="label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-card-main">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h4 style={{ fontSize: '1rem' }}>Hasil Prediksi Diet AI</h4>
                  <span className="badge badge-success"><i className="fas fa-circle" style={{ fontSize: 8 }}></i> AI Active</span>
                </div>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: 12 }}></div>
                  <div style={{ fontWeight: 700, fontSize: '1.3rem', color: 'var(--color-primary)', marginBottom: 4 }}>High-Protein Diet</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 16 }}>Rekomendasi berdasarkan 35 parameter</div>
                  <div style={{ background: 'var(--color-bg)', borderRadius: 10, padding: '10px 20px', display: 'inline-block' }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.2rem' }}>87.4%</span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginLeft: 6 }}>confidence</span>
                  </div>
                </div>
                <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'Balanced', value: '87.4%', color: 'var(--color-primary)', emoji: '' },
                    { label: 'High-Cal', value: '8.2%', color: 'var(--color-secondary)', emoji: '' },
                    { label: 'Low-Cal', value: '4.4%', color: 'var(--color-accent)', emoji: '' },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'var(--color-bg)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 2 }}>{item.emoji} {item.label}</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: item.color }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hero-card-float top-right">
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Rekomendasi</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginTop: 4 }}> High-Protein Diet</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>87.4% confidence</div>
              </div>
              <div className="hero-card-float bottom-left">
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>35 Fitur dianalisis</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <i className="fas fa-brain" style={{ color: 'var(--color-primary)', fontSize: '0.9rem' }}></i>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)' }}>Model Keras</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="fitur" style={{ background: 'var(--color-bg-card)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: 40 }}>
            <div className="hero-tag" style={{ margin: '0 auto 16px', display: 'inline-flex' }}>Fitur Unggulan</div>
            <h2>Semua yang Anda Butuhkan untuk Pola Diet Optimal</h2>
            <p style={{ maxWidth: 500, margin: '12px auto 0', color: 'var(--color-text-muted)' }}>
              Platform lengkap berbasis AI untuk memprediksi dan memantau pola diet terbaik Anda.
            </p>
          </div>
          <div className="grid-3">
            {features.map(f => (
              <div key={f.title} className="feature-card animate-fadeIn">
                <div className="feature-icon" style={{ background: f.bg }}>
                  <i className={`fas ${f.icon}`} style={{ color: f.color }}></i>
                </div>
                <h4 style={{ marginBottom: 8 }}>{f.title}</h4>
                <p style={{ fontSize: '0.9rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--color-bg)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: 48 }}>
            <div className="hero-tag" style={{ margin: '0 auto 16px', display: 'inline-flex' }}>Cara Kerja</div>
            <h2>Mulai dalam 4 Langkah Mudah</h2>
          </div>
          <div className="grid-4">
            {steps.map(s => (
              <div key={s.n} className="step-card">
                <div className="step-number">{s.n}</div>
                <h4 style={{ marginBottom: 8 }}>{s.title}</h4>
                <p style={{ fontSize: '0.9rem' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'white', marginBottom: 12 }}>Mulai Prediksi Diet Anda Hari Ini</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 480, margin: '0 auto 32px' }}>
            Daftarkan diri secara gratis dan dapatkan rekomendasi pola diet personal berbasis AI.
          </p>
          <button className="btn btn-lg" style={{ background: 'var(--color-secondary)', color: 'white' }} onClick={() => navigate('register')}>
            <i className="fas fa-leaf"></i> Mulai Sekarang — Gratis
          </button>
          <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: 12 }}>Dikembangkan oleh Tim Project Capstone</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
              {[
                { icon: 'fa-code', label: 'Fullstack Web Developer' },
                { icon: 'fa-robot', label: 'AI Engineer' },
                { icon: 'fa-chart-bar', label: 'Data Science' },
              ].map(t => (
                <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 999, padding: '6px 16px' }}>
                  <i className={`fas ${t.icon}`} style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}></i>
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem', fontWeight: 500 }}>{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
