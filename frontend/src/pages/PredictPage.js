const mealEmoji = {
  'High-Protein Diet': '',
  'Low-Carb Diet': '',
  'Low-Fat Diet': '',
};

const getMealEmoji = (plan) => {
  if (!plan) return '';
  for (const [k, v] of Object.entries(mealEmoji)) {
    if (plan.toLowerCase().includes(k.toLowerCase().split(' ')[0].toLowerCase())) return v;
  }
  return '';
};

const Toggle = ({ label, active, onClick }) => (
  <div className={`form-check-item ${active ? 'active' : ''}`} onClick={onClick}
    style={{ userSelect: 'none', cursor: 'pointer' }}>
    {active && <i className="fas fa-check" style={{ fontSize: '0.72rem' }}></i>}
    {label}
  </div>
);

const NumInput = ({ label, name, placeholder, min, max, unit, required, value, onChange }) => (
  <div className="form-group">
    <label className="form-label">
      {label}{required && <span style={{ color: 'var(--color-danger)', marginLeft: 2 }}>*</span>}
      {unit && <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, marginLeft: 4 }}>({unit})</span>}
    </label>
    <input
      type="number"
      className="form-input"
      placeholder={placeholder}
      min={min} max={max} step="any"
      value={value}
      onChange={onChange}
    />
  </div>
);

const PredictPage = ({ navigate }) => {
  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState('');

  const [form, setForm] = React.useState({
    age: '', height_cm: '', weight_kg: '',
    blood_pressure_systolic: '', blood_pressure_diastolic: '',
    cholesterol_level: '', blood_sugar_level: '',
    daily_steps: '', exercise_frequency: '', sleep_hours: '',
    caloric_intake: '', protein_intake: '', carbohydrate_intake: '', fat_intake: '',
    gender_male: false, gender_female: true, gender_other: false,
    chronic_disease_heart: false, chronic_disease_hypertension: false,
    chronic_disease_none: true, chronic_disease_obesity: false,
    genetic_risk_factor_yes: false,
    allergies_lactose: false, allergies_none: true, allergies_nut: false,
    alcohol_consumption_yes: false, smoking_habit_yes: false,
    dietary_habits_regular: true, dietary_habits_vegan: false, dietary_habits_vegetarian: false,
    preferred_cuisine_indian: false, preferred_cuisine_mediterranean: false, preferred_cuisine_western: false,
    food_aversions_salty: false, food_aversions_spicy: false, food_aversions_sweet: false,
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setError('');
    if (!form.age || !form.height_cm || !form.weight_kg) {
      setError('Usia, tinggi badan, dan berat badan wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      const res = await HealthAPI.predict(form);
      setResult(res.data.data);
      setStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg || 'Prediksi gagal. Periksa koneksi dan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1); setResult(null); setError('');
    setForm({
      age: '', height_cm: '', weight_kg: '',
      blood_pressure_systolic: '', blood_pressure_diastolic: '',
      cholesterol_level: '', blood_sugar_level: '',
      daily_steps: '', exercise_frequency: '', sleep_hours: '',
      caloric_intake: '', protein_intake: '', carbohydrate_intake: '', fat_intake: '',
      gender_male: false, gender_female: true, gender_other: false,
      chronic_disease_heart: false, chronic_disease_hypertension: false,
      chronic_disease_none: true, chronic_disease_obesity: false,
      genetic_risk_factor_yes: false,
      allergies_lactose: false, allergies_none: true, allergies_nut: false,
      alcohol_consumption_yes: false, smoking_habit_yes: false,
      dietary_habits_regular: true, dietary_habits_vegan: false, dietary_habits_vegetarian: false,
      preferred_cuisine_indian: false, preferred_cuisine_mediterranean: false, preferred_cuisine_western: false,
      food_aversions_salty: false, food_aversions_spicy: false, food_aversions_sweet: false,
    });
  };

  const steps = ['Data Dasar', 'Gaya Hidup', 'Kondisi & Diet', 'Hasil'];

  const StepBar = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0, marginBottom: 32 }}>
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: i + 1 < step ? 'pointer' : 'default' }}
            onClick={() => { if (i + 1 < step) setStep(i + 1); }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step > i + 1 ? 'var(--color-primary)' : step === i + 1 ? 'var(--color-primary)' : 'var(--color-border)',
              color: step >= i + 1 ? 'white' : 'var(--color-text-muted)',
              fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.3s',
              boxShadow: step === i + 1 ? '0 4px 12px rgba(91,142,125,0.35)' : 'none'
            }}>
              {step > i + 1 ? <i className="fas fa-check" style={{ fontSize: '0.85rem' }}></i> : i + 1}
            </div>
            <span style={{ fontSize: '0.72rem', marginTop: 6, whiteSpace: 'nowrap',
              color: step === i + 1 ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontWeight: step === i + 1 ? 600 : 400 }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, minWidth: 32, margin: '0 6px', marginBottom: 20,
              background: step > i + 1 ? 'var(--color-primary)' : 'var(--color-border)',
              transition: 'background 0.3s' }}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container">
          <h2><i className="fas fa-stethoscope" style={{ marginRight: 12 }}></i>Prediksi Pola Makan & Diet</h2>
          <p>Isi data kesehatan Anda — AI akan merekomendasikan pola diet terbaik</p>
        </div>
      </div>

      <div className="predict-form-section">
        <div className="container" style={{ maxWidth: 820 }}>
          <StepBar />

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20, whiteSpace: 'pre-line' }}>
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          {step === 1 && (
            <div className="card animate-fadeIn">
              <div className="form-section-title"><i className="fas fa-user-circle"></i> Data Dasar & Antropometri</div>

              <div className="form-group">
                <label className="form-label">Jenis Kelamin</label>
                <div className="form-checkbox-group">
                  <Toggle label=" Laki-laki" active={form.gender_male}
                    onClick={() => setForm(p => ({ ...p, gender_male: true, gender_female: false, gender_other: false }))} />
                  <Toggle label=" Perempuan" active={form.gender_female}
                    onClick={() => setForm(p => ({ ...p, gender_male: false, gender_female: true, gender_other: false }))} />
                  <Toggle label=" Lainnya" active={form.gender_other}
                    onClick={() => setForm(p => ({ ...p, gender_male: false, gender_female: false, gender_other: true }))} />
                </div>
              </div>

              <div className="form-row">
                <NumInput label="Usia" name="age" placeholder="cth: 25" min="1" max="120" unit="tahun" required
                  value={form.age} onChange={e => set('age', e.target.value)} />
                <NumInput label="Tinggi Badan" name="height_cm" placeholder="cth: 170" min="100" max="250" unit="cm" required
                  value={form.height_cm} onChange={e => set('height_cm', e.target.value)} />
              </div>
              <div className="form-row">
                <NumInput label="Berat Badan" name="weight_kg" placeholder="cth: 65" min="20" max="300" unit="kg" required
                  value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)} />
                <div className="form-group"></div>
              </div>

              <div className="form-section-title" style={{ marginTop: 8 }}>
                <i className="fas fa-heart-pulse"></i> Tanda Vital & Lab
              </div>
              <div className="form-row">
                <NumInput label="Tekanan Darah Sistolik" name="blood_pressure_systolic" placeholder="cth: 120" min="70" max="250" unit="mmHg"
                  value={form.blood_pressure_systolic} onChange={e => set('blood_pressure_systolic', e.target.value)} />
                <NumInput label="Tekanan Darah Diastolik" name="blood_pressure_diastolic" placeholder="cth: 80" min="40" max="150" unit="mmHg"
                  value={form.blood_pressure_diastolic} onChange={e => set('blood_pressure_diastolic', e.target.value)} />
              </div>
              <div className="form-row">
                <NumInput label="Kadar Kolesterol" name="cholesterol_level" placeholder="cth: 180" min="50" max="400" unit="mg/dL"
                  value={form.cholesterol_level} onChange={e => set('cholesterol_level', e.target.value)} />
                <NumInput label="Gula Darah" name="blood_sugar_level" placeholder="cth: 90" min="50" max="600" unit="mg/dL"
                  value={form.blood_sugar_level} onChange={e => set('blood_sugar_level', e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="btn btn-primary btn-lg" onClick={() => setStep(2)}>
                  Lanjut <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="card animate-fadeIn">
              <div className="form-section-title"><i className="fas fa-running"></i> Aktivitas Fisik & Nutrisi</div>
              <div className="form-row">
                <NumInput label="Langkah per Hari" name="daily_steps" placeholder="cth: 8000" min="0" max="50000" unit="langkah"
                  value={form.daily_steps} onChange={e => set('daily_steps', e.target.value)} />
                <NumInput label="Frekuensi Olahraga" name="exercise_frequency" placeholder="cth: 3" min="0" max="7" unit="kali/minggu"
                  value={form.exercise_frequency} onChange={e => set('exercise_frequency', e.target.value)} />
              </div>
              <div className="form-row">
                <NumInput label="Jam Tidur" name="sleep_hours" placeholder="cth: 7" min="1" max="12" unit="jam/hari"
                  value={form.sleep_hours} onChange={e => set('sleep_hours', e.target.value)} />
                <div className="form-group"></div>
              </div>

              <div className="form-section-title" style={{ marginTop: 4 }}>
                <i className="fas fa-pizza-slice"></i> Asupan Nutrisi Harian
              </div>
              <div className="form-row">
                <NumInput label="Asupan Kalori" name="caloric_intake" placeholder="cth: 2000" min="0" unit="kkal/hari"
                  value={form.caloric_intake} onChange={e => set('caloric_intake', e.target.value)} />
                <NumInput label="Asupan Protein" name="protein_intake" placeholder="cth: 60" min="0" unit="gram"
                  value={form.protein_intake} onChange={e => set('protein_intake', e.target.value)} />
              </div>
              <div className="form-row">
                <NumInput label="Asupan Karbohidrat" name="carbohydrate_intake" placeholder="cth: 250" min="0" unit="gram"
                  value={form.carbohydrate_intake} onChange={e => set('carbohydrate_intake', e.target.value)} />
                <NumInput label="Asupan Lemak" name="fat_intake" placeholder="cth: 70" min="0" unit="gram"
                  value={form.fat_intake} onChange={e => set('fat_intake', e.target.value)} />
              </div>

              <div className="form-group" style={{ marginTop: 4 }}>
                <label className="form-label">Konsumsi Alkohol</label>
                <div className="form-checkbox-group">
                  <Toggle label="Tidak" active={!form.alcohol_consumption_yes} onClick={() => set('alcohol_consumption_yes', false)} />
                  <Toggle label="Ya" active={form.alcohol_consumption_yes} onClick={() => set('alcohol_consumption_yes', true)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Kebiasaan Merokok</label>
                <div className="form-checkbox-group">
                  <Toggle label="Tidak Merokok" active={!form.smoking_habit_yes} onClick={() => set('smoking_habit_yes', false)} />
                  <Toggle label="Merokok" active={form.smoking_habit_yes} onClick={() => set('smoking_habit_yes', true)} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button className="btn btn-outline btn-lg" onClick={() => setStep(1)}><i className="fas fa-arrow-left"></i> Kembali</button>
                <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => setStep(3)}>Lanjut <i className="fas fa-arrow-right"></i></button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="card animate-fadeIn">
              <div className="form-section-title"><i className="fas fa-hospital"></i> Riwayat Penyakit Kronis</div>
              <div className="form-group">
                <div className="form-checkbox-group">
                  <Toggle label=" Tidak Ada" active={form.chronic_disease_none}
                    onClick={() => setForm(p => ({ ...p, chronic_disease_none: true, chronic_disease_heart: false, chronic_disease_hypertension: false, chronic_disease_obesity: false }))} />
                  <Toggle label=" Penyakit Jantung" active={form.chronic_disease_heart}
                    onClick={() => setForm(p => ({ ...p, chronic_disease_heart: !p.chronic_disease_heart, chronic_disease_none: false }))} />
                  <Toggle label=" Hipertensi" active={form.chronic_disease_hypertension}
                    onClick={() => setForm(p => ({ ...p, chronic_disease_hypertension: !p.chronic_disease_hypertension, chronic_disease_none: false }))} />
                  <Toggle label=" Obesitas" active={form.chronic_disease_obesity}
                    onClick={() => setForm(p => ({ ...p, chronic_disease_obesity: !p.chronic_disease_obesity, chronic_disease_none: false }))} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Faktor Risiko Genetik</label>
                <div className="form-checkbox-group">
                  <Toggle label="Tidak Ada" active={!form.genetic_risk_factor_yes} onClick={() => set('genetic_risk_factor_yes', false)} />
                  <Toggle label="Ada" active={form.genetic_risk_factor_yes} onClick={() => set('genetic_risk_factor_yes', true)} />
                </div>
              </div>

              <div className="form-section-title" style={{ marginTop: 4 }}><i className="fas fa-allergies"></i> Alergi Makanan</div>
              <div className="form-group">
                <div className="form-checkbox-group">
                  <Toggle label=" Tidak Ada" active={form.allergies_none}
                    onClick={() => setForm(p => ({ ...p, allergies_none: true, allergies_lactose: false, allergies_nut: false }))} />
                  <Toggle label=" Intoleransi Laktosa" active={form.allergies_lactose}
                    onClick={() => setForm(p => ({ ...p, allergies_lactose: !p.allergies_lactose, allergies_none: false }))} />
                  <Toggle label=" Alergi Kacang" active={form.allergies_nut}
                    onClick={() => setForm(p => ({ ...p, allergies_nut: !p.allergies_nut, allergies_none: false }))} />
                </div>
              </div>

              <div className="form-section-title" style={{ marginTop: 4 }}><i className="fas fa-leaf"></i> Kebiasaan Diet</div>
              <div className="form-group">
                <div className="form-checkbox-group">
                  <Toggle label=" Regular" active={form.dietary_habits_regular}
                    onClick={() => setForm(p => ({ ...p, dietary_habits_regular: true, dietary_habits_vegan: false, dietary_habits_vegetarian: false }))} />
                  <Toggle label=" Vegan" active={form.dietary_habits_vegan}
                    onClick={() => setForm(p => ({ ...p, dietary_habits_vegan: true, dietary_habits_regular: false, dietary_habits_vegetarian: false }))} />
                  <Toggle label=" Vegetarian" active={form.dietary_habits_vegetarian}
                    onClick={() => setForm(p => ({ ...p, dietary_habits_vegetarian: true, dietary_habits_regular: false, dietary_habits_vegan: false }))} />
                </div>
              </div>

              <div className="form-section-title" style={{ marginTop: 4 }}><i className="fas fa-utensils"></i> Preferensi Masakan</div>
              <div className="form-group">
                <div className="form-checkbox-group">
                  <Toggle label=" Indian" active={form.preferred_cuisine_indian}
                    onClick={() => setForm(p => ({ ...p, preferred_cuisine_indian: !p.preferred_cuisine_indian }))} />
                  <Toggle label=" Mediterranean" active={form.preferred_cuisine_mediterranean}
                    onClick={() => setForm(p => ({ ...p, preferred_cuisine_mediterranean: !p.preferred_cuisine_mediterranean }))} />
                  <Toggle label=" Western" active={form.preferred_cuisine_western}
                    onClick={() => setForm(p => ({ ...p, preferred_cuisine_western: !p.preferred_cuisine_western }))} />
                </div>
              </div>

              <div className="form-section-title" style={{ marginTop: 4 }}><i className="fas fa-ban"></i> Pantangan Rasa</div>
              <div className="form-group">
                <div className="form-checkbox-group">
                  <Toggle label=" Asin" active={form.food_aversions_salty}
                    onClick={() => setForm(p => ({ ...p, food_aversions_salty: !p.food_aversions_salty }))} />
                  <Toggle label=" Pedas" active={form.food_aversions_spicy}
                    onClick={() => setForm(p => ({ ...p, food_aversions_spicy: !p.food_aversions_spicy }))} />
                  <Toggle label=" Manis" active={form.food_aversions_sweet}
                    onClick={() => setForm(p => ({ ...p, food_aversions_sweet: !p.food_aversions_sweet }))} />
                </div>
              </div>

              <div className="alert alert-info" style={{ marginTop: 8 }}>
                <i className="fas fa-robot"></i>
                <span>Data Anda akan dianalisis oleh AI untuk menghasilkan rekomendasi pola diet terbaik.</span>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button className="btn btn-outline btn-lg" onClick={() => setStep(2)}><i className="fas fa-arrow-left"></i> Kembali</button>
                <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleSubmit} disabled={loading}>
                  {loading ? <><div className="spinner spinner-sm"></div> Menganalisis...</> : <><i className="fas fa-brain"></i> Prediksi dengan AI</>}
                </button>
              </div>
            </div>
          )}

          {step === 4 && result && (
            <div className="animate-fadeIn">
              <div className="predict-result-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div style={{ fontSize: '3rem' }}>{getMealEmoji(result.summary?.recommended_meal_plan)}</div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Prediksi Selesai!</h3>
                    <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0 }}>
                      Confidence: {result.summary?.confidence_score}%
                    </p>
                  </div>
                  <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.18)', padding: '6px 14px', borderRadius: 999, fontSize: '0.82rem' }}>
                     Tersimpan
                  </span>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: '24px 20px', marginBottom: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Rekomendasi Diet AI</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'white' }}>
                    {getMealEmoji(result.summary?.recommended_meal_plan)} {result.summary?.recommended_meal_plan || '-'}
                  </div>
                </div>

                <div className="result-grid">
                  {[
                    { label: ' Confidence', value: `${result.summary?.confidence_score}%` },
                    { label: ' Usia', value: `${result.input?.age} tahun` },
                    { label: ' Tinggi', value: `${result.input?.height_cm} cm` },
                    { label: ' Berat', value: `${result.input?.weight_kg} kg` },
                  ].map(item => (
                    <div key={item.label} className="result-item">
                      <div className="label">{item.label}</div>
                      <div className="value">{item.value || '-'}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button className="btn btn-outline btn-lg" style={{ flex: 1 }} onClick={resetForm}>
                  <i className="fas fa-rotate-left"></i> Cek Lagi
                </button>
                <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => navigate('history')}>
                  <i className="fas fa-clock-rotate-left"></i> Riwayat
                </button>
                <button className="btn btn-lg" style={{ flex: 1, background: 'var(--color-secondary)', color: 'white' }} onClick={() => navigate('dashboard')}>
                  <i className="fas fa-chart-pie"></i> Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
