const DIET_LABELS = {
  0: 'High-Protein Diet',
  1: 'Low-Carb Diet',
  2: 'Low-Fat Diet',
};

const HistoryDetailModal = ({ item, onClose, navigate }) => {
  if (!item) return null;
  const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h4>Detail Prediksi</h4>
          <div className="modal-close" onClick={onClose}><i className="fas fa-xmark"></i></div>
        </div>
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ background: 'var(--color-primary-ultra-light)', borderRadius: 14, padding: '20px', marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-primary-dark)', marginBottom: 6 }}>
              {item.recommended_meal_plan || '-'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Confidence: {item.confidence_score ? `${parseFloat(item.confidence_score).toFixed(1)}%` : '-'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Usia', val: item.age ? `${item.age} tahun` : '-' },
              { label: 'Tinggi / Berat', val: `${item.height_cm || '-'}cm / ${item.weight_kg || '-'}kg` },
              { label: 'Tekanan Darah', val: item.blood_pressure_systolic ? `${item.blood_pressure_systolic}/${item.blood_pressure_diastolic} mmHg` : '-' },
              { label: 'Gula Darah', val: item.blood_sugar_level ? `${item.blood_sugar_level} mg/dL` : '-' },
              { label: 'Kolesterol', val: item.cholesterol_level ? `${item.cholesterol_level} mg/dL` : '-' },
              { label: 'Langkah/hari', val: item.daily_steps ? parseInt(item.daily_steps).toLocaleString() : '-' },
              { label: 'Tidur', val: item.sleep_hours ? `${item.sleep_hours} jam` : '-' },
              { label: 'Olahraga', val: item.exercise_frequency !== null ? `${item.exercise_frequency}x/minggu` : '-' },
            ].map(f => (
              <div key={f.label} style={{ background: 'var(--color-bg)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{f.label}</div>
                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>{f.val}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'right', marginTop: 8 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{formatDate(item.recorded_at)}</span>
          </div>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>Tutup</button>
          <button className="btn btn-primary" onClick={() => { onClose(); navigate('predict'); }}>
            <i className="fas fa-plus"></i> Prediksi Baru
          </button>
        </div>
      </div>
    </div>
  );
};

const HistoryPage = ({ navigate }) => {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [pagination, setPagination] = React.useState({});
  const [selected, setSelected] = React.useState(null);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await HealthAPI.getHistory({ page: p, limit: 8 });
      setData(res.data.data);
      setPagination(res.data.pagination);
    } catch (e) {
      console.error('History load error:', e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(page); }, [page]);

  const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2><i className="fas fa-clock-rotate-left" style={{ marginRight: 12 }}></i>Riwayat Prediksi</h2>
              <p>Pantau hasil prediksi pola diet Anda dari waktu ke waktu</p>
            </div>
            <button className="btn" style={{ background: 'white', color: 'var(--color-primary)' }} onClick={() => navigate('predict')}>
              <i className="fas fa-plus"></i> Prediksi Baru
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
        {loading ? (
          <LoadingSpinner text="Memuat riwayat..." />
        ) : data.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon"><i className="fas fa-clipboard-list"></i></div>
              <h4>Belum Ada Riwayat</h4>
              <p>Anda belum melakukan prediksi diet. Mulai sekarang!</p>
              <button className="btn btn-primary mt-md" onClick={() => navigate('predict')}>
                <i className="fas fa-stethoscope"></i> Mulai Prediksi
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
              <div className="card-sm" style={{ flex: 1, minWidth: 120, textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{pagination.total || 0}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Total Prediksi</div>
              </div>
              <div className="card-sm" style={{ flex: 1, minWidth: 120, textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-secondary)' }}>{data[0]?.recommended_meal_plan || '-'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Diet Terakhir</div>
              </div>
              <div className="card-sm" style={{ flex: 1, minWidth: 120, textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-success)' }}>
                  {data[0]?.confidence_score ? `${parseFloat(data[0].confidence_score).toFixed(0)}%` : '-'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Confidence Terakhir</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.map((item, i) => (
                <div
                  key={item.id}
                  className="history-card animate-fadeIn"
                  style={{ animationDelay: `${i * 0.05}s`, cursor: 'pointer' }}
                  onClick={() => setSelected(item)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                      {formatDate(item.recorded_at)}
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>
                      {item.age} tahun &bull; {item.height_cm}cm &bull; {item.weight_kg}kg
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {item.recommended_meal_plan && (
                        <span className="badge badge-primary">{item.recommended_meal_plan}</span>
                      )}
                      {item.dietary_habits_vegan && <span className="badge badge-success">Vegan</span>}
                      {item.dietary_habits_vegetarian && <span className="badge badge-secondary">Vegetarian</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Confidence</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {item.confidence_score ? `${parseFloat(item.confidence_score).toFixed(0)}%` : '-'}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                      <div>Tidur: {item.sleep_hours}h</div>
                      <div>Olahraga: {item.exercise_frequency}x</div>
                    </div>
                  </div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', alignSelf: 'center' }}>
                    <i className="fas fa-chevron-right"></i>
                  </div>
                </div>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
                <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <i className="fas fa-chevron-left"></i>
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-outline'}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="btn btn-outline btn-sm" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selected && (
        <HistoryDetailModal
          item={selected}
          onClose={() => setSelected(null)}
          navigate={navigate}
        />
      )}
    </div>
  );
};
