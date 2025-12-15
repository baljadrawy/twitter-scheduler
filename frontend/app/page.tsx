// frontend/app/page.tsx
'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Sparkles, BarChart3, Send, Plus, X, Check, Loader2, Hash, Globe, LogOut, TrendingUp, Users, Eye, Zap, Image, Video, Repeat, Filter, Download, Moon, Sun, Bell, Settings } from 'lucide-react';

export default function TwitterScheduler() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [tweets, setTweets] = useState([
    { id: 1, content: '🚀 نصيحة اليوم: استخدم تقنية Pomodoro لزيادة إنتاجيتك! 25 دقيقة عمل متواصل ثم 5 دقائق راحة. #إنتاجية #تطوير_الذات', time: 'غداً 8:00 مساءً', location: '🇸🇦 السعودية، 🇦🇪 الإمارات', status: 'pending', impressions: 0, likes: 0, retweets: 0, hasMedia: false },
    { id: 2, content: '💡 الذكاء الاصطناعي يغير مستقبل البرمجة. هل أنت مستعد للمستقبل؟ #تقنية #AI #برمجة', time: 'غداً 10:30 مساءً', location: '🌍 جميع الدول', status: 'pending', impressions: 0, likes: 0, retweets: 0, hasMedia: true },
    { id: 3, content: '✨ التعلم المستمر هو مفتاح النجاح في عالم التكنولوجيا المتغير 🎯', time: 'أمس 7:00 مساءً', location: '🇪🇬 مصر، 🇸🇦 السعودية', status: 'published', impressions: 1247, likes: 89, retweets: 23, hasMedia: false },
    { id: 4, content: '🔥 10 اختصارات VSCode ستغير طريقة برمجتك تماماً! شاهد الفيديو 👇', time: 'منذ 3 أيام', location: '🌍 جميع الدول', status: 'published', impressions: 2543, likes: 156, retweets: 67, hasMedia: true },
  ]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showThreadModal, setShowThreadModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [aiUsage, setAiUsage] = useState({ generate: 24, improve: 18, hashtags: 12 });
  const [filterStatus, setFilterStatus] = useState('all');

  const showNotif = (msg: string) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ email: '', password: '', name: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

    const handleAuth = async () => {
      if (!formData.email || !formData.password) return;
      if (!isLogin && !formData.name) {
        setError('الرجاء إدخال الاسم');
        return;
      }
      
      setLoading(true);
      setError('');
      
      try {
        const endpoint = isLogin ? '/auth/login' : '/auth/register';
        const body = isLogin 
          ? { email: formData.email, password: formData.password }
          : { email: formData.email, password: formData.password, name: formData.name };
        
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        
        const data = await response.json();
        
        if (data.success) {
          localStorage.setItem('token', data.data.token);
          setUser({ 
            id: data.data.user.id,
            name: data.data.user.name, 
            email: data.data.user.email,
            avatar: data.data.user.name.charAt(0).toUpperCase()
          });
          setCurrentPage('dashboard');
        } else {
          setError(data.error || 'حدث خطأ أثناء المعالجة');
        }
      } catch (err) {
        setError('تعذر الاتصال بالخادم');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-gray-100">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Send className="text-white" size={36} />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Twitter Scheduler
            </h1>
            <p className="text-gray-600">جدول تغريداتك بذكاء 🚀</p>
          </div>

          <div className="flex gap-2 mb-6 bg-gray-100 p-1.5 rounded-xl">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-2.5 rounded-lg font-medium transition ${isLogin ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600'}`}>
              تسجيل دخول
            </button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-2.5 rounded-lg font-medium transition ${!isLogin ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600'}`}>
              إنشاء حساب
            </button>
          </div>

          <div className="space-y-4">
            {!isLogin && (
              <input type="text" placeholder="الاسم الكامل" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            )}
            <input type="email" placeholder="example@email.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            <button onClick={handleAuth} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={20} className="animate-spin" />جاري المعالجة...</> : (isLogin ? 'تسجيل الدخول' : 'إنشاء حساب')}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
              <p className="text-sm text-red-800 text-center">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const CreateTweetModal = () => {
    const [content, setContent] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [useAI, setUseAI] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiMode, setAiMode] = useState('generate');
    const [generatedOptions, setGeneratedOptions] = useState<string[]>([]);
    const [hasMedia, setHasMedia] = useState(false);
    const [autoRepost, setAutoRepost] = useState(false);

    const aiSuggestions: Record<string, string[]> = {
      generate: [
        '🎯 5 نصائح ذهبية للإنتاجية:\n\n1️⃣ ابدأ يومك بأهم مهمة\n2️⃣ خصص وقتاً للتركيز العميق\n3️⃣ استخدم تقنية Pomodoro\n4️⃣ خذ فترات راحة منتظمة\n5️⃣ راجع إنجازاتك يومياً\n\n#إنتاجية',
        '✨ السر الأول للنجاح؟ البداية! لا تنتظر اللحظة المثالية، اللحظة المثالية هي الآن 🚀\n\n#تحفيز #نجاح',
        '💡 الفشل ليس عكس النجاح، بل هو جزء من الطريق إليه. استمر! 💪\n\n#تطوير_ذاتي'
      ],
      improve: ['🔥 ' + content + '\n\nمع لمسة من الإبداع والحماس! 💪✨', '💎 ' + content + '\n\nصياغة احترافية تجذب الانتباه! 🎯', '⭐ ' + content + '\n\nمع إضافة القيمة والتأثير 🚀'],
      hashtags: ['#تقنية #ذكاء_اصطناعي #برمجة #تطوير', '#تطوير_الذات #إنتاجية #نجاح #تحفيز', '#ريادة_أعمال #تسويق #إبداع #ابتكار']
    };

    const handleAIGenerate = () => {
      setLoading(true);
      setTimeout(() => {
        setGeneratedOptions(aiSuggestions[aiMode]);
        setLoading(false);
        setAiUsage(prev => ({...prev, [aiMode === 'generate' ? 'generate' : aiMode === 'improve' ? 'improve' : 'hashtags']: prev[aiMode === 'generate' ? 'generate' : aiMode === 'improve' ? 'improve' : 'hashtags'] + 1}));
      }, 1500);
    };

    const selectGenerated = (text: string) => {
      setContent(aiMode === 'hashtags' ? content + '\n\n' + text : text);
      setUseAI(false);
      setGeneratedOptions([]);
    };

    const handleSchedule = () => {
      if (!content || !scheduledDate || !scheduledTime) return;
      const newTweet: any = {id: tweets.length + 1, content, time: `${scheduledDate} ${scheduledTime}`, location: '🌍 جميع الدول', status: 'pending', impressions: 0, likes: 0, retweets: 0, hasMedia, autoRepost};
      setTweets([newTweet, ...tweets]);
      setShowCreateModal(false);
      setContent('');
      showNotif('✅ تم جدولة التغريدة بنجاح!');
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
            <div><h2 className="text-2xl font-bold">إنشاء تغريدة جديدة</h2><p className="text-sm text-gray-500">جدول محتواك بذكاء</p></div>
            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
          </div>

          <div className="p-6 space-y-6">
            {!useAI ? (
              <>
                <div>
                  <div className="flex justify-between mb-3">
                    <label className="text-sm font-medium">محتوى التغريدة</label>
                    <div className="flex gap-2">
                      <button onClick={() => { setUseAI(true); setAiMode('generate'); }} className="text-blue-600 text-sm flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded"><Sparkles size={16} />AI</button>
                      {content && (<><button onClick={() => { setUseAI(true); setAiMode('improve'); }} className="text-purple-600 text-sm flex items-center gap-1 hover:bg-purple-50 px-2 py-1 rounded"><Zap size={16} />تحسين</button><button onClick={() => { setUseAI(true); setAiMode('hashtags'); }} className="text-green-600 text-sm flex items-center gap-1 hover:bg-green-50 px-2 py-1 rounded"><Hash size={16} />هاشتاقات</button></>)}
                    </div>
                  </div>
                  <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="اكتب تغريدتك..." className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" rows={5} maxLength={280} />
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-2">
                      <button onClick={() => setHasMedia(!hasMedia)} className={`p-2 rounded-lg border ${hasMedia ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-gray-300 text-gray-600'}`}><Image size={18} /></button>
                    </div>
                    <div className={`text-sm font-medium ${content.length > 250 ? 'text-red-600' : 'text-gray-500'}`}>{content.length}/280</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-2">📅 التاريخ</label><input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" /></div>
                  <div><label className="block text-sm font-medium mb-2">⏰ الوقت</label><input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" /></div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={autoRepost} onChange={(e) => setAutoRepost(e.target.checked)} className="w-5 h-5 text-purple-600 rounded" />
                    <div><p className="font-medium text-gray-900 flex items-center gap-2"><Repeat size={18} className="text-purple-600" />إعادة نشر تلقائية</p><p className="text-sm text-gray-600">إعادة نشر هذه التغريدة تلقائياً كل 30 يوم</p></div>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-medium hover:bg-gray-200">إلغاء</button>
                  <button onClick={handleSchedule} disabled={!content || !scheduledDate || !scheduledTime} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"><Send size={18} />جدولة</button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><Sparkles className="text-purple-600" />{aiMode === 'generate' ? '🤖 إنشاء بالـ AI' : aiMode === 'improve' ? '✨ تحسين' : '🏷️ هاشتاقات'}</h3>
                  {aiMode === 'generate' && <input type="text" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="مثال: نصائح للإنتاجية" className="w-full px-4 py-3 border rounded-xl outline-none mb-4 focus:ring-2 focus:ring-blue-500" />}
                  {generatedOptions.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {generatedOptions.map((option, idx) => (<div key={idx} onClick={() => selectGenerated(option)} className="p-4 bg-white border-2 rounded-xl hover:border-blue-400 cursor-pointer transition hover:shadow-md">{option}</div>))}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button onClick={() => { setUseAI(false); setGeneratedOptions([]); }} className="flex-1 py-3 bg-white rounded-xl border">رجوع</button>
                    <button onClick={handleAIGenerate} disabled={loading || (aiMode === 'generate' && !aiPrompt)} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">{loading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}{aiMode === 'generate' ? 'إنشاء' : aiMode === 'improve' ? 'تحسين' : 'اقتراح'}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const Dashboard = () => {
    const filteredTweets = filterStatus === 'all' ? tweets : tweets.filter(t => t.status === filterStatus);
    const pendingCount = tweets.filter(t => t.status === 'pending').length;
    const publishedCount = tweets.filter(t => t.status === 'published').length;
    
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {showNotification && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 shadow-lg flex items-center gap-3">
              <Check className="text-green-600" size={20} />
              <p className="text-green-800 font-medium">{notificationMsg}</p>
            </div>
          </div>
        )}

        <div className="flex">
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} w-64 min-h-screen border-r p-6`}>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-10 h-10 rounded-xl flex items-center justify-center"><Send className="text-white" size={20} /></div>
              <div><h1 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Twitter</h1><p className="text-xs text-gray-500">Scheduler</p></div>
            </div>

            <nav className="space-y-2 mb-8">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 font-medium border border-blue-200"><BarChart3 size={20} />لوحة التحكم</button>
              <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`}><Calendar size={20} />التقويم</button>
              <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`}><Sparkles size={20} />AI</button>
            </nav>

            <button onClick={() => setDarkMode(!darkMode)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-8 ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}>{darkMode ? <Sun size={20} /> : <Moon size={20} />}{darkMode ? 'الوضع النهاري' : 'الوضع الليلي'}</button>

            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-50 to-purple-50'} rounded-xl p-4 border ${darkMode ? 'border-gray-600' : 'border-blue-200'}`}>
              <h3 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>🤖 AI شهرياً</h3>
              {Object.entries(aiUsage).map(([key, val]) => (
                <div key={key} className="mb-2">
                  <div className="flex justify-between text-xs mb-1"><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{key === 'generate' ? '🎯 توليد' : key === 'improve' ? '✨ تحسين' : '🏷️ هاشتاقات'}</span><span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{val}/500</span></div>
                  <div className={`w-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-1.5`}><div className={`${key === 'generate' ? 'bg-blue-600' : key === 'improve' ? 'bg-purple-600' : 'bg-green-600'} h-1.5 rounded-full`} style={{width: `${(val / 500) * 100}%`}}></div></div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-6 border-t mt-8">
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-700"><div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold">{user?.avatar}</div><div className="flex-1"><p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.name}</p><p className="text-xs text-gray-500">{user?.email}</p></div></div>
            </div>
          </div>

          <div className="flex-1 p-8 overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <div><h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>مرحباً، {user?.name} 👋</h1><p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>إليك نظرة عامة على نشاطك</p></div>
              <div className="flex gap-3">
                <button onClick={() => setShowThreadModal(true)} className="bg-purple-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 shadow-lg hover:bg-purple-700"><Plus size={18} />ثريد</button>
                <button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg"><Plus size={20} />تغريدة</button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-6">
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl p-6 border`}><div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4"><Send size={24} /></div><p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>مجدولة</p><p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{pendingCount}</p></div>
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl p-6 border`}><div className="bg-green-100 text-green-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4"><Check size={24} /></div><p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>منشورة</p><p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{publishedCount}</p></div>
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl p-6 border`}><div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4"><BarChart3 size={24} /></div><p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>معدل التفاعل</p><p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>8.5%</p></div>
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl p-6 border`}><div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4"><Sparkles size={24} /></div><p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>استخدام AI</p><p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{aiUsage.generate + aiUsage.improve + aiUsage.hashtags}</p></div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl p-6 border`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>📅 التغريدات</h2>
                <div className="flex gap-2">
                  <button onClick={() => setFilterStatus('all')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filterStatus === 'all' ? 'bg-blue-100 text-blue-600' : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>الكل ({tweets.length})</button>
                  <button onClick={() => setFilterStatus('pending')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filterStatus === 'pending' ? 'bg-yellow-100 text-yellow-600' : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>مجدولة ({pendingCount})</button>
                  <button onClick={() => setFilterStatus('published')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filterStatus === 'published' ? 'bg-green-100 text-green-600' : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>منشورة ({publishedCount})</button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredTweets.map(tweet => (
                  <div key={tweet.id} className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-xl p-5 hover:shadow-lg transition`}>
                    <div className="flex justify-between mb-3">
                      <div className="flex-1">
                        <p className={`${darkMode ? 'text-gray-100' : 'text-gray-900'} leading-relaxed mb-2`}>{tweet.content}</p>
                        {tweet.hasMedia && <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs flex items-center gap-1 inline-flex"><Image size={12} />صورة</span>}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ml-4 h-fit ${tweet.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{tweet.status === 'pending' ? '⏳ قيد الانتظار' : '✅ منشور'}</span>
                    </div>
                    <div className={`flex items-center gap-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                      <span className="flex items-center gap-1"><Clock size={14} />{tweet.time}</span>
                      <span className="flex items-center gap-1"><Globe size={14} />{tweet.location}</span>
                    </div>
                    {tweet.status === 'published' && (
                      <div className={`flex gap-6 pt-3 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'} text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="flex items-center gap-1.5 font-medium"><Eye size={14} />{tweet.impressions.toLocaleString()}</span>
                        <span className="font-medium">❤️ {tweet.likes}</span>
                        <span className="font-medium">🔁 {tweet.retweets}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {showCreateModal && <CreateTweetModal />}
      </div>
    );
  };

  if (currentPage === 'login') return <LoginPage />;
  return <Dashboard />;
}
