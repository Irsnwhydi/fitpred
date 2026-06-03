const ProfilePage = ({ navigate }) => {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = React.useState('personal');
  const [editing, setEditing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [profile, setProfile] = React.useState(null);
  const [form, setForm] = React.useState({});
  const [pwForm, setPwForm] = React.useState({ current_password: '', new_password: '', confirm_password: '' });
  const [showPw, setShowPw] = React.useState({ current: false, new: false, confirm: false });
  const [msg, setMsg] = React.useState({ type: '', text: '' });
  const fileInputRef = React.useRef(null);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await ProfileAPI.get();
      const data = res.data.data;
      setProfile(data);
      setForm({ ...data });
    } catch {
      showMsg('error', 'Gagal memuat profil.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { loadProfile(); }, []);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = {
        full_name: form.full_name,
        date_of_birth: form.date_of_birth ? form.date_of_birth.split('T')[0] : null,
        gender: form.gender,
        phone: form.phone,
        address: form.address,
        city: form.city,
        country: form.country,
        bio: form.bio,
        height_cm: form.height_cm || null,
        weight_kg: form.weight_kg || null,
        activity_level: form.activity_level,
        dietary_preference: form.dietary_preference,
        health_goals: form.health_goals,
      };

      if (form.username && form.username !== profile.username) {
        await AuthAPI.changeUsername({ username: form.username.toLowerCase().trim() });
      }

      await ProfileAPI.update(updateData);
      await loadProfile();
      await updateUser({});
      setEditing(false);
      showMsg('success', 'Profil berhasil diperbarui!');
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Gagal memperbarui profil.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setForm({ ...profile });
    setEditing(false);
    setMsg({ type: '', text: '' });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      showMsg('error', 'Format tidak didukung. Gunakan JPG, PNG, atau WEBP.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      showMsg('error', 'Ukuran file terlalu besar. Maksimal 3MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX = 400;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h = (h * MAX) / w; w = MAX; } }
        else { if (h > MAX) { w = (w * MAX) / h; h = MAX; } }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        setProfile(p => ({ ...p, avatar_url: compressed }));
        setForm(p => ({ ...p, avatar_url: compressed }));
        try {
          await ProfileAPI.updateAvatar({ avatar_url: compressed });
          await updateUser({});
          showMsg('success', 'Foto profil berhasil diperbarui!');
        } catch {
          showMsg('error', 'Gagal menyimpan foto. Coba lagi.');
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveAvatar = async () => {
    setProfile(p => ({ ...p, avatar_url: null }));
    setForm(p => ({ ...p, avatar_url: null }));
    try {
      await ProfileAPI.updateAvatar({ avatar_url: null });
      await updateUser({});
      showMsg('success', 'Foto profil dihapus.');
    } catch {
      showMsg('error', 'Gagal menghapus foto.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm_password) {
      showMsg('error', 'Konfirmasi password tidak cocok.');
      return;
    }
    if (pwForm.new_password.length < 6) {
      showMsg('error', 'Password baru minimal 6 karakter.');
      return;
    }
    setSaving(true);
    try {
      await AuthAPI.changePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password });
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
      showMsg('success', 'Password berhasil diubah! Silakan login ulang jika diperlukan.');
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Gagal mengubah password. Pastikan password saat ini benar.');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const calcAge = (dob) => {
    if (!dob) return null;
    return Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const formatDate = (d) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const tabs = [
    { id: 'personal', icon: 'fa-user', label: 'Data Diri' },
    { id: 'health', icon: 'fa-heart-pulse', label: 'Kesehatan' },
    { id: 'lifestyle', icon: 'fa-leaf', label: 'Gaya Hidup' },
    { id: 'account', icon: 'fa-shield-halved', label: 'Akun' },
    { id: 'stats', icon: 'fa-chart-bar', label: 'Statistik' },
  ];

  const FieldView = ({ label, value, full }) => (
    <div className="profile-field" style={full ? { gridColumn: '1 / -1' } : {}}>
      <div className="profile-field-label">{label}</div>
      {value
        ? <div className="profile-field-value">{value}</div>
        : <div className="profile-field-empty">Belum diisi</div>}
    </div>
  );

  const SectionHeader = ({ title, icon, color }) => (
    <div className="profile-section-header">
      <h3><i className={`fas ${icon}`} style={{ marginRight: 8, color }}></i>{title}</h3>
      {!editing
        ? <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>
            <i className="fas fa-pen"></i> Edit
          </button>
        : <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={handleCancelEdit}>Batal</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? <div className="spinner spinner-sm"></div> : <><i className="fas fa-check"></i> Simpan</>}
            </button>
          </div>
      }
    </div>
  );

  const PwEyeBtn = ({ field }) => (
    <button type="button"
      onClick={() => setShowPw(p => ({ ...p, [field]: !p[field] }))}
      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4 }}>
      <i className={`fas ${showPw[field] ? 'fa-eye-slash' : 'fa-eye'}`}></i>
    </button>
  );

  if (loading) return <LoadingSpinner text="Memuat profil..." />;
  if (!profile) return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 60, textAlign: 'center' }}>
        <p>Gagal memuat profil.</p>
        <button className="btn btn-primary mt-md" onClick={loadProfile}>Coba Lagi</button>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        style={{ display: 'none' }} onChange={handleFileUpload} />

      <div className="page-header">
        <div className="container">
          <h2><i className="fas fa-user-circle" style={{ marginRight: 12 }}></i>Profil Saya</h2>
          <p>Kelola informasi pribadi dan preferensi kesehatan Anda</p>
        </div>
      </div>

      <div className="container">
        {msg.text && (
          <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`}
            style={{ marginTop: 20 }}>
            <i className={`fas ${msg.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            {msg.text}
          </div>
        )}

        <div className="profile-layout">
          <div className="profile-sidebar">
            <div className="profile-avatar-section">
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar">
                  {profile.avatar_url
                    ? <img src={profile.avatar_url} alt="Foto Profil" />
                    : getInitials(profile.full_name || profile.username)}
                </div>
                <div className="profile-avatar-edit"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  title="Ganti foto dari galeri" style={{ cursor: 'pointer' }}>
                  <i className="fas fa-camera"></i>
                </div>
              </div>

              <h4 style={{ marginBottom: 2, fontSize: '1.05rem' }}>{profile.full_name || profile.username}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>{profile.username}</p>
              <span className="badge badge-primary"><i className="fas fa-user"></i> Member</span>

              {profile.city && (
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 10 }}>
                  <i className="fas fa-map-marker-alt" style={{ marginRight: 4 }}></i>
                  {profile.city}{profile.country ? `, ${profile.country}` : ''}
                </p>
              )}
            </div>

            <div className="profile-sidebar-nav" style={{ marginTop: 12 }}>
              {tabs.map(t => (
                <div key={t.id}
                  className={`profile-nav-item ${activeTab === t.id ? 'active' : ''}`}
                  onClick={() => { setActiveTab(t.id); setEditing(false); }}>
                  <i className={`fas ${t.icon}`} style={{ width: 18, textAlign: 'center' }}></i>
                  {t.label}
                </div>
              ))}
              <div style={{ height: 1, background: 'var(--color-border-soft)', margin: '8px 0' }}></div>
              <div className="profile-nav-item" style={{ color: 'var(--color-danger)' }} onClick={logout}>
                <i className="fas fa-right-from-bracket" style={{ width: 18, textAlign: 'center' }}></i>
                Keluar
              </div>
            </div>
          </div>

          <div className="profile-main">
            {activeTab === 'personal' && (
              <div className="animate-fadeIn">
                <div className="profile-section-card">
                  <SectionHeader title="Data Diri" icon="fa-user" color="var(--color-primary)" />
                  {!editing ? (
                    <div className="profile-field-view">
                      <FieldView label="Nama Lengkap" value={profile.full_name} />
                      <FieldView label="Username" value={profile.username} />
                      <FieldView label="Jenis Kelamin"
                        value={profile.gender === 'Male' ? ' Laki-laki' : profile.gender === 'Female' ? ' Perempuan' : profile.gender} />
                      <FieldView label="Tanggal Lahir" value={formatDate(profile.date_of_birth)} />
                      <FieldView label="Usia" value={calcAge(profile.date_of_birth) ? `${calcAge(profile.date_of_birth)} tahun` : null} />
                      <FieldView label="No. Telepon" value={profile.phone} />
                      <FieldView label="Kota" value={profile.city} />
                      <FieldView label="Negara" value={profile.country} />
                      <FieldView label="Alamat" value={profile.address} full />
                      <FieldView label="Bio" value={profile.bio} full />
                    </div>
                  ) : (
                    <div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Nama Lengkap</label>
                          <input className="form-input" value={form.full_name || ''}
                            onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                            placeholder="Nama lengkap" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Username</label>
                          <input className="form-input" value={form.username || ''}
                            onChange={e => setForm(p => ({ ...p, username: e.target.value.toLowerCase().replace(/\s/g,'') }))}
                            placeholder="username" />
                          <div className="form-helper">Hanya huruf kecil, angka, dan underscore.</div>
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Jenis Kelamin</label>
                          <select className="form-select" value={form.gender || ''}
                            onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
                            <option value="">Pilih...</option>
                            <option value="Male"> Laki-laki</option>
                            <option value="Female"> Perempuan</option>
                            <option value="Other"> Lainnya</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Tanggal Lahir</label>
                          <input type="date" className="form-input"
                            value={form.date_of_birth ? form.date_of_birth.split('T')[0] : ''}
                            onChange={e => setForm(p => ({ ...p, date_of_birth: e.target.value }))} />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">No. Telepon</label>
                          <input className="form-input" value={form.phone || ''}
                            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+62..." />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Kota</label>
                          <input className="form-input" value={form.city || ''}
                            onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Jakarta" />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Negara</label>
                          <input className="form-input" value={form.country || ''}
                            onChange={e => setForm(p => ({ ...p, country: e.target.value }))} placeholder="Indonesia" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Alamat</label>
                          <input className="form-input" value={form.address || ''}
                            onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Alamat lengkap" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Bio</label>
                        <textarea className="form-input" rows="3" value={form.bio || ''}
                          onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                          placeholder="Ceritakan sedikit tentang diri Anda..."
                          style={{ resize: 'vertical' }}></textarea>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'health' && (
              <div className="animate-fadeIn">
                <div className="profile-section-card">
                  <SectionHeader title="Data Kesehatan" icon="fa-heart-pulse" color="var(--color-danger)" />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                    {[
                      { label: ' Tinggi', value: profile.height_cm ? `${profile.height_cm} cm` : '-', color: 'var(--color-primary)' },
                      { label: ' Berat', value: profile.weight_kg ? `${profile.weight_kg} kg` : '-', color: 'var(--color-secondary)' },
                    ].map(m => (
                      <div key={m.label} className="health-metric-card">
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>{m.label}</div>
                        <div className="metric-value" style={{ color: m.color }}>{m.value}</div>
                        {m.sub && <div style={{ fontSize: '0.75rem', color: m.color, fontWeight: 500 }}>{m.sub}</div>}
                      </div>
                    ))}
                  </div>
                  {!editing ? (
                    <div className="profile-field-view">
                      <FieldView label="Tinggi Badan" value={profile.height_cm ? `${profile.height_cm} cm` : null} />
                      <FieldView label="Berat Badan" value={profile.weight_kg ? `${profile.weight_kg} kg` : null} />
</div>
                  ) : (
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Tinggi Badan (cm)</label>
                        <input type="number" className="form-input" value={form.height_cm || ''}
                          onChange={e => setForm(p => ({ ...p, height_cm: e.target.value }))} placeholder="170" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Berat Badan (kg)</label>
                        <input type="number" className="form-input" value={form.weight_kg || ''}
                          onChange={e => setForm(p => ({ ...p, weight_kg: e.target.value }))} placeholder="65" />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Target Kesehatan</label>
                        <input className="form-input" value={form.health_goals || ''}
                          onChange={e => setForm(p => ({ ...p, health_goals: e.target.value }))}
                          placeholder="Contoh: Turun 5kg dalam 3 bulan" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'lifestyle' && (
              <div className="animate-fadeIn">
                <div className="profile-section-card">
                  <SectionHeader title="Gaya Hidup" icon="fa-leaf" color="var(--color-success)" />
                  {!editing ? (
                    <div className="profile-field-view">
                      <FieldView label="Level Aktivitas" value={profile.activity_level} />
                      <FieldView label="Preferensi Diet" value={profile.dietary_preference} />
                      <FieldView label="Target Kesehatan" value={profile.health_goals} full />
                    </div>
                  ) : (
                    <div>
                      <div className="form-group">
                        <label className="form-label">Level Aktivitas Fisik</label>
                        <select className="form-select" value={form.activity_level || ''}
                          onChange={e => setForm(p => ({ ...p, activity_level: e.target.value }))}>
                          <option value="">Pilih level aktivitas...</option>
                          <option value="Sedentary">Sedentary — Jarang bergerak</option>
                          <option value="Light">Light — Aktivitas ringan 1-3x/minggu</option>
                          <option value="Moderate">Moderate — Olahraga 3-5x/minggu</option>
                          <option value="Active">Active — Olahraga 6-7x/minggu</option>
                          <option value="Very Active">Very Active — Atlet / kerja fisik berat</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Preferensi Diet</label>
                        <select className="form-select" value={form.dietary_preference || ''}
                          onChange={e => setForm(p => ({ ...p, dietary_preference: e.target.value }))}>
                          <option value="">Pilih preferensi diet...</option>
                          <option value="Regular">Regular — Tidak ada pantangan</option>
                          <option value="Vegetarian">Vegetarian</option>
                          <option value="Vegan">Vegan</option>
                          <option value="Keto">Keto</option>
                          <option value="Pescatarian">Pescatarian</option>
                          <option value="Halal">Halal</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Target Kesehatan</label>
                        <textarea className="form-input" rows="3" value={form.health_goals || ''}
                          onChange={e => setForm(p => ({ ...p, health_goals: e.target.value }))}
                          placeholder="Contoh: Menurunkan berat badan 5kg..."
                          style={{ resize: 'vertical' }}></textarea>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="animate-fadeIn">
                <div className="profile-section-card">
                  <div className="profile-section-header">
                    <h3><i className="fas fa-camera" style={{ marginRight: 8, color: 'var(--color-secondary)' }}></i>Foto Profil</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                    <div style={{ flexShrink: 0 }}>
                      <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 700, overflow: 'hidden', border: '3px solid var(--color-primary-light)' }}>
                        {profile.avatar_url
                          ? <img src={profile.avatar_url} alt="Foto Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : getInitials(profile.full_name || profile.username)}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 14, lineHeight: 1.6 }}>
                        Pilih foto dari <strong>galeri atau album</strong> perangkat Anda.<br />
                        Format: JPG, PNG, WEBP — Maks 3MB
                      </p>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button className="btn btn-primary"
                          onClick={() => fileInputRef.current && fileInputRef.current.click()}>
                          <i className="fas fa-images"></i> Pilih dari Galeri
                        </button>
                        {profile.avatar_url && (
                          <button className="btn btn-outline btn-danger" onClick={handleRemoveAvatar}>
                            <i className="fas fa-trash"></i> Hapus Foto
                          </button>
                        )}
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 10 }}>
                        <i className="fas fa-info-circle" style={{ marginRight: 4 }}></i>
                        Di HP: sistem akan membuka galeri foto Anda secara otomatis.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="profile-section-card">
                  <div className="profile-section-header">
                    <h3><i className="fas fa-lock" style={{ marginRight: 8, color: 'var(--color-danger)' }}></i>Ubah Password</h3>
                  </div>
                  <form onSubmit={handleChangePassword}>
                    <div className="form-group">
                      <label className="form-label">Password Saat Ini</label>
                      <div style={{ position: 'relative' }}>
                        <input type={showPw.current ? 'text' : 'password'} className="form-input"
                          style={{ paddingRight: 44 }}
                          value={pwForm.current_password}
                          onChange={e => setPwForm(p => ({ ...p, current_password: e.target.value }))}
                          placeholder="Masukkan password saat ini" required autoComplete="current-password" />
                        <PwEyeBtn field="current" />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Password Baru</label>
                        <div style={{ position: 'relative' }}>
                          <input type={showPw.new ? 'text' : 'password'} className="form-input"
                            style={{ paddingRight: 44 }}
                            value={pwForm.new_password}
                            onChange={e => setPwForm(p => ({ ...p, new_password: e.target.value }))}
                            placeholder="Min. 6 karakter" required autoComplete="new-password" />
                          <PwEyeBtn field="new" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Konfirmasi Password Baru</label>
                        <div style={{ position: 'relative' }}>
                          <input type={showPw.confirm ? 'text' : 'password'} className="form-input"
                            style={{ paddingRight: 44 }}
                            value={pwForm.confirm_password}
                            onChange={e => setPwForm(p => ({ ...p, confirm_password: e.target.value }))}
                            placeholder="Ulangi password baru" required autoComplete="new-password" />
                          <PwEyeBtn field="confirm" />
                        </div>
                      </div>
                    </div>
                    {pwForm.new_password && pwForm.confirm_password && pwForm.new_password !== pwForm.confirm_password && (
                      <div className="form-error" style={{ marginBottom: 12 }}>Password tidak cocok</div>
                    )}
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? <div className="spinner spinner-sm"></div> : <><i className="fas fa-key"></i> Ubah Password</>}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="animate-fadeIn">
                <div className="profile-section-card">
                  <div className="profile-section-header">
                    <h3><i className="fas fa-chart-bar" style={{ marginRight: 8, color: 'var(--color-accent)' }}></i>Statistik Penggunaan</h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                    {[
                      { label: 'Total Pemeriksaan', value: profile.stats?.total_checks || 0, icon: 'fa-stethoscope', color: 'var(--color-primary)' },
                      { label: 'Total Prediksi AI', value: profile.stats?.total_predictions || 0, icon: 'fa-brain', color: 'var(--color-accent)' },
                      { label: 'Pemeriksaan Terakhir', value: profile.stats?.last_check ? new Date(profile.stats.last_check).toLocaleDateString('id-ID') : 'Belum ada', icon: 'fa-calendar', color: 'var(--color-secondary)' },
                    ].map(s => (
                      <div key={s.label} className="stat-card">
                        <div className="stat-icon" style={{ background: `${s.color}18` }}>
                          <i className={`fas ${s.icon}`} style={{ color: s.color }}></i>
                        </div>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 20, padding: '14px 16px', background: 'var(--color-primary-ultra-light)', borderRadius: 12 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Bergabung Sejak</div>
                    <div style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                      {new Date(profile.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
