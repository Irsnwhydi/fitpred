const PAGE_LABELS = {
  landing:   'Beranda',
  login:     'Masuk',
  register:  'Daftar',
  dashboard: 'Dashboard',
  predict:   'Prediksi Diet',
  history:   'Riwayat',
  profile:   'Profil',
};

const PageTransition = ({ page, hiding }) => (
  <div className={`page-transition-overlay ${hiding ? 'hiding' : ''}`}>
    <div className="page-transition-brand">
      Fit<span>Pred</span>
    </div>
    <div className="page-transition-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div className="page-transition-text">
      Membuka {PAGE_LABELS[page] || 'halaman'}...
    </div>
  </div>
);

const App = () => {
  const getPageFromHash = () => {
    const h = window.location.hash.replace('#/', '').trim();
    return h || 'landing';
  };

  const [currentPage, setCurrentPage] = React.useState(getPageFromHash);
  const [transitioning, setTransitioning] = React.useState(false);
  const [transitionPage, setTransitionPage] = React.useState('landing');
  const [hiding, setHiding] = React.useState(false);
  const { user, loading } = useAuth();
  const navigatingRef = React.useRef(false);

  React.useEffect(() => {
    const onHash = () => {
      if (!navigatingRef.current) {
        setCurrentPage(getPageFromHash());
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = React.useCallback((page) => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;

    setTransitionPage(page);
    setHiding(false);
    setTransitioning(true);

    setTimeout(() => {
      window.location.hash = `#/${page}`;
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'instant' });
      setHiding(true);

      setTimeout(() => {
        setTransitioning(false);
        setHiding(false);
        navigatingRef.current = false;
      }, 250);
    }, 350);
  }, []);

  React.useEffect(() => {
    if (!loading) {
      const protectedPages = ['dashboard', 'predict', 'history', 'profile'];
      const authPages = ['login', 'register'];
      if (protectedPages.includes(currentPage) && !user) navigate('login');
      if (authPages.includes(currentPage) && user) navigate('dashboard');
      if (currentPage === 'analytics') navigate(user ? 'dashboard' : 'landing');
    }
  }, [user, loading, currentPage]);

  if (loading) return <LoadingSpinner fullScreen text="Memuat FitPred..." />;

  const isAuthPage = ['login', 'register'].includes(currentPage);

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':   return <LandingPage navigate={navigate} />;
      case 'login':     return <LoginPage navigate={navigate} />;
      case 'register':  return <RegisterPage navigate={navigate} />;
      case 'dashboard': return <DashboardPage navigate={navigate} />;
      case 'predict':   return <PredictPage navigate={navigate} />;
      case 'history':   return <HistoryPage navigate={navigate} />;
      case 'profile':   return <ProfilePage navigate={navigate} />;
      default: return (
        <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <div className="empty-state">
            <div className="empty-state-icon"><i className="fas fa-search"></i></div>
            <h4>Halaman Tidak Ditemukan</h4>
            <button className="btn btn-primary mt-md" onClick={() => navigate(user ? 'dashboard' : 'landing')}>
              Kembali ke Beranda
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {transitioning && <PageTransition page={transitionPage} hiding={hiding} />}
      {!isAuthPage && <Navbar currentPage={currentPage} navigate={navigate} />}
      <main style={{ flex: 1 }}>{renderPage()}</main>
      {!isAuthPage && <Footer navigate={navigate} />}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
