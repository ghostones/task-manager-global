import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import RazorpayButton from 'react-razorpay';
import { useTranslation, initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import './App.css';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    lng: 'en',
    interpolation: { escapeValue: false },
    resources: {
      en: { translation: { 
        welcome: 'Welcome to Task Manager Pro!', 
        login: 'Login', 
        register: 'Register', 
        email: 'Email', 
        password: 'Password', 
        addTask: 'Add Task', 
        title: 'Title', 
        description: 'Description', 
        dueDate: 'Due Date', 
        upgrade: 'Upgrade to Pro', 
        limitReached: 'Free limit (10 tasks) reached! Upgrade for unlimited.', 
        shop: 'Shop Affiliates (Earn Worldwide)', 
        privacy: 'Privacy Policy (GDPR/DPDP Compliant)', 
        amazon: 'Buy Planner on Amazon', 
        flipkart: 'Buy on Flipkart (India)' 
      } },
      hi: { translation: { 
        welcome: 'टास्क मैनेजर प्रो में स्वागत है!', 
        login: 'लॉगिन', 
        register: 'रजिस्टर', 
        email: 'ईमेल', 
        password: 'पासवर्ड', 
        addTask: 'टास्क जोड़ें', 
        title: 'शीर्षक', 
        description: 'विवरण', 
        dueDate: 'देय तिथि', 
        upgrade: 'प्रो में अपग्रेड करें', 
        limitReached: 'मुफ्त सीमा (10 टास्क) पहुंच गई! अनलिमिटेड के लिए अपग्रेड करें।', 
        shop: 'एफिलिएट शॉप (विश्वव्यापी कमाई)', 
        privacy: 'गोपनीयता नीति (GDPR/DPDP अनुपालन)', 
        amazon: 'अमेज़न पर प्लानर खरीदें', 
        flipkart: 'फ्लिपकार्ट पर खरीदें (भारत)' 
      } },
      es: { translation: { 
        welcome: '¡Bienvenido a Task Manager Pro!', 
        upgrade: 'Actualizar a Pro' 
      } },
      fr: { translation: { 
        welcome: 'Bienvenue sur Task Manager Pro !', 
        upgrade: 'Passer à Pro' 
      } }
    }
  });

const stripePromise = loadStripe('pk_test_your-stripe-publishable-key');  // Replace with yours

function App() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({ email: '', password: '', title: '', description: '', dueDate: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [country, setCountry] = useState('IN');

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchTasks();
      axios.get('https://ipapi.co/json/').then(res => setCountry(res.data.country_code || 'US')).catch(() => {});
    }
  }, [token]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/tasks`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${endpoint}`, { email: formData.email, password: formData.password });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/tasks`, { title: formData.title, description: formData.description, dueDate: formData.dueDate });
      fetchTasks();
      setFormData({ ...formData, title: '', description: '', dueDate: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setTasks([]);
  };

  if (!token) {
    return (
      <div className="login">
        <h2>{t('welcome')}</h2>
        <form onSubmit={handleAuth}>
          <input type="email" placeholder={t('email')} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          <input type="password" placeholder={t('password')} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
          <button type="submit">{isLogin ? t('login') : t('register')}</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)}>Switch to {isLogin ? t('register') : t('login')}</button>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>{t('welcome')}</h1>
        <button onClick={logout}>Logout</button>
        <select onChange={(e) => i18n.changeLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
        </select>
      </header>
      <form onSubmit={addTask}>
        <input placeholder={t('title')} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
        <input placeholder={t('description')} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
        <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} required />
        <button type="submit">{t('addTask')}</button>
      </form>
      <ul>
        {tasks.map(task => (
          <li key={task._id}>
            <strong>{task.title}</strong> - {task.description} (Due: {new Date(task.dueDate).toLocaleDateString()})
            {task.completed ? ' ✓' : ''}
          </li>
        ))}
      </ul>
      {!user.isPremium && tasks.length >= 10 && (
        <div className="upgrade">
          <p>{t('limitReached')}</p>
          {country === 'IN' ? (
            <RazorpayButton
              options={{
                key: 'rzp_test_yourkey',  // Replace
                amount: 29500,
                currency: 'INR',
                name: 'Task Manager Pro',
                description: 'Premium Upgrade',
                handler: (response) => {
                  axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payments/verify`, { razorpay_payment_id: response.razorpay_payment_id });
                  alert('Premium activated!');
                  fetchTasks();
                }
              }}
              onCreateOrder={async () => {
                const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payments/create-order`, { amount: 3.99 });
                return res.data.id;
              }}
            />
          ) : (
            <button onClick={async () => {
              const stripe = await stripePromise;
              const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payments/create-order`, { amount: 3.99 });
              stripe.redirectToCheckout({ sessionId: res.data.id });
            }}>{t('upgrade')} ($3.99)</button>
          )}
        </div>
      )}
      {window.location.search.includes('dashboard') && (
        <div className="shop">
          <h3>{t('shop')}</h3>
          <a href="https://amazon.in/dp/B08XYZ?tag=yourtag" target="_blank" rel="noreferrer">{t('amazon')}</a>
          <a href="https://flipkart.com/product?affid=yourid" target="_blank" rel="noreferrer">{t('flipkart')}</a>
        </div>
      )}
    </div>
  );
}

export default App;