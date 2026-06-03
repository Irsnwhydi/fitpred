const DashboardPage = ({ navigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const chartConfRef = React.useRef(null);
  const chartStepsRef = React.useRef(null);
  const chartNutriRef = React.useRef(null);
  const chartInstances = React.useRef({});

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await HealthAPI.getDashboardStats();
        setStats(res.data.data);
      } catch {
        setStats({ stats: { total_checks: 0, last_check: null }, recent: [], meal_plan_distribution: [] });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  React.useEffect(() => {
    if (!stats || !stats.recent?.length) return;
    const recent = [...stats.recent].reverse();

    const destroy = (key) => { if (chartInstances.current[key]) { chartInstances.current[key].destroy(); delete chartInstances.current[key]; } };

    if (chartConfRef.current) {
      destroy('conf');
      chartInstances.current['conf'] = new Chart(chartConfRef.current.getContext('2d'), {
        type: 'line',
        data: {
          labels: recent.map(r => new Date(r.recorded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })),
          datasets: [{
            label: 'Confidence (%)',
            data: recent.map(r => parseFloat(r.confidence_score) || 0),
            borderColor: '#5B8E7D',
            backgroundColor: 'rgba(91,142,125,0.15)',
            tension: 0.4, fill: true,
            pointBackgroundColor: '#5B8E7D', pointRadius: 5,
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 0, max: 100, grid: { color: '#EAF0EC' }, ticks: { color: '#8A9E96' } },
            x: { grid: { display: false }, ticks: { color: '#8A9E96' } }
          }
        }
      });
    }

    if (chartStepsRef.current) {
      destroy('steps');
      chartInstances.current['steps'] = new Chart(chartStepsRef.current.getContext('2d'), {
        type: 'bar',
        data: {
          labels: recent.map(r => new Date(r.recorded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })),
          datasets: [
            {
              label: 'Langkah/hari',
              data: recent.map(r => parseInt(r.daily_steps) || 0),
              backgroundColor: 'rgba(107,154,196,0.75)',
              borderRadius: 4,
              yAxisID: 'y',
            },
            {
              label: 'Tidur (jam)',
              data: recent.map(r => parseFloat(r.sleep_hours) || 0),
              backgroundColor: 'rgba(155,126,166,0.75)',
              borderRadius: 4,
              yAxisID: 'y1',
            }
          ]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'top', labels: { font: { family: 'DM Sans' }, color: '#5A6B64', padding: 12 } } },
          scales: {
            y: { type: 'linear', position: 'left', grid: { color: '#EAF0EC' }, ticks: { color: '#8A9E96' }, title: { display: true, text: 'Langkah', color: '#8A9E96' } },
            y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#8A9E96' }, title: { display: true, text: 'Jam Tidur', color: '#8A9E96' } },
            x: { grid: { display: false }, ticks: { color: '#8A9E96' } }
          }
        }
      });
    }

    if (chartNutriRef.current) {
      destroy('nutri');
      const latest = recent[recent.length - 1];
      if (latest && (latest.caloric_intake || latest.protein_intake || latest.carbohydrate_intake || latest.fat_intake)) {
        chartInstances.current['nutri'] = new Chart(chartNutriRef.current.getContext('2d'), {
          type: 'radar',
          data: {
            labels: ['Kalori', 'Protein', 'Karbohidrat', 'Lemak', 'Olahraga', 'Tidur'],
            datasets: [{
              label: 'Profil Nutrisi & Gaya Hidup',
              data: [
                Math.min((parseFloat(latest.caloric_intake) / 3000) * 100, 100),
                Math.min((parseFloat(latest.protein_intake) / 150) * 100, 100),
                Math.min((parseFloat(latest.carbohydrate_intake) / 350) * 100, 100),
                Math.min((parseFloat(latest.fat_intake) / 100) * 100, 100),
                Math.min((parseFloat(latest.exercise_frequency) / 7) * 100, 100),
                Math.min((parseFloat(latest.sleep_hours) / 10) * 100, 100),
              ],
              backgroundColor: 'rgba(91,142,125,0.2)',
              borderColor: '#5B8E7D',
              pointBackgroundColor: '#5B8E7D',
              pointRadius: 4,
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              r: {
                min: 0, max: 100,
                grid: { color: '#EAF0EC' },
                pointLabels: { color: '#5A6B64', font: { family: 'DM Sans', size: 11 } },
                ticks: { display: false }
              }
            }
          }
        });
      }
    }

    return () => { Object.values(chartInstances.current).forEach(c => c.destroy()); chartInstances.current = {}; };
  }, [stats]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Selamat Pagi';
    if (h < 17) return 'Selamat Siang';
    return 'Selamat Malam';
  };

  const mealEmoji = { 'High-Protein Diet': '', 'Low-Carb Diet': '', 'Low-Fat Diet': '', 'Low-Fat Diet': '' };

  if (loading) return <LoadingSpinner text="Memuat dashboard..." />;

  const s = stats?.stats;
  const recent = stats?.recent || [];
  const latest = recent[0];
  const mealDist = stats?.meal_plan_distribution || [];

  return (
    <div className="page-wrapper">
      <div className="dashboard-header">
        <div className="container">
          <div className="dashboard-welcome">
            <div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: 4 }}>{getGreeting()}, </p>
              <h2>{user?.full_name || user?.username}</h2>
              <p>Pantau hasil prediksi pola diet Anda</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn" style={{ background: 'white', color: 'var(--color-primary)' }}
                onClick={() => navigate('predict')}>
                <i className="fas fa-stethoscope"></i> Prediksi Diet
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-stats-grid">
          {[
            { icon: 'fa-chart-simple', bg: 'var(--color-primary-ultra-light)', iconColor: 'var(--color-primary)', value: s?.total_checks || 0, label: 'Total Prediksi', sub: 'kali' },
            { icon: 'fa-utensils', bg: 'rgba(232,168,124,0.15)', iconColor: 'var(--color-secondary)', value: latest?.recommended_meal_plan ? (mealEmoji[latest.recommended_meal_plan] + ' ' + latest.recommended_meal_plan) : '-', label: 'Diet Terakhir' },
            { icon: 'fa-bullseye', bg: 'rgba(107,166,140,0.1)', iconColor: 'var(--color-success)', value: latest?.confidence_score ? `${parseFloat(latest.confidence_score).toFixed(0)}%` : '-', label: 'Confidence Terakhir' },
            { icon: 'fa-shoe-prints', bg: 'rgba(107,154,196,0.1)', iconColor: 'var(--color-info)', value: latest?.daily_steps ? parseInt(latest.daily_steps).toLocaleString() : '-', label: 'Langkah Terakhir', sub: 'langkah/hari' },
          ].map((card, i) => (
            <div key={i} className="stat-card animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="stat-icon" style={{ background: card.bg }}>
                <i className={`fas ${card.icon}`} style={{ color: card.iconColor }}></i>
              </div>
              <div className="stat-value" style={{ fontSize: typeof card.value === 'string' && card.value.length > 10 ? '0.95rem' : '1.75rem', lineHeight: 1.2 }}>{card.value}</div>
              <div className="stat-label">{card.label}</div>
              {card.sub && <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: 4, fontWeight: 500 }}>{card.sub}</div>}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 32 }}>
          <div className="card">
            <h4 style={{ marginBottom: 16 }}> Tren Confidence Score</h4>
            {recent.length > 0
              ? <canvas ref={chartConfRef} style={{ maxHeight: 220 }}></canvas>
              : <div className="empty-state" style={{ padding: '24px 0' }}><div className="empty-state-icon"><i className="fas fa-chart-line"></i></div><p>Belum ada data</p><button className="btn btn-primary btn-sm mt-md" onClick={() => navigate('predict')}>Mulai Prediksi</button></div>}
          </div>

          <div className="card">
            <h4 style={{ marginBottom: 16 }}> Langkah & Jam Tidur</h4>
            {recent.length > 0
              ? <canvas ref={chartStepsRef} style={{ maxHeight: 220 }}></canvas>
              : <div className="empty-state" style={{ padding: '24px 0' }}><div className="empty-state-icon"><i className="fas fa-shoe-prints"></i></div><p>Belum ada data</p></div>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
          <div className="card">
            <h4 style={{ marginBottom: 16 }}> Radar Profil Nutrisi & Gaya Hidup</h4>
            {latest && (latest.caloric_intake || latest.sleep_hours)
              ? <div style={{ maxWidth: 300, margin: '0 auto' }}><canvas ref={chartNutriRef}></canvas></div>
              : <div className="empty-state" style={{ padding: '24px 0' }}><div className="empty-state-icon"><i className="fas fa-circle-nodes"></i></div><p>Belum ada data</p></div>}
          </div>

          <div className="card">
            <h4 style={{ marginBottom: 16 }}> Distribusi Rekomendasi Diet</h4>
            {mealDist.length > 0 ? (
              <div>
                {mealDist.map((m, i) => {
                  const total = mealDist.reduce((sum, x) => sum + parseInt(x.count), 0);
                  const pct = total > 0 ? ((parseInt(m.count) / total) * 100).toFixed(0) : 0;
                  const colors = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-accent)', 'var(--color-info)'];
                  return (
                    <div key={m.recommended_meal_plan} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{mealEmoji[m.recommended_meal_plan] || ''}</span>
                          <span>{m.recommended_meal_plan}</span>
                        </span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colors[i % colors.length] }}>{m.count}x ({pct}%)</span>
                      </div>
                      <div style={{ height: 8, background: 'var(--color-border-soft)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: colors[i % colors.length], borderRadius: 4, transition: 'width 0.8s ease' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <div className="empty-state-icon"><i className="fas fa-utensils"></i></div>
                <p>Belum ada data distribusi</p>
                <button className="btn btn-primary btn-sm mt-md" onClick={() => navigate('predict')}>Mulai Prediksi</button>
              </div>
            )}
          </div>
        </div>

        {latest && (
          <div className="card" style={{ marginTop: 20 }}>
            <h4 style={{ marginBottom: 16 }}> Detail Input Terakhir</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              {[
                { label: ' Usia', value: latest.age ? `${latest.age} th` : '-' },
                { label: ' Tinggi', value: latest.height_cm ? `${latest.height_cm} cm` : '-' },
                { label: ' Berat', value: latest.weight_kg ? `${latest.weight_kg} kg` : '-' },
                { label: ' Langkah', value: latest.daily_steps ? parseInt(latest.daily_steps).toLocaleString() : '-' },
                { label: ' Olahraga', value: latest.exercise_frequency ? `${latest.exercise_frequency}x/minggu` : '-' },
                { label: ' Tidur', value: latest.sleep_hours ? `${latest.sleep_hours} jam` : '-' },
                { label: ' Kalori', value: latest.caloric_intake ? `${parseInt(latest.caloric_intake)} kkal` : '-' },
                { label: ' Confidence', value: latest.confidence_score ? `${parseFloat(latest.confidence_score).toFixed(1)}%` : '-' },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--color-bg)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1rem' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card" style={{ marginTop: 20, marginBottom: 40 }}>
          <h4 style={{ marginBottom: 14 }}> Aksi Cepat</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            {[
              { icon: 'fa-stethoscope', label: 'Prediksi Diet Baru', color: 'var(--color-primary)', page: 'predict' },
              { icon: 'fa-clock-rotate-left', label: 'Riwayat Prediksi', color: 'var(--color-secondary)', page: 'history' },
              { icon: 'fa-user-pen', label: 'Perbarui Profil', color: 'var(--color-info)', page: 'profile' },
            ].map(a => (
              <button key={a.label} className="btn btn-ghost btn-full" style={{ flexDirection: 'column', padding: '16px 12px', borderRadius: 12, border: '1.5px solid var(--color-border-soft)', gap: 8, height: 'auto' }}
                onClick={() => navigate(a.page)}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${a.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`fas ${a.icon}`} style={{ color: a.color, fontSize: '1rem' }}></i>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
