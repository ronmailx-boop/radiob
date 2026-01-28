
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Home, 
  ShoppingCart, 
  Wallet, 
  StickyNote, 
  Bell, 
  Plus, 
  Search, 
  Settings, 
  LogOut, 
  TrendingUp, 
  PieChart, 
  BrainCircuit,
  Trash2,
  CheckCircle2,
  Clock,
  ChevronLeft
} from 'lucide-react';
import { 
  AppView, 
  ShoppingList, 
  CashTransaction, 
  Note, 
  Reminder, 
  TransactionType,
  ShoppingItem
} from './types';
import { getBudgetAdvice } from './services/geminiService';

// UI Components
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-4 ${className}`}>
    {children}
  </div>
);

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [isNewUser, setIsNewUser] = useState(true);
  
  // State for different modules
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  
  // AI Insight
  const [aiInsight, setAiInsight] = useState<string>("מנתח את הנתונים שלך...");

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('vplus_pro_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      setShoppingLists(parsed.shoppingLists || []);
      setCashTransactions(parsed.cashTransactions || []);
      setNotes(parsed.notes || []);
      setReminders(parsed.reminders || []);
      setIsNewUser(false);
    }
  }, []);

  useEffect(() => {
    const data = { shoppingLists, cashTransactions, notes, reminders };
    localStorage.setItem('vplus_pro_data', JSON.stringify(data));
  }, [shoppingLists, cashTransactions, notes, reminders]);

  const fetchAIInsight = useCallback(async () => {
    const totalCash = cashTransactions.reduce((acc, t) => 
      t.type === TransactionType.INCOME ? acc + t.amount : acc - t.amount, 0);
    const totalShopping = shoppingLists.reduce((acc, l) => 
      acc + l.items.reduce((sum, i) => sum + (i.price * i.qty), 0), 0);
    
    const context = `יתרת מזומן: ${totalCash} ש"ח. הוצאות קניות: ${totalShopping} ש"ח. מספר תזכורות פתוחות: ${reminders.filter(r => !r.completed).length}.`;
    const advice = await getBudgetAdvice(context);
    setAiInsight(advice || "המשך כך! ניהול נכון הוא המפתח לחופש כלכלי.");
  }, [cashTransactions, shoppingLists, reminders]);

  useEffect(() => {
    if (activeView === 'dashboard') {
      fetchAIInsight();
    }
  }, [activeView, fetchAIInsight]);

  // Dashboard Stats
  const totalBalance = cashTransactions.reduce((acc, t) => 
    t.type === TransactionType.INCOME ? acc + t.amount : acc - t.amount, 0);

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">שלום, משתמש Vplus</h1>
          <p className="text-slate-500 text-sm">הנה תמונת המצב הפיננסית שלך להיום</p>
        </div>
        <button className="p-2 bg-indigo-50 text-indigo-600 rounded-full">
          <Settings size={20} />
        </button>
      </header>

      <section className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white border-none">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-white/20 rounded-lg"><Wallet size={18} /></div>
            <TrendingUp size={18} className="opacity-60" />
          </div>
          <p className="text-xs opacity-80">יתרת מזומן</p>
          <h2 className="text-2xl font-bold">₪{totalBalance.toLocaleString()}</h2>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-white/20 rounded-lg"><ShoppingCart size={18} /></div>
            <PieChart size={18} className="opacity-60" />
          </div>
          <p className="text-xs opacity-80">תקציב קניות</p>
          <h2 className="text-2xl font-bold">₪{shoppingLists.reduce((a, b) => a + b.budget, 0).toLocaleString()}</h2>
        </Card>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3 text-indigo-600">
          <BrainCircuit size={20} />
          <h3 className="font-semibold">תובנות חכמות (AI)</h3>
        </div>
        <Card className="bg-indigo-50 border-indigo-100 italic text-slate-700 leading-relaxed">
          {aiInsight}
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">פעילויות אחרונות</h3>
          <button className="text-xs text-indigo-600 font-medium">הכל</button>
        </div>
        <div className="space-y-3">
          {cashTransactions.slice(0, 3).map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-50 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${t.type === TransactionType.INCOME ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {t.type === TransactionType.INCOME ? <Plus size={16} /> : <ChevronLeft size={16} />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{t.description}</p>
                  <p className="text-[10px] text-slate-400">{new Date(t.date).toLocaleDateString('he-IL')}</p>
                </div>
              </div>
              <span className={`text-sm font-bold ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                {t.type === TransactionType.INCOME ? '+' : '-'} ₪{t.amount}
              </span>
            </div>
          ))}
          {cashTransactions.length === 0 && <p className="text-center text-slate-400 text-sm py-4">אין תנועות מזומן עדיין</p>}
        </div>
      </section>
    </div>
  );

  const renderShopping = () => {
    const addList = () => {
      const newList: ShoppingList = {
        id: Date.now().toString(),
        name: `רשימה ${shoppingLists.length + 1}`,
        items: [],
        budget: 0,
        createdAt: Date.now()
      };
      setShoppingLists([newList, ...shoppingLists]);
    };

    const addItem = (listId: string) => {
      const name = prompt("שם המוצר:");
      if (!name) return;
      const price = parseFloat(prompt("מחיר משוער:") || "0");
      setShoppingLists(shoppingLists.map(l => {
        if (l.id === listId) {
          const newItem: ShoppingItem = { id: Date.now().toString(), name, price, qty: 1, checked: false };
          return { ...l, items: [...l.items, newItem] };
        }
        return l;
      }));
    };

    const toggleItem = (listId: string, itemId: string) => {
      setShoppingLists(shoppingLists.map(l => {
        if (l.id === listId) {
          return { ...l, items: l.items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i) };
        }
        return l;
      }));
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">רשימות קניות</h1>
          <button onClick={addList} className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200">
            <Plus size={18} />
            חדש
          </button>
        </div>
        <div className="space-y-4 pb-20">
          {shoppingLists.map(list => (
            <Card key={list.id} className="p-0 overflow-hidden">
              <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800">{list.name}</h3>
                  <p className="text-[10px] text-slate-400">{new Date(list.createdAt).toLocaleDateString('he-IL')}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => addItem(list.id)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Plus size={18} /></button>
                  <button onClick={() => setShoppingLists(shoppingLists.filter(l => l.id !== list.id))} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={18} /></button>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {list.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={item.checked} 
                        onChange={() => toggleItem(list.id, item.id)}
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={`text-sm ${item.checked ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500">₪{item.price * item.qty}</span>
                  </div>
                ))}
                {list.items.length === 0 && <p className="text-center text-slate-400 text-xs py-4">הרשימה ריקה. הוסף מוצרים!</p>}
              </div>
              <div className="bg-indigo-50/30 p-3 flex justify-between items-center">
                <span className="text-xs font-medium text-slate-500">סה"כ: ₪{list.items.reduce((acc, i) => acc + (i.price * i.qty), 0)}</span>
                <span className="text-xs font-bold text-indigo-600">בתקציב</span>
              </div>
            </Card>
          ))}
          {shoppingLists.length === 0 && (
            <div className="text-center py-20 text-slate-400 space-y-2">
              <ShoppingCart size={48} className="mx-auto opacity-20" />
              <p>אין רשימות קניות עדיין</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCash = () => {
    const addTransaction = (type: TransactionType) => {
      const amount = parseFloat(prompt("סכום:") || "0");
      const description = prompt("תיאור:");
      if (!amount || !description) return;
      
      const newT: CashTransaction = {
        id: Date.now().toString(),
        amount,
        description,
        type,
        date: Date.now()
      };
      setCashTransactions([newT, ...cashTransactions]);
    };

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">ניהול מזומן</h1>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => addTransaction(TransactionType.INCOME)} className="flex flex-col items-center justify-center p-6 bg-emerald-50 text-emerald-600 rounded-2xl border-2 border-emerald-100 border-dashed hover:bg-emerald-100 transition-colors">
            <Plus size={32} />
            <span className="mt-2 font-bold">הכנסה</span>
          </button>
          <button onClick={() => addTransaction(TransactionType.EXPENSE)} className="flex flex-col items-center justify-center p-6 bg-rose-50 text-rose-600 rounded-2xl border-2 border-rose-100 border-dashed hover:bg-rose-100 transition-colors">
            <ChevronLeft size={32} />
            <span className="mt-2 font-bold">הוצאה</span>
          </button>
        </div>
        
        <section className="space-y-4">
          <h3 className="font-semibold text-slate-800">היסטוריית מזומן</h3>
          <div className="space-y-3 pb-20">
            {cashTransactions.map(t => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${t.type === TransactionType.INCOME ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {t.type === TransactionType.INCOME ? <Plus size={20} /> : <ChevronLeft size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{t.description}</p>
                    <p className="text-xs text-slate-400">{new Date(t.date).toLocaleDateString('he-IL')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'} ₪{t.amount}
                  </p>
                  <button onClick={() => setCashTransactions(cashTransactions.filter(x => x.id !== t.id))} className="text-[10px] text-slate-300 hover:text-rose-400">מחיקה</button>
                </div>
              </div>
            ))}
            {cashTransactions.length === 0 && (
              <div className="text-center py-20 text-slate-400 space-y-2">
                <Wallet size={48} className="mx-auto opacity-20" />
                <p>אין היסטוריית מזומן עדיין</p>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  };

  const renderNotes = () => {
    const addNote = () => {
      const title = prompt("כותרת הפתק:") || "פתק חדש";
      const content = prompt("תוכן הפתק:") || "";
      const colors = ['bg-amber-100', 'bg-blue-100', 'bg-emerald-100', 'bg-rose-100', 'bg-violet-100'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const newNote: Note = {
        id: Date.now().toString(),
        title,
        content,
        color: randomColor,
        updatedAt: Date.now()
      };
      setNotes([newNote, ...notes]);
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">פתקים ורעיונות</h1>
          <button onClick={addNote} className="bg-indigo-600 text-white p-2 rounded-full shadow-lg">
            <Plus size={24} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 pb-20">
          {notes.map(note => (
            <Card key={note.id} className={`${note.color} border-none rotate-1 shadow-md hover:rotate-0 transition-transform cursor-pointer relative`}>
              <button onClick={(e) => { e.stopPropagation(); setNotes(notes.filter(n => n.id !== note.id)) }} className="absolute top-2 left-2 text-black/20 hover:text-rose-500">
                <Trash2 size={14} />
              </button>
              <h4 className="font-bold text-slate-800 mb-2">{note.title}</h4>
              <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed">{note.content}</p>
              <p className="mt-4 text-[8px] text-slate-400 text-left">{new Date(note.updatedAt).toLocaleDateString('he-IL')}</p>
            </Card>
          ))}
          {notes.length === 0 && (
            <div className="col-span-2 text-center py-20 text-slate-400 space-y-2">
              <StickyNote size={48} className="mx-auto opacity-20" />
              <p>כתוב פתק ראשון!</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderReminders = () => {
    const addReminder = () => {
      const text = prompt("מה להזכיר?") || "";
      const dueDate = prompt("מתי? (YYYY-MM-DD)") || new Date().toISOString().split('T')[0];
      if (!text) return;
      
      const newR: Reminder = {
        id: Date.now().toString(),
        text,
        dueDate,
        completed: false
      };
      setReminders([newR, ...reminders]);
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">תזכורות</h1>
          <button onClick={addReminder} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold">הוסף תזכורת</button>
        </div>
        <div className="space-y-3 pb-20">
          {reminders.map(r => (
            <div key={r.id} className={`flex items-center justify-between p-4 bg-white rounded-2xl border ${r.completed ? 'opacity-50' : 'border-slate-100 shadow-sm'}`}>
              <div className="flex items-center gap-4">
                <button onClick={() => setReminders(reminders.map(rem => rem.id === r.id ? { ...rem, completed: !rem.completed } : rem))} 
                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${r.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200'}`}>
                  {r.completed && <CheckCircle2 size={16} />}
                </button>
                <div>
                  <p className={`font-bold ${r.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{r.text}</p>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                    <Clock size={10} />
                    <span>{r.dueDate}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setReminders(reminders.filter(rem => rem.id !== r.id))} className="text-slate-300 hover:text-rose-500">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {reminders.length === 0 && (
            <div className="text-center py-20 text-slate-400 space-y-2">
              <Bell size={48} className="mx-auto opacity-20" />
              <p>הכל מעודכן. אין תזכורות!</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderView = () => {
    switch(activeView) {
      case 'dashboard': return renderDashboard();
      case 'shopping': return renderShopping();
      case 'cash': return renderCash();
      case 'notes': return renderNotes();
      case 'reminders': return renderReminders();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-slate-50 flex flex-col relative pb-24 px-4 pt-6">
      
      {/* Intro Modal (Tell me first) */}
      {isNewUser && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 text-right">
          <Card className="max-w-md w-full p-8 space-y-6">
            <h2 className="text-3xl font-black text-indigo-600">ברוכים הבאים ל-Vplus Pro!</h2>
            <div className="space-y-4 text-slate-700 leading-relaxed">
              <p className="font-bold">ביקשת, קיבלת. הנה מה שחדש באפליקציה:</p>
              <ul className="space-y-2 list-disc list-inside">
                <li><span className="font-bold">ניהול מזומן:</span> מעקב מלא אחרי הכנסות והוצאות במזומן מחוץ לבנק.</li>
                <li><span className="font-bold">פתקים חכמים:</span> מקום לכל הרעיונות והמחשבות שלך.</li>
                <li><span className="font-bold">תזכורות:</span> שלא תשכח שום משימה או קנייה חשובה.</li>
                <li><span className="font-bold">עוזר AI:</span> מערכת בינה מלאכותית מבוססת Gemini שנותנת תובנות על המצב הכלכלי שלך.</li>
                <li><span className="font-bold">ממשק חדש:</span> עיצוב מודרני, מהיר ונוח לשימוש בנייד.</li>
              </ul>
            </div>
            <button 
              onClick={() => setIsNewUser(false)} 
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-200 active:scale-95 transition-transform">
              בואו נתחיל!
            </button>
          </Card>
        </div>
      )}

      {renderView()}

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex justify-between items-center rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50">
        <NavButton active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={<Home size={22} />} label="בית" />
        <NavButton active={activeView === 'shopping'} onClick={() => setActiveView('shopping')} icon={<ShoppingCart size={22} />} label="קניות" />
        <NavButton active={activeView === 'cash'} onClick={() => setActiveView('cash')} icon={<Wallet size={22} />} label="מזומן" />
        <NavButton active={activeView === 'notes'} onClick={() => setActiveView('notes')} icon={<StickyNote size={22} />} label="פתקים" />
        <NavButton active={activeView === 'reminders'} onClick={() => setActiveView('reminders')} icon={<Bell size={22} />} label="תזכורות" />
      </nav>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
    <div className={`p-2 rounded-xl ${active ? 'bg-indigo-50 shadow-sm' : ''}`}>
      {icon}
    </div>
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

export default App;
