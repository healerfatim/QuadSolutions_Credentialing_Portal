import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LogIn, UserPlus, ShieldCheck, FileText, CheckCircle, 
  X, LogOut, ArrowRight, Activity, Upload, LayoutDashboard, Users, MessageCircle, AlertCircle
} from 'lucide-react';

const Login = () => {
  // --- CORE STATE ---
  const [view, setView] = useState('landing'); 
  const [activeTab, setActiveTab] = useState('services'); 
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  
  // --- DATA STATE ---
  const [userRequests, setUserRequests] = useState([]); 
  const [adminRequests, setAdminRequests] = useState([]); 
  const [stats, setStats] = useState({ users: 0, pending: 0, approved: 0 });
  const [selectedFileName, setSelectedFileName] = useState("");
  const [appType, setAppType] = useState("");
  const [licenseNo, setLicenseNo] = useState("");

  // --- 1. DATA SYNCHRONIZATION ---
  const syncData = async () => {
    const role = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    if (!localStorage.getItem('token')) return;

    setLoading(true);
    try {
      if (role === 'admin') {
        const res = await axios.get('http://localhost:5000/api/admin/dashboard');
        setAdminRequests(res.data.requests);
        setStats({ users: res.data.usersCount, pending: res.data.pendingCount, approved: res.data.approvedCount });
        setView('admin-dashboard');
      } else {
        const res = await axios.get(`http://localhost:5000/api/requests/user/${userId}`);
        setUserRequests(res.data);
        setView('dashboard');
      }
    } catch (e) { console.error("Sync Failed", e); }
    finally { setLoading(false); }
  };

  useEffect(() => { syncData(); }, []);

  // --- 2. AUTHENTICATION (USER SIDE) ---
  const handleAuth = async (e) => {
    e.preventDefault();
    const isLogin = (view === 'login' || view === 'admin-login');
    const endpoint = isLogin ? 'login' : 'register';
    
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/${endpoint}`, formData);
      if (isLogin) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userRole', (formData.email === "sk@gmail.com" || res.data.user.role === 'admin') ? 'admin' : 'user');
        localStorage.setItem('userId', res.data.user._id);
        localStorage.setItem('userName', res.data.user.name);
        await syncData();
      } else {
        alert("Registration Successful! Please login.");
        setView('login');
      }
    } catch (e) { alert(isLogin ? "Login Failed: Check Credentials" : "Registration Failed: Email taken"); }
  };

  // --- 3. SUBMISSION LOGIC (USER SIDE) ---
  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedFileName) return alert("Please upload a document");
    
    try {
      await axios.post('http://localhost:5000/api/requests/submit', {
        userId: localStorage.getItem('userId'),
        userName: localStorage.getItem('userName'),
        type: appType,
        licenseNumber: licenseNo,
        documentUrl: selectedFileName
      });
      alert("Application Submitted Successfully!");
      setShowModal(false);
      setLicenseNo(""); setSelectedFileName("");
      syncData();
      setActiveTab('tracking');
    } catch (e) { alert("Submission Failed"); }
  };

  const sendSupport = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/support/ticket', {
      userId: localStorage.getItem('userId'),
      userName: localStorage.getItem('userName'),
      message: e.target[0].value
    });
    alert("Ticket Dispatched to Support Team!");
    setShowSupport(false);
  };

  // --- 4. MODERATION LOGIC (ADMIN SIDE) ---
  const updateStatus = async (id, status) => {
    await axios.put(`http://localhost:5000/api/admin/status/${id}`, { status });
    syncData();
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-black tracking-widest">CONNECTING TO SECURE REGISTRY...</div>;

  // ==========================================
  // VIEW: ADMIN PANEL
  // ==========================================
  if (view === 'admin-dashboard') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
        <nav className="p-6 border-b border-slate-900 flex justify-between bg-black/40 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-3"><LayoutDashboard className="text-blue-500" /><h1 className="text-xl font-black uppercase italic tracking-tighter">Admin Control</h1></div>
          <button onClick={() => {localStorage.clear(); window.location.reload();}} className="bg-red-600/20 text-red-500 border border-red-500/20 px-6 py-2 rounded-xl font-black hover:bg-red-600 hover:text-white transition">Logout</button>
        </nav>
        <main className="p-10 max-w-7xl mx-auto w-full">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="bg-slate-900 p-10 rounded-3xl border border-slate-800 shadow-2xl"><p className="text-slate-500 text-[10px] font-black uppercase">Total Clients</p><h4 className="text-6xl font-black">{stats.users}</h4></div>
              <div className="bg-slate-900 p-10 rounded-3xl border border-slate-800 border-l-4 border-l-yellow-500 shadow-2xl"><p className="text-slate-500 text-[10px] font-black uppercase">Pending Review</p><h4 className="text-6xl font-black text-yellow-500">{stats.pending}</h4></div>
              <div className="bg-slate-900 p-10 rounded-3xl border border-slate-800 border-l-4 border-l-green-500 shadow-2xl"><p className="text-slate-500 text-[10px] font-black uppercase">Approved Apps</p><h4 className="text-6xl font-black text-green-500">{stats.approved}</h4></div>
           </div>
           <div className="bg-slate-900 rounded-[3rem] border border-slate-800 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-black/40 text-slate-500 text-[10px] font-black uppercase border-b border-slate-800">
                  <tr><th className="p-8">Provider</th><th className="p-8">Service</th><th className="p-8">Document</th><th className="p-8">Status</th><th className="p-8 text-right">Moderation</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {adminRequests.map((req) => (
                    <tr key={req._id} className="hover:bg-blue-600/5 transition">
                      <td className="p-8 font-black text-xs uppercase">{req.userName}</td>
                      <td className="p-8 text-slate-400 font-bold text-xs uppercase italic">{req.type}</td>
                      <td className="p-8 text-blue-400 font-mono text-[10px] underline">{req.documentUrl}</td>
                      <td className="p-8"><span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${req.status === 'Approved' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{req.status}</span></td>
                      <td className="p-8 text-right space-x-2">
                        <button onClick={() => updateStatus(req._id, 'Approved')} className="bg-green-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase shadow-lg">Approve</button>
                        <button onClick={() => updateStatus(req._id, 'Rejected')} className="bg-red-600/20 text-red-500 px-3 py-1 rounded-lg text-[9px] font-black border border-red-500/20">Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // VIEW: LANDING & AUTH
  // ==========================================
  if (['landing', 'login', 'register', 'admin-login'].includes(view)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        {view === 'landing' ? (
          <div className="max-w-4xl w-full">
            <h1 className="text-5xl font-black text-slate-900 mb-12 italic uppercase tracking-tighter underline decoration-blue-600 decoration-8 underline-offset-8">QUAD SOLUTIONS</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div onClick={() => setView('register')} className="bg-white p-10 rounded-[3rem] shadow-xl border-2 border-transparent hover:border-blue-600 cursor-pointer transition text-left group">
                <UserPlus className="text-blue-600 mb-4 group-hover:scale-110 transition" size={32} />
                <h2 className="text-2xl font-black">New Providers</h2>
                <div className="text-blue-600 font-bold mt-2 uppercase text-xs">Get Credentials <ArrowRight className="inline ml-2" /></div>
              </div>
              <div onClick={() => setView('login')} className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-xl border-2 border-transparent hover:border-blue-400 cursor-pointer transition text-left group">
                <LogIn className="text-blue-400 mb-4 group-hover:scale-110 transition" size={32} />
                <h2 className="text-2xl font-black text-blue-400">Existing Clients</h2>
                <div className="text-blue-400 font-bold mt-2 uppercase text-xs">Sign In <ArrowRight className="inline ml-2" /></div>
              </div>
            </div>
            <footer className="mt-20"><button onClick={() => setView('admin-login')} className="bg-white border px-6 py-2 rounded-full text-[10px] font-black uppercase text-slate-300 hover:text-blue-600 transition tracking-widest"><ShieldCheck className="inline mr-2" size={14}/> Internal Admin Access</button></footer>
          </div>
        ) : (
          <div className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-2xl relative">
            <button onClick={() => setView('landing')} className="absolute top-8 right-8 text-slate-300 font-bold">Back</button>
            <h2 className="text-3xl font-black mb-8 italic uppercase underline decoration-blue-600 decoration-4 underline-offset-8">{view.replace('-', ' ')}</h2>
            <form onSubmit={handleAuth} className="space-y-4 text-left">
              {view === 'register' && <input type="text" placeholder="Full Name" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />}
              <input type="email" placeholder="Email Address" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              <input type="password" placeholder="Password" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
              <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:scale-[1.02] transition">Continue</button>
            </form>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW: USER DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-black text-blue-600 italic">QUAD SOLUTIONS</h1>
        <div className="flex gap-4">
           <button onClick={() => setActiveTab('services')} className={`px-4 py-2 rounded-xl text-sm font-bold ${activeTab === 'services' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>Services</button>
           <button onClick={() => setActiveTab('tracking')} className={`px-4 py-2 rounded-xl text-sm font-bold ${activeTab === 'tracking' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>Tracking</button>
           <button onClick={() => {localStorage.clear(); window.location.reload();}} className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition"><LogOut size={20}/></button>
        </div>
      </nav>

      <main className="p-10 max-w-5xl mx-auto">
        {activeTab === 'services' ? (
          <div>
            <h2 className="text-3xl font-black mb-8 italic uppercase underline decoration-blue-600 underline-offset-8 decoration-4">Service Catalog</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Medical License Renewal', 'Insurance Enrollment', 'DEA Certification'].map(t => (
                <div key={t} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition group">
                   <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors"><FileText/></div>
                   <h3 className="text-xl font-bold mb-4 tracking-tighter uppercase italic">{t}</h3>
                   <button onClick={() => { setAppType(t); setShowModal(true); }} className="w-full bg-slate-900 text-white py-3 rounded-xl font-black uppercase text-[10px] hover:bg-blue-600 transition tracking-widest italic">Apply Now</button>
                </div>
              ))}
            </div>
            <div className="mt-16 bg-blue-600 rounded-[3rem] p-12 text-white flex justify-between items-center shadow-2xl">
               <div><h3 className="text-2xl font-black italic uppercase">Contact Support</h3><p className="font-medium opacity-80">Professional help available 24/7.</p></div>
               <button onClick={() => setShowSupport(true)} className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition shadow-lg"><MessageCircle/> Open Ticket</button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-black mb-8 italic uppercase tracking-tighter underline decoration-4 decoration-blue-600 underline-offset-8">Registry Status</h2>
            <div className="space-y-4">
               {userRequests.map((r, i) => (
                 <div key={r._id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white"><span className="text-lg font-black italic">0{i+1}</span></div>
                        <div><h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">{r.type}</h3><p className="text-slate-400 font-bold text-[9px] uppercase mt-1 tracking-widest">Status: {r.status}</p></div>
                    </div>
                    <div className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${r.status === 'Approved' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>{r.status}</div>
                 </div>
               ))}
               {userRequests.length === 0 && <div className="p-20 text-center text-slate-300 font-black uppercase italic border-2 border-dashed rounded-[3rem]">No records in database</div>}
            </div>
          </div>
        )}
      </main>

      {/* --- SUBMISSION FORM --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 animate-in zoom-in shadow-2xl">
            <h2 className="text-2xl font-black mb-8 text-blue-600 uppercase italic tracking-tighter">New Application</h2>
            <form onSubmit={handleApply} className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase italic">Category: {appType}</p>
              <input type="text" placeholder="License / ID Number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none shadow-sm" value={licenseNo} onChange={e => setLicenseNo(e.target.value)} required />
              <div onClick={async () => {try {const [fh]=await window.showOpenFilePicker(); const f=await fh.getFile(); setSelectedFileName(f.name);} catch (e) {}}} className="p-10 bg-blue-50 border-2 border-dashed border-blue-200 rounded-[2rem] cursor-pointer text-center group hover:bg-blue-100 transition">
                <Upload className="mx-auto text-blue-400 mb-2 group-hover:scale-110 transition" size={32}/><p className="text-[10px] font-black uppercase text-blue-600 tracking-tighter">{selectedFileName || "Select Proof of Identity"}</p>
              </div>
              <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl uppercase italic tracking-widest">Submit Information</button>
              <button type="button" onClick={() => setShowModal(false)} className="w-full bg-slate-100 text-slate-400 py-4 rounded-2xl font-black uppercase text-[10px] hover:bg-red-50 hover:text-red-500 transition tracking-widest mt-2">Discard Application</button>
            </form>
          </div>
        </div>
      )}

      {/* --- SUPPORT MODAL --- */}
      {showSupport && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[200]">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in">
             <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-black text-blue-600 uppercase italic">Help Desk</h2><button onClick={() => setShowSupport(false)}><X className="text-slate-300 hover:text-red-500"/></button></div>
             <form onSubmit={sendSupport} className="space-y-4">
                <textarea className="w-full p-6 bg-slate-50 rounded-2xl h-40 outline-none font-bold text-slate-700 shadow-inner" placeholder="How can we assist you?" required></textarea>
                <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase italic tracking-widest shadow-lg shadow-blue-100">Send Ticket</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;