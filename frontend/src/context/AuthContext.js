const { createContext, useContext, useState, useEffect, useCallback } = React;

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const savedToken = localStorage.getItem('fitpred_token');
    if (!savedToken) { setLoading(false); return; }
    try {
      const res = await AuthAPI.getMe();
      setUser(res.data.data);
    } catch {
      localStorage.removeItem('fitpred_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (username, password) => {
    const res = await AuthAPI.login({ username, password });
    const { token: newToken, user: userData } = res.data.data;
    localStorage.setItem('fitpred_token', newToken);
    setUser(userData);
    return res.data;
  };

  const register = async (data) => {
    const res = await AuthAPI.register(data);
    const { token: newToken, user: userData } = res.data.data;
    localStorage.setItem('fitpred_token', newToken);
    setUser(userData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('fitpred_token');
    setUser(null);
    window.location.hash = '#/';
  };

  const updateUser = async (data) => {
    setUser(prev => ({ ...prev, ...data }));
    try {
      const res = await AuthAPI.getMe();
      setUser(res.data.data);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
