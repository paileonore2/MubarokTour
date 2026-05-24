import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { FaWhatsapp, FaStar, FaPlane, FaUsers, FaUserGraduate, FaBuilding, FaCar, FaTree, FaArrowRight, FaMapMarker, FaCalendar, FaUser, FaEnvelope, FaPhone, FaFacebook, FaInstagram, FaTwitter, FaMoon, FaSun, FaUserCircle, FaHistory, FaTicketAlt, FaSignOutAlt, FaHome, FaBox, FaNewspaper, FaCog, FaChartLine, FaImage, FaComments, FaEdit, FaTrash, FaPlus, FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// API setup
const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ============ AUTH CONTEXT ============
const AuthContext = React.createContext();
const useAuth = () => React.useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) { loadUser(); } else { setLoading(false); }
  }, []);

  const loadUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (err) { localStorage.removeItem('token'); }
    finally { setLoading(false); }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      toast.success('Login berhasil!');
      return true;
    } catch (err) { toast.error(err.response?.data?.error || 'Login gagal'); return false; }
  };

  const register = async (data) => {
    try {
      const res = await api.post('/auth/register', data);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      toast.success('Registrasi berhasil!');
      return true;
    } catch (err) { toast.error(err.response?.data?.error || 'Registrasi gagal'); return false; }
  };

  const logout = () => { localStorage.removeItem('token'); setUser(null); toast.success('Logout berhasil'); };

  return <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }}>{children}</AuthContext.Provider>;
};

// ============ COMPONENTS ============
const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/90 backdrop-blur-md shadow-sm dark:bg-gray-900/90">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="text-2xl font-bold text-primary">Mubarok<span className="text-secondary">Tour</span></Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="hover:text-primary">Beranda</Link>
            <Link to="/packages" className="hover:text-primary">Paket Wisata</Link>
            <Link to="/services" className="hover:text-primary">Layanan</Link>
            <Link to="/blog" className="hover:text-primary">Blog</Link>
            <Link to="/contact" className="hover:text-primary">Kontak</Link>
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2"><FaUserCircle size={24} /> {user.name}</button>
                <div className="absolute right-0 mt-2 hidden w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg group-hover:block">
                  <Link to="/dashboard" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Dashboard</Link>
                  {user.role === 'admin' && <Link to="/admin" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Admin Panel</Link>}
                  <button onClick={logout} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Logout</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn-primary py-2 px-4">Login</Link>
            )}
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-gray-900 text-white pt-16 pb-8">
    <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div><h3 className="text-xl font-bold mb-4">Mubarok Tour</h3><p className="text-gray-400">Travel wisata & corporate trip terpercaya di Indonesia</p></div>
      <div><h4 className="font-semibold mb-4">Layanan</h4><ul className="space-y-2 text-gray-400"><li>Kunjungan Industri</li><li>Family Gathering</li><li>Study Tour</li><li>Company Trip</li></ul></div>
      <div><h4 className="font-semibold mb-4">Kontak</h4><ul className="space-y-2 text-gray-400"><li>📞 +62 812-3456-789</li><li>✉️ info@mubaroktour.com</li><li>📍 Jakarta, Indonesia</li></ul></div>
      <div><h4 className="font-semibold mb-4">Ikuti Kami</h4><div className="flex gap-4"><FaFacebook size={24} /><FaInstagram size={24} /><FaTwitter size={24} /></div></div>
    </div>
    <div className="text-center text-gray-400 text-sm pt-8 mt-8 border-t border-gray-800">© 2024 Mubarok Tour. All rights reserved.</div>
  </footer>
);

const WhatsAppButton = () => (
  <a href="https://wa.me/628123456789" target="_blank" className="fixed bottom-6 right-6 z-50 bg-green-500 p-4 rounded-full text-white shadow-lg hover:scale-110 transition">
    <FaWhatsapp size={28} />
  </a>
);

// ============ PAGES ============
const Home = () => {
  const [packages, setPackages] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [services, setServices] = useState([]);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    api.get('/packages').then(res => setPackages(res.data.slice(0, 6)));
    api.get('/testimonials').then(res => setTestimonials(res.data));
    api.get('/services').then(res => setServices(res.data));
    api.get('/banners').then(res => setBanners(res.data));
  }, []);

  const defaultBanners = [{ title: 'Jelajahi Keindahan Indonesia', subtitle: 'Bersama Mubarok Tour', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05', buttonText: 'Lihat Paket' }];
  const displayBanners = banners.length ? banners : defaultBanners;

  return (
    <div>
      <Swiper modules={[Autoplay, Pagination, Navigation]} autoplay={{ delay: 5000 }} pagination navigation className="h-screen">
        {displayBanners.map((b, i) => (
          <SwiperSlide key={i}>
            <div className="relative h-full"><img src={b.image} className="h-full w-full object-cover" /><div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center text-white text-center"><div><h1 className="text-5xl md:text-7xl font-bold mb-4">{b.title}</h1><p className="text-xl mb-8">{b.subtitle}</p><Link to="/packages" className="btn-primary inline-block">{b.buttonText}</Link></div></div></div>
          </SwiperSlide>
        ))}
      </Swiper>

      <section className="py-20 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ x: -50 }} whileInView={{ x: 0 }}><h2 className="text-3xl md:text-4xl font-bold mb-4">Mubarok Tour & Travel</h2><p className="text-gray-600 dark:text-gray-300 mb-6">Mitra terpercaya untuk perjalanan wisata, corporate trip, dan event perusahaan Anda dengan pengalaman lebih dari 12 tahun.</p><Link to="/about" className="text-primary font-semibold inline-flex items-center gap-2">Selengkapnya <FaArrowRight /></Link></motion.div>
          <motion.div initial={{ x: 50 }} whileInView={{ x: 0 }}><img src="https://images.unsplash.com/photo-1553913861-c0fddf2619ee" className="rounded-2xl shadow-xl" /></motion.div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4"><h2 className="text-3xl font-bold text-center mb-12">Layanan Unggulan</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {services.map((s, i) => (<div key={i} className="card p-6 text-center"><div className="text-5xl mb-4">{s.icon || '✈️'}</div><h3 className="text-xl font-semibold mb-2">{s.name}</h3><p className="text-gray-600 dark:text-gray-400">{s.description}</p></div>))}
        </div></div>
      </section>

      <section className="py-20 container mx-auto px-4"><h2 className="text-3xl font-bold text-center mb-12">Paket Wisata Populer</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {packages.map((pkg, i) => (<div key={i} className="card group"><div className="relative h-56 overflow-hidden"><img src={pkg.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" /><div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm">{pkg.duration}</div></div><div className="p-6"><h3 className="text-xl font-semibold mb-2">{pkg.name}</h3><p className="text-gray-600 mb-2">{pkg.destination}</p><div className="flex justify-between items-center"><span className="text-2xl font-bold text-primary">Rp {pkg.price.toLocaleString()}</span><Link to={`/packages/${pkg.slug}`} className="text-primary font-semibold">Detail →</Link></div></div></div>))}
      </div>
      <div className="text-center mt-12"><Link to="/packages" className="btn-primary inline-block">Lihat Semua Paket</Link></div></section>

      <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-white text-center"><div><h2 className="text-3xl font-bold mb-4">Siap Merencanakan Perjalanan Anda?</h2><p className="text-lg mb-8">Hubungi kami sekarang untuk penawaran terbaik!</p><Link to="/contact" className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">Hubungi Kami</Link></div></section>
    </div>
  );
};

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => { api.get('/packages').then(res => setPackages(res.data)); }, []);
  
  const filtered = filter === 'all' ? packages : packages.filter(p => p.category === filter);
  
  return (<div className="pt-24 container mx-auto px-4"><h1 className="text-4xl font-bold mb-8">Paket Wisata</h1>
  <div className="flex gap-4 mb-8 flex-wrap"><button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Semua</button><button onClick={() => setFilter('wisata')} className={`px-4 py-2 rounded-lg ${filter === 'wisata' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Wisata</button><button onClick={() => setFilter('corporate')} className={`px-4 py-2 rounded-lg ${filter === 'corporate' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Corporate</button><button onClick={() => setFilter('study')} className={`px-4 py-2 rounded-lg ${filter === 'study' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Study Tour</button></div>
  <div className="grid md:grid-cols-3 gap-6">{filtered.map((pkg, i) => (<div key={i} className="card"><img src={pkg.image} className="h-56 w-full object-cover" /><div className="p-6"><h3 className="text-xl font-semibold">{pkg.name}</h3><p className="text-gray-600">{pkg.destination} • {pkg.duration}</p><p className="text-2xl font-bold text-primary mt-2">Rp {pkg.price.toLocaleString()}</p><Link to={`/packages/${pkg.slug}`} className="btn-primary inline-block w-full text-center mt-4 py-2">Pesan Sekarang</Link></div></div>))}</div></div>);
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate('/dashboard');
  };

  return (<div className="min-h-screen flex items-center justify-center pt-24 px-4"><div className="card max-w-md w-full p-8"><h2 className="text-2xl font-bold text-center mb-6">Login</h2><form onSubmit={handleSubmit}><input type="email" placeholder="Email" className="w-full p-3 border rounded-lg mb-4 dark:bg-gray-700 dark:border-gray-600" value={email} onChange={(e) => setEmail(e.target.value)} required /><input type="password" placeholder="Password" className="w-full p-3 border rounded-lg mb-6 dark:bg-gray-700 dark:border-gray-600" value={password} onChange={(e) => setPassword(e.target.value)} required /><button type="submit" className="btn-primary w-full py-3">Login</button></form><p className="text-center mt-4">Belum punya akun? <Link to="/register" className="text-primary">Register</Link></p></div></div>);
};

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

 const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(form);
    if (success) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 px-4">
      <div className="card max-w-md w-full p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Daftar Akun</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Nama Lengkap" className="w-full p-3 border rounded-lg mb-4 dark:bg-gray-700" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
          <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg mb-4 dark:bg-gray-700" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
          <input type="tel" placeholder="No. Telepon" className="w-full p-3 border rounded-lg mb-4 dark:bg-gray-700" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} required />
          <input type="password" placeholder="Password" className="w-full p-3 border rounded-lg mb-6 dark:bg-gray-700" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required />
          <button type="submit" className="btn-primary w-full py-3">Daftar</button>
        </form>
        <p className="text-center mt-4">
          Sudah punya akun? <Link to="/login" className="text-primary">Login</Link>
        </p>
      </div>
    </div>
  );
