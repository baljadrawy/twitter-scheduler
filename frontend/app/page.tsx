'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Sparkles, BarChart3, Send, Plus, X, Check, Loader2, 
  Hash, Globe, LogOut, TrendingUp, Users, Eye, Zap, Image, Repeat, 
  Moon, Sun, Twitter, Link as LinkIcon 
} from 'lucide-react';

// تعريف أنواع البيانات لتتوافق مع الباك إند
interface User {
  id: string;
  name: string;
  email: string;
}

interface Tweet {
  id: string;
  content: string;
  scheduled_time: string;
  status: 'pending' | 'published' | 'failed';
  media_urls: string[];
  username?: string; // يأتي من الـ join في الباك إند
  profile_image_url?: string;
}

export default function TwitterScheduler() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  
  // Data State
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loadingTweets, setLoadingTweets] = useState(false);

  // Modals & UI State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // التحقق من تسجيل الدخول عند البدء
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setCurrentPage('dashboard');
    }
  }, []);

  // جلب التغريدات عند فتح الداشبورد
  useEffect(() => {
    if (currentPage === 'dashboard' && token) {
      fetchTweets();
    }
  }, [currentPage,QX token]);

  const showNotif = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const fetchTweets = async () => {
    setLoadingTweets(true);
    try {
      const res = await fetch(`${API_URL}/tweets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTweets(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTweets(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setCurrentPage('login');
  };

  // --- مكون تسجيل الدخول ---
  const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ email: '', password: '', name: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAuth = async () => {
      setError('');
      setLoading(true);
      try {
        const endpoint = isLogin ? '/auth/login' : '/auth/register';
        const res = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();

        if (data.success) {
          const userData = data.data.user;
          const tokenData = data.data.token;
          
          localStorage.setItem('token', tokenData);
          localStorage.setItem('user', JSON.stringify(userData));
          
          setToken(tokenData);
          setUser(userData);
          setCurrentPage('dashboard');
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('فشل الاتصال بالخادم. تأكد أن الباك إند يعمل.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">Twitter Scheduler</h1>
            <p className="text-gray-600">منصتك الذكية لإدارة المحتوى 🚀</p>
          </div>

          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 rounded-lg font-medium transition ${isLogin ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>دخول</button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 rounded-lg font-medium transition ${!isLogin ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>جديد</button>
          </div>

          <div className="space-y-4">
            {!isLogin && <input type="text" placeholder="الاسم" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 border rounded-xl" />}
            <input type="email" placeholder="البريد الإلكتروني" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 border rounded-xl" />
            <input type="password" placeholder="كلمة المرور" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-3 border rounded-xl" />
            
            <button onClick={handleAuth} disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex justify-center">
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'دخول' : 'تسجيل')}
            </button>
            {error && <p className="text-red-500 text-center text-sm">{error}</p>}
          </div>
        </div>
      </div>
    );
  };

  // --- مودال إنشاء التغريدة ---
  const CreateTweetModal = () => {
    const [content, setContent] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [mediaUrl, setMediaUrl] = useState(''); // حالياً رابط واحد للتبسيط
    const [loading, setLoading] = useState(false);
    
    // AI State
    const [aiMode, setAiMode] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

    // TODO: يجب جلب الحسابات من الباك إند
    // سنفترض وجود حساب واحد حالياً للتبسيط أو نطلب من المستخدم اختياره
    // const [selectedAccount, setSelectedAccount] = useState('');

    const handleSchedule = async () => {
      setLoading(true);
      try {
        // حساب الوقت بتنسيق ISO
        const isoDateTime = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
        
        // يجب أن يكون لديك ID حساب تويتر حقيقي مخزن في قاعدة البيانات
        // هنا سنفترض أننا نجلب أول حساب للمستخدم (تحتاج endpoint لجلب الحسابات)
        // لهذا المثال، سأترك خانة الحساب فارغة ليتم ملؤها لاحقاً أو تجلبها من الـ state
        
        // ملاحظة: لكي يعمل هذا، يجب أن يكون لديك حساب تويتر مربوط في قاعدة البيانات
        // والباك إند يحتاج twitter_account_id
        // كحل مؤقت، سنجعل المستخدم يدخل ID الحساب أو نجلب أول حساب متاح
        
        // جلب الحسابات المتاحة (يفضل نقلها لـ useEffect)
        // const accountsRes = await fetch(`${API_URL}/twitter/accounts`, ...); 
        
        // ⚠️ هام: هذا الطلب سيفشل إذا لم ترسل account_id صحيح
        // لكن سأكتب الكود كما لو كان الحساب محدداً
        
        /* لحل هذه المشكلة: 
           1. أضف endpoint في الباك إند: GET /api/twitter/accounts
           2. استدعه هنا واحصل على ID
        */

        const res = await fetch(`${API_URL}/tweets`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            // ⚠️ استبدل هذا بـ ID حقيقي من قاعدة بياناتك بعد ربط الحساب
            // يمكنك جلبه يدوياً من الداتابيس للتجربة الآن
            twitter_account_id: "ضع_الـ_UUID_لحساب_تويتر_من_جدول_twitter_accounts_هنا", 
            content,
            scheduled_time: isoDateTime,
            media_urls: mediaUrl ? [mediaUrl] : []
          })
        });

        const data = await res.json();
        if (data.success) {
          showNotif('تمت الجدولة بنجاح!');
          setShowCreateModal(false);
          fetchTweets(); // تحديث القائمة
        } else {
          showNotif(data.error || 'فشل الجدولة', 'error');
        }
      } catch (err) {
        showNotif('حدث خطأ غير متوقع', 'error');
      } finally {
        setLoading(false);
      }
    };

    const handleAI = async () => {
      if(!aiPrompt) return;
      setAiLoading(true);
      try {
        const res = await fetch(`${API_URL}/ai/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ prompt: aiPrompt, tone: 'casual', length: 'medium' })
        });
        const data = await res.json();
        if(data.success) {
          setContent(data.data.tweet);
          setAiMode(false);
        }
      } catch(err) {
        console.error(err);
      } finally {
        setAiLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" dir="rtl">
        <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">تغريدة جديدة</h2>
            <button onClick={() => setShowCreateModal(false)}><X className="text-gray-400 hover:text-gray-600" /></button>
          </div>

          {!aiMode ? (
            <div className="space-y-4">
              <div className="relative">
                <textarea 
                  value={content} 
                  onChange={e => setContent(e.target.value)}
                  placeholder="ماذا يحدث؟" 
                  className="w-full p-4 border rounded-xl h-32 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
                <button onClick={() => setAiMode(true)} className="absolute bottom-3 left-3 text-blue-600 hover:bg-blue-50 p-2 rounded-full transition flex gap-1 items-center text-sm font-bold">
                  <Sparkles size={16} /> مساعد AI
                </button>
              </div>

              <input 
                type="text" 
                placeholder="رابط صورة (اختياري)" 
                value={mediaUrl}
                onChange={e => setMediaUrl(e.target.value)}
                className="w-full p-3 border rounded-xl text-sm"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">التاريخ</label>
                  <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">الوقت</label>
                  <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} className="w-full p-2 border rounded-lg" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handleSchedule} disabled={loading || !content || !scheduledDate || !scheduledTime} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center gap-2">
                  {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> جدولة النشر</>}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-700">بماذا تفكر؟</h3>
              <input 
                type="text" 
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="مثال: نصيحة عن البرمجة للمبتدئين" 
                className="w-full p-3 border rounded-xl"
              />
              <div className="flex gap-2">
                <button onClick={handleAI} disabled={aiLoading} className="flex-1 bg-purple-600 text-white py-2 rounded-xl hover:bg-purple-700 transition flex justify-center">
                  {aiLoading ? <Loader2 className="animate-spin" /> : 'توليد'}
                </button>
                <button onClick={() => setAiMode(false)} className="px-4 border rounded-xl hover:bg-gray-50">إلغاء</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- الداشبورد الرئيسي ---
  if (currentPage === 'login') return <LoginPage />;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`} dir="rtl">
      {showNotification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 z-50 animate-slide-in">
          <Check size={18} className="text-green-400" /> {notificationMsg}
        </div>
      )}

      {/* الشريط الجانبي */}
      <div className="fixed right-0 top-0 h-full w-64 bg-white border-l p-6 hidden md:flex flex-col shadow-sm z-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white"><Send /></div>
          <h1 className="font-bold text-xl text-gray-800">Scheduler</h1>
        </div>
        
        <nav className="space-y-2 flex-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-medium"><BarChart3 size={20} /> لوحة التحكم</button>
          {/* رابط ربط الحساب */}
          <a href={`${API_URL}/auth/twitter/link?token=${token}`} className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium">
            <LinkIcon size={20} /> ربط تويتر
          </a>
        </nav>

        <div className="pt-6 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">{user?.name.charAt(0)}</div>
            <div>
              <p className="font-bold text-sm">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-red-500 text-sm flex items-center gap-2 hover:bg-red-50 px-3 py-2 rounded-lg w-full"><LogOut size={16} /> تسجيل خروج</button>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="md:mr-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">أهلاً، {user?.name} 👋</h1>
            <p className="text-gray-500">لديك {tweets.filter(t => t.status === 'pending').length} تغريدات مجدولة قادمة.</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center gap-2 transition transform hover:scale-105">
            <Plus size={20} /> تغريدة جديدة
          </button>
        </header>

        {/* الإحصائيات السريعة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Clock /></div>
              <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">قيد الانتظار</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{tweets.filter(t => t.status === 'pending').length}</h3>
            <p className="text-gray-500 text-sm mt-1">تغريدة مجدولة</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl"><Check /></div>
              <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">تم النشر</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{tweets.filter(t => t.status === 'published').length}</h3>
            <p className="text-gray-500 text-sm mt-1">تغريدة منشورة</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Zap /></div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">Active</h3>
            <p className="text-gray-500 text-sm mt-1">حالة الحساب</p>
          </div>
        </div>

        {/* قائمة التغريدات */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="font-bold text-lg">📅 الجدول الزمني</h3>
            <button onClick={fetchTweets} className="text-blue-600 text-sm hover:underline">تحديث</button>
          </div>
          
          <div className="divide-y">
            {loadingTweets ? (
              <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
            ) : tweets.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p>لا توجد تغريدات مجدولة. ابدأ بإنشاء واحدة!</p>
              </div>
            ) : (
              tweets.map((tweet) => (
                <div key={tweet.id} className="p-6 hover:bg-gray-50 transition flex gap-4">
                  <div className={`w-2 h-full rounded-full ${tweet.status === 'published' ? 'bg-green-500' : tweet.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        tweet.status === 'published' ? 'bg-green-100 text-green-700' : 
                        tweet.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {tweet.status === 'published' ? 'منشورة' : tweet.status === 'failed' ? 'فشلت' : 'مجدولة'}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1" dir="ltr">
                        {new Date(tweet.
