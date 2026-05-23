import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Models
const UserSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
  phone: String, role: { type: String, default: 'user' }, avatar: String,
  createdAt: { type: Date, default: Date.now }
});

const PackageSchema = new mongoose.Schema({
  name: String, slug: String, destination: String, duration: String,
  price: Number, discountPrice: Number, image: String, description: String,
  facilities: [String], isPopular: Boolean, category: String,
  createdAt: { type: Date, default: Date.now }
});

const BookingSchema = new mongoose.Schema({
  bookingCode: String, userId: mongoose.Schema.Types.ObjectId, packageId: mongoose.Schema.Types.ObjectId,
  name: String, email: String, phone: String, participants: Number,
  date: Date, totalPrice: Number, status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const ArticleSchema = new mongoose.Schema({
  title: String, slug: String, content: String, excerpt: String,
  image: String, category: String, views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const TestimonialSchema = new mongoose.Schema({
  name: String, position: String, content: String, rating: Number,
  image: String, company: String
});

const DestinationSchema = new mongoose.Schema({
  name: String, city: String, province: String, description: String, image: String
});

const ServiceSchema = new mongoose.Schema({
  name: String, icon: String, description: String, order: Number
});

const BannerSchema = new mongoose.Schema({
  title: String, subtitle: String, image: String, buttonText: String, buttonLink: String, active: Boolean
});

const PartnerSchema = new mongoose.Schema({
  name: String, logo: String, website: String
});

const User = mongoose.model('User', UserSchema);
const Package = mongoose.model('Package', PackageSchema);
const Booking = mongoose.model('Booking', BookingSchema);
const Article = mongoose.model('Article', ArticleSchema);
const Testimonial = mongoose.model('Testimonial', TestimonialSchema);
const Destination = mongoose.model('Destination', DestinationSchema);
const Service = mongoose.model('Service', ServiceSchema);
const Banner = mongoose.model('Banner', BannerSchema);
const Partner = mongoose.model('Partner', PartnerSchema);

// Koneksi MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mubarok_tour')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Middleware Auth
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) { res.status(401).json({ error: 'Invalid token' }); }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
};

// ============ ROUTES API ============

// Auth
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, phone });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret');
    res.json({ token, user: { id: user._id, name, email, role: user.role } });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'User not found' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Wrong password' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret');
    res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/auth/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

// CRUD Generik
const crud = (route, Model) => {
  app.get(`/api/${route}`, async (req, res) => res.json(await Model.find().sort({ createdAt: -1 })));
  app.get(`/api/${route}/:id`, async (req, res) => res.json(await Model.findById(req.params.id)));
  app.post(`/api/${route}`, auth, adminOnly, async (req, res) => res.json(await Model.create(req.body)));
  app.put(`/api/${route}/:id`, auth, adminOnly, async (req, res) => res.json(await Model.findByIdAndUpdate(req.params.id, req.body, { new: true })));
  app.delete(`/api/${route}/:id`, auth, adminOnly, async (req, res) => { await Model.findByIdAndDelete(req.params.id); res.json({ success: true }); });
};

crud('users', User);
crud('packages', Package);
crud('bookings', Booking);
crud('articles', Article);
crud('testimonials', Testimonial);
crud('destinations', Destination);
crud('services', Service);
crud('banners', Banner);
crud('partners', Partner);

// Booking khusus user
app.get('/api/my-bookings', auth, async (req, res) => {
  const bookings = await Booking.find({ userId: req.user.id }).populate('packageId');
  res.json(bookings);
});

app.post('/api/bookings', auth, async (req, res) => {
  const bookingCode = 'MBK' + Date.now() + Math.floor(Math.random() * 1000);
  const booking = await Booking.create({ ...req.body, bookingCode, userId: req.user.id });
  res.json(booking);
});

// Seed data awal
app.post('/api/seed', async (req, res) => {
  // Create admin
  const adminExists = await User.findOne({ email: 'admin@mubarok.com' });
  if (!adminExists) {
    await User.create({
      name: 'Admin Mubarok',
      email: 'admin@mubarok.com',
      password: await bcrypt.hash('admin123', 10),
      phone: '08123456789',
      role: 'admin'
    });
  }

  // Create sample packages
  const packages = [
    { name: 'Bali Wonderland', slug: 'bali-wonderland', destination: 'Bali', duration: '4D3N', price: 2500000, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4', description: 'Paket wisata Bali terbaik', isPopular: true, category: 'wisata' },
    { name: 'Raja Ampat Expedition', slug: 'raja-ampat', destination: 'Raja Ampat', duration: '5D4N', price: 5500000, image: 'https://images.unsplash.com/photo-1533481405265-e9ce0c044abb', description: 'Jelajahi surga bawah laut', isPopular: true, category: 'wisata' },
    { name: 'Company Retreat Jogja', slug: 'company-retreat', destination: 'Yogyakarta', duration: '3D2N', price: 1850000, image: 'https://images.unsplash.com/photo-1542596768-5d1d21f1cf98', description: 'Corporate retreat terbaik', category: 'corporate' },
    { name: 'Study Tour Bandung', slug: 'study-tour', destination: 'Bandung', duration: '2D1N', price: 850000, image: 'https://images.unsplash.com/photo-1581261861294-0f8c0225a05e', description: 'Study tour edukatif', category: 'study' }
  ];
  
  for (const pkg of packages) {
    const exists = await Package.findOne({ slug: pkg.slug });
    if (!exists) await Package.create(pkg);
  }

  // Create services
  const services = [
    { name: 'Kunjungan Industri', icon: '🏭', description: 'Kunjungan ke perusahaan terkemuka', order: 1 },
    { name: 'Family Gathering', icon: '👨‍👩‍👧‍👦', description: 'Kebersamaan keluarga tak terlupakan', order: 2 },
    { name: 'Study Tour', icon: '📚', description: 'Pendidikan dan rekreasi', order: 3 },
    { name: 'Company Trip', icon: '💼', description: 'Perjalanan corporate produktif', order: 4 }
  ];
  
  for (const service of services) {
    const exists = await Service.findOne({ name: service.name });
    if (!exists) await Service.create(service);
  }

  res.json({ message: 'Seed data created!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}\n📍 http://localhost:${PORT}`));
