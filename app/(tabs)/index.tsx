import React, { useEffect, useState } from 'react';
import {
  Modal, SafeAreaView, ScrollView, StatusBar, StyleSheet,
  Text, TextInput, TouchableOpacity, View
} from 'react-native';

type TxType = 'income' | 'expense';
type Lang = 'th' | 'en';
type Transaction = {
  id: string; type: TxType; category: string;
  amount: number; note: string; date: string; month: string;
};

const EXPENSE_CATS = {
  th: ['🐄 ค่าอาหารวัว','💊 ค่ายา/หมอ','🚛 ค่าขนส่ง','👷 ค่าแรง','🌾 ค่าที่ดิน/เช่า','🔧 ค่าอุปกรณ์','📦 อื่นๆ'],
  en: ['🐄 Feed','💊 Vet/Medicine','🚛 Transport','👷 Labor','🌾 Land/Rent','🔧 Equipment','📦 Other'],
};
const INCOME_CATS = {
  th: ['💰 ขายวัว','🥛 ขายนม','🌾 ขายปุ๋ย','📦 อื่นๆ'],
  en: ['💰 Sell Cattle','🥛 Sell Milk','🌾 Sell Manure','📦 Other'],
};
const MONTHS_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const T = {
  th: {
    appName:'บัญชีฟาร์มวัว', appSub:'รายรับ-รายจ่าย',
    dashboard:'สรุป', income:'รายรับ', expense:'รายจ่าย', report:'รายงาน',
    addIncome:'เพิ่มรายรับ', addExpense:'เพิ่มรายจ่าย',
    totalIncome:'รายรับรวม', totalExpense:'รายจ่ายรวม', profit:'กำไร', loss:'ขาดทุน',
    category:'หมวดหมู่', amount:'จำนวนเงิน (บาท)', note:'หมายเหตุ',
    save:'บันทึก', cancel:'ยกเลิก', noData:'ยังไม่มีข้อมูล',
    thisMonth:'เดือนนี้', allTime:'ทั้งหมด', selectCat:'เลือกหมวดหมู่',
    recent:'รายการล่าสุด', byCat:'รายจ่ายแยกหมวด', allTx:'รายการทั้งหมด',
    deleteConfirm:'ยืนยันการลบ', deleteMsg:'ต้องการลบรายการนี้ใช่ไหม?', delete:'ลบ',
    dateLabel:'วันที่', pickDate:'เลือกวันที่', year:'ปี', month:'เดือน', day:'วัน', confirmDate:'ยืนยัน',
    githubSettings:'ตั้งค่า GitHub', githubToken:'GitHub Token',
    githubRepo:'Repository (owner/repo)', githubFile:'ชื่อไฟล์ JSON',
    saveGH:'บันทึกไป GitHub', loadGH:'โหลดจาก GitHub',
    saving:'กำลังบันทึก...', loading:'กำลังโหลด...',
    saved:'บันทึกสำเร็จ!', loadOk:'โหลดข้อมูลสำเร็จ!', error:'เกิดข้อผิดพลาด',
    settings:'ตั้งค่า',
  },
  en: {
    appName:'Farm Finance', appSub:'Income & Expense',
    dashboard:'Summary', income:'Income', expense:'Expense', report:'Report',
    addIncome:'Add Income', addExpense:'Add Expense',
    totalIncome:'Total Income', totalExpense:'Total Expense', profit:'Profit', loss:'Loss',
    category:'Category', amount:'Amount (THB)', note:'Note',
    save:'Save', cancel:'Cancel', noData:'No data yet',
    thisMonth:'This Month', allTime:'All Time', selectCat:'Select Category',
    recent:'Recent', byCat:'Expense by Category', allTx:'All Transactions',
    deleteConfirm:'Confirm Delete', deleteMsg:'Delete this transaction?', delete:'Delete',
    dateLabel:'Date', pickDate:'Pick Date', year:'Year', month:'Month', day:'Day', confirmDate:'Confirm',
    githubSettings:'GitHub Settings', githubToken:'GitHub Token',
    githubRepo:'Repository (owner/repo)', githubFile:'JSON Filename',
    saveGH:'Save to GitHub', loadGH:'Load from GitHub',
    saving:'Saving...', loading:'Loading...',
    saved:'Saved!', loadOk:'Data loaded!', error:'Error',
    settings:'Settings',
  },
};

const sampleTx: Transaction[] = [
  { id:'1', type:'income',  category:'💰 ขายวัว',      amount:42000, note:'ขายทองคำ',           date:'2026-05-28', month:'2026-05' },
  { id:'2', type:'expense', category:'🐄 ค่าอาหารวัว', amount:5000,  note:'อาหารเดือนพฤษภาคม', date:'2026-05-01', month:'2026-05' },
  { id:'3', type:'expense', category:'💊 ค่ายา/หมอ',   amount:1500,  note:'ฉีดวัคซีน',          date:'2026-05-10', month:'2026-05' },
  { id:'4', type:'income',  category:'🥛 ขายนม',       amount:3200,  note:'นมเดือนเมษายน',      date:'2026-04-30', month:'2026-04' },
  { id:'5', type:'expense', category:'👷 ค่าแรง',      amount:8000,  note:'ค่าแรงเดือนเมษายน', date:'2026-04-30', month:'2026-04' },
  { id:'6', type:'income',  category:'💰 ขายวัว',      amount:35000, note:'ขายดาว',             date:'2026-04-15', month:'2026-04' },
  { id:'7', type:'expense', category:'🔧 ค่าอุปกรณ์', amount:4500,  note:'ซ่อมรั้ว',           date:'2026-03-20', month:'2026-03' },
  { id:'8', type:'income',  category:'🥛 ขายนม',       amount:2800,  note:'นมมีนาคม',          date:'2026-03-31', month:'2026-03' },
];

const sortDesc = (txs: Transaction[]) => [...txs].sort((a,b) => b.date.localeCompare(a.date));
const toDateStr = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
const daysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();

// ── GitHub helpers ────────────────────────────────────────────────────────────
async function githubSave(token: string, repo: string, filename: string, transactions: Transaction[]) {
  const path = `https://api.github.com/repos/${repo}/contents/${filename}`;
  let sha: string | undefined;
  try {
    const res = await fetch(path, { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' } });
    if (res.ok) { const d = await res.json(); sha = d.sha; }
  } catch(_) {}
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(transactions, null, 2))));
  const body = { message: `Update farm data ${new Date().toISOString()}`, content, ...(sha ? { sha } : {}) };
  const res = await fetch(path, {
    method: 'PUT',
    headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json', Accept: 'application/vnd.github.v3+json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub error: ${res.status}`);
}

async function githubLoad(token: string, repo: string, filename: string): Promise<Transaction[]> {
  const path = `https://api.github.com/repos/${repo}/contents/${filename}`;
  const res = await fetch(path, { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' } });
  if (!res.ok) throw new Error(`GitHub error: ${res.status}`);
  const d = await res.json();
  const text = decodeURIComponent(escape(atob(d.content.replace(/\n/g, ''))));
  return JSON.parse(text);
}

// ── AsyncStorage shim (works in Expo) ─────────────────────────────────────────
let AsyncStorage: any = null;
try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch(_) {}

async function loadLocal(): Promise<Transaction[] | null> {
  try {
    if (AsyncStorage) {
      const v = await AsyncStorage.getItem('farmTx');
      return v ? JSON.parse(v) : null;
    }
  } catch(_) {}
  return null;
}
async function saveLocal(txs: Transaction[]) {
  try {
    if (AsyncStorage) await AsyncStorage.setItem('farmTx', JSON.stringify(txs));
  } catch(_) {}
}
async function loadGHConfig(): Promise<any> {
  try {
    if (AsyncStorage) { const v = await AsyncStorage.getItem('ghConfig'); return v ? JSON.parse(v) : {}; }
  } catch(_) {}
  return {};
}
async function saveGHConfig(cfg: any) {
  try { if (AsyncStorage) await AsyncStorage.setItem('ghConfig', JSON.stringify(cfg)); } catch(_) {}
}

// ── Inline Date Picker ────────────────────────────────────────────────────────
const InlineDatePicker = ({ visible, initialDate, lang, accentColor, onConfirm, onCancel }: any) => {
  const tl = T[lang as Lang];
  const parsed = (initialDate || '2026-01-01').split('-').map(Number);
  const [selY, setSelY] = useState(parsed[0]);
  const [selM, setSelM] = useState(parsed[1]);
  const [selD, setSelD] = useState(parsed[2]);

  useEffect(() => {
    if (visible) {
      const p = (initialDate || '2026-01-01').split('-').map(Number);
      setSelY(p[0]); setSelM(p[1]); setSelD(p[2]);
    }
  }, [visible, initialDate]);

  if (!visible) return null;
  const nowYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_,i) => nowYear - 5 + i);
  const months = lang === 'th' ? MONTHS_TH : MONTHS_EN;
  const days = Array.from({ length: daysInMonth(selY, selM) }, (_,i) => i+1);
  const clampedD = Math.min(selD, daysInMonth(selY, selM));

  return (
    <View style={dpS.overlay}>
      <View style={dpS.box}>
        <Text style={dpS.title}>{tl.pickDate}</Text>

        <Text style={dpS.colLabel}>{tl.year}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={dpS.row}>
          {years.map(y => (
            <TouchableOpacity key={y} style={[dpS.chip, selY===y && {backgroundColor:accentColor}]} onPress={() => setSelY(y)}>
              <Text style={[dpS.chipText, selY===y && dpS.chipActive]}>{lang==='th' ? y+543 : y}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={dpS.colLabel}>{tl.month}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={dpS.row}>
          {months.map((mn,i) => (
            <TouchableOpacity key={i} style={[dpS.chip, selM===i+1 && {backgroundColor:accentColor}]} onPress={() => setSelM(i+1)}>
              <Text style={[dpS.chipText, selM===i+1 && dpS.chipActive]}>{mn}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={dpS.colLabel}>{tl.day}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={dpS.row}>
          {days.map(d => (
            <TouchableOpacity key={d} style={[dpS.chip, clampedD===d && {backgroundColor:accentColor}]} onPress={() => setSelD(d)}>
              <Text style={[dpS.chipText, clampedD===d && dpS.chipActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={dpS.preview}>
          📅 {lang==='th' ? `${clampedD} ${MONTHS_TH[selM-1]} ${selY+543}` : `${clampedD} ${MONTHS_EN[selM-1]} ${selY}`}
        </Text>
        <View style={dpS.btns}>
          <TouchableOpacity style={dpS.cancelBtn} onPress={onCancel}>
            <Text style={dpS.cancelText}>{tl.cancel}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[dpS.confirmBtn, {backgroundColor:accentColor}]} onPress={() => onConfirm(toDateStr(selY, selM, clampedD))}>
            <Text style={dpS.confirmText}>{tl.confirmDate}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
const dpS = StyleSheet.create({
  overlay:    { ...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,0.45)', justifyContent:'center', alignItems:'center', zIndex:200 },
  box:        { backgroundColor:'#fff', borderRadius:20, padding:20, width:'90%' },
  title:      { fontSize:16, fontWeight:'bold', color:'#333', marginBottom:14, textAlign:'center' },
  colLabel:   { fontSize:12, color:'#888', marginBottom:6, marginTop:4 },
  row:        { marginBottom:8 },
  chip:       { paddingHorizontal:14, paddingVertical:8, borderRadius:20, backgroundColor:'#f0f0f0', marginRight:6 },
  chipText:   { fontSize:13, color:'#555' },
  chipActive: { color:'#fff', fontWeight:'bold' },
  preview:    { textAlign:'center', fontSize:15, fontWeight:'bold', color:'#333', marginVertical:14 },
  btns:       { flexDirection:'row', gap:10 },
  cancelBtn:  { flex:1, borderWidth:1, borderColor:'#ddd', borderRadius:10, padding:12, alignItems:'center' },
  cancelText: { color:'#666', fontSize:14 },
  confirmBtn: { flex:1, borderRadius:10, padding:12, alignItems:'center' },
  confirmText:{ color:'#fff', fontSize:14, fontWeight:'bold' },
});

// ── Custom Confirm Dialog (replaces Alert — works on web too) ─────────────────
const ConfirmDialog = ({ visible, title, message, confirmText, onConfirm, onCancel }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={cdS.overlay}>
      <View style={cdS.box}>
        <Text style={cdS.title}>{title}</Text>
        <Text style={cdS.msg}>{message}</Text>
        <View style={cdS.btns}>
          <TouchableOpacity style={cdS.cancelBtn} onPress={onCancel}>
            <Text style={cdS.cancelText}>ยกเลิก</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cdS.deleteBtn} onPress={onConfirm}>
            <Text style={cdS.deleteText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);
const cdS = StyleSheet.create({
  overlay:   { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center' },
  box:       { backgroundColor:'#fff', borderRadius:16, padding:24, width:300, maxWidth:'85%' },
  title:     { fontSize:16, fontWeight:'bold', color:'#333', marginBottom:8 },
  msg:       { fontSize:14, color:'#666', marginBottom:20 },
  btns:      { flexDirection:'row', gap:10 },
  cancelBtn: { flex:1, borderWidth:1, borderColor:'#ddd', borderRadius:10, padding:12, alignItems:'center' },
  cancelText:{ color:'#666', fontSize:14 },
  deleteBtn: { flex:1, backgroundColor:'#c0392b', borderRadius:10, padding:12, alignItems:'center' },
  deleteText:{ color:'#fff', fontSize:14, fontWeight:'bold' },
});

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type }: { msg:string, type:string }) => {
  if (!msg) return null;
  return (
    <View style={[toastS.box, { backgroundColor: type==='error' ? '#c0392b' : '#1a6b3c' }]}>
      <Text style={toastS.text}>{msg}</Text>
    </View>
  );
};
const toastS = StyleSheet.create({
  box:  { position:'absolute', top:60, alignSelf:'center', paddingHorizontal:20, paddingVertical:10, borderRadius:20, zIndex:999 },
  text: { color:'#fff', fontSize:14, fontWeight:'bold' },
});

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang]           = useState<Lang>('th');
  const [tab, setTab]             = useState<'dashboard'|'income'|'expense'|'report'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(sampleTx);
  const [showModal, setShowModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSettings, setShowSettings]     = useState(false);
  const [modalType, setModalType] = useState<TxType>('income');
  const [form, setForm]           = useState({ category:'', amount:'', note:'', date:'' });
  const [reportMonth, setReportMonth] = useState('2026-05');
  const [confirmDialog, setConfirmDialog] = useState({ visible:false, id:'' });
  const [toast, setToast]         = useState({ msg:'', type:'ok' });
  const [ghConfig, setGhConfig]   = useState({ token:'', repo:'', file:'transactions.json' });
  const [ghStatus, setGhStatus]   = useState({ msg:'', type:'ok' });
  const [ghBusy, setGhBusy]       = useState(false);

  const tl = T[lang];
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const todayStr     = now.toISOString().split('T')[0];

  // Load persisted data on mount
  useEffect(() => {
    loadLocal().then(saved => { if (saved) setTransactions(saved); });
    loadGHConfig().then(cfg => { if (cfg && Object.keys(cfg).length) setGhConfig(cfg); });
  }, []);

  // Auto-save transactions locally on every change
  useEffect(() => { saveLocal(transactions); }, [transactions]);

  const showToast = (msg: string, type='ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg:'', type:'ok' }), 2500);
  };

  const monthTx     = (m: string) => transactions.filter(tx => tx.month === m);
  const thisMonthTx = monthTx(currentMonth);
  const thisIncome  = thisMonthTx.filter(t => t.type==='income').reduce((s,t) => s+t.amount, 0);
  const thisExpense = thisMonthTx.filter(t => t.type==='expense').reduce((s,t) => s+t.amount, 0);
  const thisProfit  = thisIncome - thisExpense;
  const allIncome   = transactions.filter(t => t.type==='income').reduce((s,t) => s+t.amount, 0);
  const allExpense  = transactions.filter(t => t.type==='expense').reduce((s,t) => s+t.amount, 0);
  const allMonths   = [...new Set(transactions.map(t => t.month))].sort().reverse();

  const openModal = (type: TxType) => {
    setModalType(type);
    setForm({ category:'', amount:'', note:'', date:todayStr });
    setShowModal(true);
  };

  const saveTransaction = () => {
    if (!form.category || !form.amount || !form.date) return;
    const [y,m] = form.date.split('-');
    const month = `${y}-${m}`;
    setTransactions(prev => [
      { id:Date.now().toString(), type:modalType, category:form.category, amount:parseInt(form.amount), note:form.note, date:form.date, month },
      ...prev,
    ]);
    setShowModal(false);
  };

  const askDelete = (id: string) => setConfirmDialog({ visible:true, id });
  const doDelete  = () => {
    setTransactions(prev => prev.filter(tx => tx.id !== confirmDialog.id));
    setConfirmDialog({ visible:false, id:'' });
  };

  const handleSaveGH = async () => {
    setGhBusy(true);
    try {
      await githubSave(ghConfig.token, ghConfig.repo, ghConfig.file || 'transactions.json', transactions);
      setGhStatus({ msg: tl.saved, type:'ok' });
      showToast(tl.saved);
    } catch(e: any) {
      setGhStatus({ msg:`${tl.error}: ${e.message}`, type:'error' });
      showToast(`${tl.error}: ${e.message}`, 'error');
    }
    setGhBusy(false);
  };

  const handleLoadGH = async () => {
    setGhBusy(true);
    try {
      const data = await githubLoad(ghConfig.token, ghConfig.repo, ghConfig.file || 'transactions.json');
      setTransactions(data);
      setGhStatus({ msg: tl.loadOk, type:'ok' });
      showToast(tl.loadOk);
    } catch(e: any) {
      setGhStatus({ msg:`${tl.error}: ${e.message}`, type:'error' });
      showToast(`${tl.error}: ${e.message}`, 'error');
    }
    setGhBusy(false);
  };

  const saveGHSettings = () => {
    saveGHConfig(ghConfig);
    setShowSettings(false);
  };

  const reportTx      = sortDesc(monthTx(reportMonth));
  const reportIncome  = reportTx.filter(t => t.type==='income').reduce((s,t) => s+t.amount, 0);
  const reportExpense = reportTx.filter(t => t.type==='expense').reduce((s,t) => s+t.amount, 0);
  const reportProfit  = reportIncome - reportExpense;
  const cats          = modalType==='income' ? INCOME_CATS[lang] : EXPENSE_CATS[lang];
  const accentColor   = modalType==='income' ? '#1a6b3c' : '#c0392b';

  const formatMonth = (m: string) => {
    const [y,mo] = m.split('-');
    const months = lang==='th' ? MONTHS_TH : MONTHS_EN;
    return `${months[parseInt(mo)-1]} ${lang==='th' ? parseInt(y)+543 : y}`;
  };
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const [y,m,d] = dateStr.split('-').map(Number);
    const months = lang==='th' ? MONTHS_TH : MONTHS_EN;
    return lang==='th' ? `${d} ${months[m-1]} ${y+543}` : `${d} ${months[m-1]} ${y}`;
  };

  const TxRow = ({ tx }: { tx: Transaction }) => {
    const isInc = tx.type === 'income';
    const color = isInc ? '#1a6b3c' : '#c0392b';
    return (
      <View style={styles.txCard}>
        <View style={[styles.txDot, { backgroundColor:color }]} />
        <View style={styles.txInfo}>
          <Text style={styles.txCat}>{tx.category}</Text>
          <Text style={styles.txNote}>{tx.note ? tx.note+' · ' : ''}{tx.date}</Text>
        </View>
        <View style={styles.txRight}>
          <Text style={[styles.txAmount, { color }]}>{isInc?'+':'-'}฿{tx.amount.toLocaleString()}</Text>
          <TouchableOpacity style={styles.delBtn} onPress={() => askDelete(tx.id)}>
            <Text style={styles.delBtnText}>{tl.delete}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a6b3c" />

      {/* Toast */}
      <Toast msg={toast.msg} type={toast.type} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📒 {tl.appName}</Text>
          <Text style={styles.headerSub}>{tl.appSub}</Text>
        </View>
        <View style={{ flexDirection:'row', gap:8 }}>
          <TouchableOpacity style={styles.langBtn} onPress={() => setShowSettings(true)}>
            <Text style={styles.langText}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.langBtn} onPress={() => setLang(lang==='th'?'en':'th')}>
            <Text style={styles.langText}>{lang==='th'?'🇬🇧 EN':'🇹🇭 ไทย'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <View>
            <Text style={styles.sectionTitle}>📊 {tl.thisMonth} — {formatMonth(currentMonth)}</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor:'#1a6b3c' }]}>
                <Text style={styles.statNumber}>฿{thisIncome.toLocaleString()}</Text>
                <Text style={styles.statLabel}>{tl.totalIncome}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor:'#c0392b' }]}>
                <Text style={styles.statNumber}>฿{thisExpense.toLocaleString()}</Text>
                <Text style={styles.statLabel}>{tl.totalExpense}</Text>
              </View>
            </View>
            <View style={[styles.profitCard, { backgroundColor: thisProfit>=0 ? '#1a6b3c' : '#c0392b' }]}>
              <Text style={styles.profitLabel}>{thisProfit>=0 ? '📈 '+tl.profit : '📉 '+tl.loss}</Text>
              <Text style={styles.profitAmount}>฿{Math.abs(thisProfit).toLocaleString()}</Text>
            </View>
            <Text style={styles.sectionTitle}>📊 {tl.allTime}</Text>
            <View style={styles.barContainer}>
              {[{label:tl.totalIncome,val:allIncome,color:'#1a6b3c'},{label:tl.totalExpense,val:allExpense,color:'#c0392b'}].map(item=>(
                <View key={item.label} style={styles.barRow}>
                  <Text style={styles.barLabel}>{item.label}</Text>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, {
                      width:`${Math.min(100,allIncome+allExpense>0?(item.val/(allIncome+allExpense))*100:0)}%` as any,
                      backgroundColor:item.color,
                    }]} />
                  </View>
                  <Text style={styles.barValue}>฿{(item.val/1000).toFixed(0)}K</Text>
                </View>
              ))}
            </View>
            <View style={styles.quickBtns}>
              <TouchableOpacity style={[styles.quickBtn,{backgroundColor:'#1a6b3c'}]} onPress={()=>openModal('income')}>
                <Text style={styles.quickBtnText}>+ {tl.addIncome}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn,{backgroundColor:'#c0392b'}]} onPress={()=>openModal('expense')}>
                <Text style={styles.quickBtnText}>+ {tl.addExpense}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionTitle}>🕐 {tl.recent}</Text>
            {sortDesc(transactions).slice(0,5).map(tx => <TxRow key={tx.id} tx={tx} />)}
          </View>
        )}

        {/* INCOME */}
        {tab === 'income' && (
          <View>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>💰 {tl.income}</Text>
              <TouchableOpacity style={[styles.addBtn,{backgroundColor:'#1a6b3c'}]} onPress={()=>openModal('income')}>
                <Text style={styles.addBtnText}>+ {tl.addIncome}</Text>
              </TouchableOpacity>
            </View>
            {sortDesc(transactions.filter(t=>t.type==='income')).length===0
              ? <Text style={styles.noData}>{tl.noData}</Text>
              : sortDesc(transactions.filter(t=>t.type==='income')).map(tx=><TxRow key={tx.id} tx={tx}/>)}
          </View>
        )}

        {/* EXPENSE */}
        {tab === 'expense' && (
          <View>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>💸 {tl.expense}</Text>
              <TouchableOpacity style={[styles.addBtn,{backgroundColor:'#c0392b'}]} onPress={()=>openModal('expense')}>
                <Text style={styles.addBtnText}>+ {tl.addExpense}</Text>
              </TouchableOpacity>
            </View>
            {sortDesc(transactions.filter(t=>t.type==='expense')).length===0
              ? <Text style={styles.noData}>{tl.noData}</Text>
              : sortDesc(transactions.filter(t=>t.type==='expense')).map(tx=><TxRow key={tx.id} tx={tx}/>)}
          </View>
        )}

        {/* REPORT */}
        {tab === 'report' && (
          <View>
            <Text style={styles.sectionTitle}>📋 {tl.report}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
              {allMonths.map(m=>(
                <TouchableOpacity key={m} style={[styles.monthBtn, reportMonth===m && styles.monthBtnActive]} onPress={()=>setReportMonth(m)}>
                  <Text style={[styles.monthBtnText, reportMonth===m && styles.monthBtnTextActive]}>{formatMonth(m)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.reportCard}>
              <Text style={styles.reportMonthTitle}>📅 {formatMonth(reportMonth)}</Text>
              {[
                {label:`💰 ${tl.totalIncome}`,val:reportIncome,color:'#1a6b3c',big:false},
                {label:`💸 ${tl.totalExpense}`,val:reportExpense,color:'#c0392b',big:false},
                {label:`📊 ${reportProfit>=0?tl.profit:tl.loss}`,val:reportProfit,color:reportProfit>=0?'#1a6b3c':'#c0392b',big:true},
              ].map(({label,val,color,big},i,arr)=>(
                <View key={label}>
                  <View style={styles.reportRow}>
                    <Text style={styles.reportLabel}>{label}</Text>
                    <Text style={[styles.reportValue,{color,fontSize:big?20:15}]}>
                      {big&&val>0?'+':''}฿{Math.abs(val).toLocaleString()}
                    </Text>
                  </View>
                  {i<arr.length-1 && <View style={styles.reportDivider}/>}
                </View>
              ))}
            </View>
            <Text style={styles.sectionTitle}>💸 {tl.byCat}</Text>
            {(() => {
              const expCats = [...new Set(reportTx.filter(t=>t.type==='expense').map(t=>t.category))];
              return expCats.length===0 ? <Text style={styles.noData}>{tl.noData}</Text>
                : expCats.map(cat => {
                  const total = reportTx.filter(t=>t.type==='expense'&&t.category===cat).reduce((s,t)=>s+t.amount,0);
                  const pct = reportExpense>0?(total/reportExpense)*100:0;
                  return (
                    <View key={cat} style={styles.catCard}>
                      <View style={styles.rowBetween}>
                        <Text style={styles.catName}>{cat}</Text>
                        <Text style={styles.catAmount}>฿{total.toLocaleString()}</Text>
                      </View>
                      <View style={styles.catBarBg}>
                        <View style={[styles.catBarFill,{width:`${pct}%` as any}]}/>
                      </View>
                      <Text style={styles.catPct}>{pct.toFixed(0)}%</Text>
                    </View>
                  );
                });
            })()}
            <Text style={styles.sectionTitle}>📝 {tl.allTx}</Text>
            {reportTx.length===0 ? <Text style={styles.noData}>{tl.noData}</Text>
              : reportTx.map(tx=><TxRow key={tx.id} tx={tx}/>)}
          </View>
        )}

        <View style={{ height:100 }} />
      </ScrollView>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {[
          {key:'dashboard',icon:'📊',label:tl.dashboard},
          {key:'income',   icon:'💰',label:tl.income},
          {key:'expense',  icon:'💸',label:tl.expense},
          {key:'report',   icon:'📋',label:tl.report},
        ].map(item=>(
          <TouchableOpacity key={item.key} style={[styles.tabItem,tab===item.key&&styles.tabItemActive]} onPress={()=>setTab(item.key as any)}>
            <Text style={styles.tabIcon}>{item.icon}</Text>
            <Text style={[styles.tabLabel,tab===item.key&&styles.tabLabelActive]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Add Transaction Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {modalType==='income' ? '💰 '+tl.addIncome : '💸 '+tl.addExpense}
            </Text>
            <Text style={styles.inputLabel}>{tl.selectCat}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {cats.map(cat=>(
                <TouchableOpacity key={cat} style={[styles.catChip,form.category===cat&&{backgroundColor:accentColor}]} onPress={()=>setForm({...form,category:cat})}>
                  <Text style={[styles.catChipText,form.category===cat&&styles.catChipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.inputLabel}>{tl.amount}</Text>
            <TextInput style={styles.input} placeholder="0" keyboardType="numeric" value={form.amount} onChangeText={v=>setForm({...form,amount:v})} />
            <Text style={styles.inputLabel}>{tl.note}</Text>
            <TextInput style={styles.input} placeholder={lang==='th'?'หมายเหตุ...':'Note...'} value={form.note} onChangeText={v=>setForm({...form,note:v})} />
            <Text style={styles.inputLabel}>{tl.dateLabel}</Text>
            <TouchableOpacity style={[styles.dateTrigger,{borderColor:accentColor}]} onPress={()=>setShowDatePicker(true)}>
              <Text style={styles.dateTriggerIcon}>📅</Text>
              <Text style={[styles.dateTriggerText,{color:accentColor}]}>{form.date?formatDateDisplay(form.date):tl.pickDate}</Text>
            </TouchableOpacity>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={()=>setShowModal(false)}>
                <Text style={styles.cancelBtnText}>{tl.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn,{backgroundColor:accentColor}]} onPress={saveTransaction}>
                <Text style={styles.saveBtnText}>{tl.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <InlineDatePicker visible={showDatePicker} initialDate={form.date||todayStr} lang={lang} accentColor={accentColor}
            onConfirm={(date:string)=>{setForm(f=>({...f,date}));setShowDatePicker(false);}}
            onCancel={()=>setShowDatePicker(false)} />
        </View>
      </Modal>

      {/* GitHub Settings Modal */}
      <Modal visible={showSettings} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.rowBetween}>
              <Text style={styles.modalTitle}>⚙️ {tl.githubSettings}</Text>
              <TouchableOpacity onPress={()=>setShowSettings(false)}>
                <Text style={{fontSize:20,color:'#666'}}>✕</Text>
              </TouchableOpacity>
            </View>
            {[
              {key:'token', label:tl.githubToken,  placeholder:'ghp_xxxxxxxxxxxx', secure:true},
              {key:'repo',  label:tl.githubRepo,   placeholder:'username/farm-data', secure:false},
              {key:'file',  label:tl.githubFile,   placeholder:'transactions.json', secure:false},
            ].map(({key,label,placeholder,secure})=>(
              <View key={key}>
                <Text style={styles.inputLabel}>{label}</Text>
                <TextInput style={styles.input} placeholder={placeholder} secureTextEntry={secure}
                  value={(ghConfig as any)[key]} onChangeText={v=>setGhConfig(prev=>({...prev,[key]:v}))} />
              </View>
            ))}
            {ghStatus.msg ? (
              <Text style={{fontSize:13,color:ghStatus.type==='error'?'#c0392b':'#1a6b3c',marginBottom:12,fontWeight:'bold'}}>{ghStatus.msg}</Text>
            ) : null}
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.cancelBtn,{borderColor:'#1a6b3c'}]} onPress={handleLoadGH} disabled={ghBusy}>
                <Text style={{color:'#1a6b3c',fontSize:14,fontWeight:'bold'}}>⬇ {tl.loadGH}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn,{backgroundColor:'#1a6b3c'}]} onPress={handleSaveGH} disabled={ghBusy}>
                <Text style={styles.saveBtnText}>⬆ {tl.saveGH}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.saveBtn,{backgroundColor:'#555',marginTop:10}]} onPress={saveGHSettings}>
              <Text style={styles.saveBtnText}>{tl.save} Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog visible={confirmDialog.visible}
        title={tl.deleteConfirm} message={tl.deleteMsg} confirmText={tl.delete}
        onConfirm={doDelete} onCancel={()=>setConfirmDialog({visible:false,id:''})} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:          { flex:1, backgroundColor:'#f5f5f5' },
  header:             { backgroundColor:'#1a6b3c', padding:16, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  headerTitle:        { fontSize:22, fontWeight:'bold', color:'#fff' },
  headerSub:          { fontSize:12, color:'#a8d5b5' },
  langBtn:            { backgroundColor:'rgba(255,255,255,0.2)', paddingHorizontal:12, paddingVertical:6, borderRadius:20 },
  langText:           { color:'#fff', fontSize:13 },
  content:            { flex:1, padding:16 },
  sectionTitle:       { fontSize:16, fontWeight:'bold', color:'#1a6b3c', marginTop:8, marginBottom:10 },
  statsGrid:          { flexDirection:'row', gap:10, marginBottom:12 },
  statCard:           { flex:1, borderRadius:12, padding:16, alignItems:'center' },
  statNumber:         { fontSize:18, fontWeight:'bold', color:'#fff' },
  statLabel:          { fontSize:11, color:'rgba(255,255,255,0.8)', marginTop:4 },
  profitCard:         { borderRadius:16, padding:20, alignItems:'center', marginBottom:20 },
  profitLabel:        { color:'rgba(255,255,255,0.9)', fontSize:14 },
  profitAmount:       { color:'#fff', fontSize:32, fontWeight:'bold', marginTop:4 },
  barContainer:       { backgroundColor:'#fff', borderRadius:12, padding:16, marginBottom:20, elevation:2 },
  barRow:             { flexDirection:'row', alignItems:'center', marginBottom:12 },
  barLabel:           { width:80, fontSize:11, color:'#666' },
  barBg:              { flex:1, height:12, backgroundColor:'#f0f0f0', borderRadius:6, overflow:'hidden' },
  barFill:            { height:'100%', borderRadius:6 },
  barValue:           { width:50, fontSize:11, color:'#333', textAlign:'right', fontWeight:'bold' },
  quickBtns:          { flexDirection:'row', gap:10, marginBottom:20 },
  quickBtn:           { flex:1, borderRadius:12, padding:14, alignItems:'center' },
  quickBtnText:       { color:'#fff', fontSize:14, fontWeight:'bold' },
  txCard:             { backgroundColor:'#fff', borderRadius:12, padding:14, marginBottom:8, flexDirection:'row', alignItems:'center', elevation:1 },
  txDot:              { width:10, height:10, borderRadius:5, marginRight:12 },
  txInfo:             { flex:1 },
  txCat:              { fontSize:14, fontWeight:'bold', color:'#333' },
  txNote:             { fontSize:11, color:'#999', marginTop:2 },
  txRight:            { alignItems:'flex-end', gap:4 },
  txAmount:           { fontSize:14, fontWeight:'bold' },
  delBtn:             { borderWidth:1, borderColor:'#ddd', borderRadius:6, paddingHorizontal:8, paddingVertical:2 },
  delBtnText:         { fontSize:11, color:'#c0392b' },
  noData:             { textAlign:'center', color:'#999', marginTop:20 },
  rowBetween:         { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  addBtn:             { paddingHorizontal:14, paddingVertical:8, borderRadius:20 },
  addBtnText:         { color:'#fff', fontSize:13, fontWeight:'bold' },
  monthScroll:        { marginBottom:16 },
  monthBtn:           { paddingHorizontal:16, paddingVertical:8, borderRadius:20, backgroundColor:'#eee', marginRight:8 },
  monthBtnActive:     { backgroundColor:'#1a6b3c' },
  monthBtnText:       { color:'#666', fontSize:13 },
  monthBtnTextActive: { color:'#fff', fontWeight:'bold' },
  reportCard:         { backgroundColor:'#fff', borderRadius:16, padding:20, marginBottom:20, elevation:2 },
  reportMonthTitle:   { fontSize:15, fontWeight:'bold', color:'#333', marginBottom:12 },
  reportRow:          { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:8 },
  reportLabel:        { fontSize:14, color:'#666' },
  reportValue:        { fontSize:15, fontWeight:'bold' },
  reportDivider:      { height:1, backgroundColor:'#f0f0f0' },
  catCard:            { backgroundColor:'#fff', borderRadius:12, padding:14, marginBottom:8, elevation:1 },
  catName:            { fontSize:14, color:'#333', fontWeight:'bold' },
  catAmount:          { fontSize:14, color:'#c0392b', fontWeight:'bold' },
  catBarBg:           { height:8, backgroundColor:'#f0f0f0', borderRadius:4, marginTop:8, overflow:'hidden' },
  catBarFill:         { height:'100%', backgroundColor:'#c0392b', borderRadius:4 },
  catPct:             { fontSize:11, color:'#999', marginTop:4 },
  tabBar:             { flexDirection:'row', backgroundColor:'#fff', borderTopWidth:1, borderTopColor:'#eee', paddingBottom:8 },
  tabItem:            { flex:1, alignItems:'center', paddingTop:8 },
  tabItemActive:      { borderTopWidth:2, borderTopColor:'#1a6b3c' },
  tabIcon:            { fontSize:20 },
  tabLabel:           { fontSize:10, color:'#999', marginTop:2 },
  tabLabelActive:     { color:'#1a6b3c', fontWeight:'bold' },
  modalOverlay:       { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'flex-end' },
  modalBox:           { backgroundColor:'#fff', borderTopLeftRadius:24, borderTopRightRadius:24, padding:24 },
  modalTitle:         { fontSize:18, fontWeight:'bold', color:'#333', marginBottom:16 },
  inputLabel:         { fontSize:13, color:'#666', marginBottom:6 },
  catScroll:          { marginBottom:14 },
  catChip:            { paddingHorizontal:12, paddingVertical:8, borderRadius:20, backgroundColor:'#f0f0f0', marginRight:8 },
  catChipText:        { fontSize:13, color:'#666' },
  catChipTextActive:  { color:'#fff', fontWeight:'bold' },
  input:              { borderWidth:1, borderColor:'#ddd', borderRadius:10, padding:12, marginBottom:14, fontSize:15 },
  dateTrigger:        { flexDirection:'row', alignItems:'center', gap:8, borderWidth:1.5, borderRadius:10, padding:12, marginBottom:14 },
  dateTriggerIcon:    { fontSize:18 },
  dateTriggerText:    { fontSize:15, fontWeight:'bold' },
  modalBtns:          { flexDirection:'row', gap:10 },
  cancelBtn:          { flex:1, borderWidth:1, borderColor:'#ddd', borderRadius:10, padding:12, alignItems:'center' },
  cancelBtnText:      { color:'#666', fontSize:15 },
  saveBtn:            { flex:1, borderRadius:10, padding:12, alignItems:'center' },
  saveBtnText:        { color:'#fff', fontSize:15, fontWeight:'bold' },
});
