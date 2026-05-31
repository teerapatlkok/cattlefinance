import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, SafeAreaView, Modal, StatusBar
} from 'react-native';

type TxType = 'income' | 'expense';
type Lang = 'th' | 'en';

type Transaction = {
  id: string; type: TxType; category: string;
  amount: number; note: string; date: string; month: string;
};

const EXPENSE_CATS = {
  th: ['🐄 ค่าอาหารวัว', '💊 ค่ายา/หมอ', '🚛 ค่าขนส่ง', '👷 ค่าแรง', '🌾 ค่าที่ดิน/เช่า', '🔧 ค่าอุปกรณ์', '📦 อื่นๆ'],
  en: ['🐄 Feed', '💊 Vet/Medicine', '🚛 Transport', '👷 Labor', '🌾 Land/Rent', '🔧 Equipment', '📦 Other'],
};
const INCOME_CATS = {
  th: ['💰 ขายวัว', '🥛 ขายนม', '🌾 ขายปุ๋ย', '📦 อื่นๆ'],
  en: ['💰 Sell Cattle', '🥛 Sell Milk', '🌾 Sell Manure', '📦 Other'],
};

const MONTHS_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const T = {
  th: {
    appName: 'บัญชีฟาร์มวัว', appSub: 'รายรับ-รายจ่าย',
    dashboard: 'สรุป', income: 'รายรับ', expense: 'รายจ่าย', report: 'รายงาน',
    addIncome: 'เพิ่มรายรับ', addExpense: 'เพิ่มรายจ่าย',
    totalIncome: 'รายรับรวม', totalExpense: 'รายจ่ายรวม', profit: 'กำไร', loss: 'ขาดทุน',
    category: 'หมวดหมู่', amount: 'จำนวนเงิน (บาท)', note: 'หมายเหตุ',
    save: 'บันทึก', cancel: 'ยกเลิก', noData: 'ยังไม่มีข้อมูล',
    thisMonth: 'เดือนนี้', allTime: 'ทั้งหมด', monthly: 'รายเดือน',
    selectCat: 'เลือกหมวดหมู่', baht: '฿',
  },
  en: {
    appName: 'Farm Finance', appSub: 'Income & Expense',
    dashboard: 'Summary', income: 'Income', expense: 'Expense', report: 'Report',
    addIncome: 'Add Income', addExpense: 'Add Expense',
    totalIncome: 'Total Income', totalExpense: 'Total Expense', profit: 'Profit', loss: 'Loss',
    category: 'Category', amount: 'Amount (THB)', note: 'Note',
    save: 'Save', cancel: 'Cancel', noData: 'No data yet',
    thisMonth: 'This Month', allTime: 'All Time', monthly: 'Monthly',
    selectCat: 'Select Category', baht: '฿',
  },
};

const sampleTx: Transaction[] = [
  { id: '1', type: 'income', category: '💰 ขายวัว', amount: 42000, note: 'ขายทองคำ', date: '2026-05-28', month: '2026-05' },
  { id: '2', type: 'expense', category: '🐄 ค่าอาหารวัว', amount: 5000, note: 'อาหารเดือนพฤษภาคม', date: '2026-05-01', month: '2026-05' },
  { id: '3', type: 'expense', category: '💊 ค่ายา/หมอ', amount: 1500, note: 'ฉีดวัคซีน', date: '2026-05-10', month: '2026-05' },
  { id: '4', type: 'income', category: '🥛 ขายนม', amount: 3200, note: 'นมเดือนเมษายน', date: '2026-04-30', month: '2026-04' },
  { id: '5', type: 'expense', category: '👷 ค่าแรง', amount: 8000, note: 'ค่าแรงเดือนเมษายน', date: '2026-04-30', month: '2026-04' },
  { id: '6', type: 'income', category: '💰 ขายวัว', amount: 35000, note: 'ขายดาว', date: '2026-04-15', month: '2026-04' },
];

export default function App() {
  const [lang, setLang] = useState<Lang>('th');
  const [tab, setTab] = useState<'dashboard' | 'income' | 'expense' | 'report'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(sampleTx);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<TxType>('income');
  const [form, setForm] = useState({ category: '', amount: '', note: '' });
  const [reportMonth, setReportMonth] = useState('2026-05');

  const t = T[lang];
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

  const monthTx = (m: string) => transactions.filter(tx => tx.month === m);
  const thisMonthTx = monthTx(currentMonth);
  const thisIncome = thisMonthTx.filter(tx => tx.type === 'income').reduce((s,tx) => s+tx.amount, 0);
  const thisExpense = thisMonthTx.filter(tx => tx.type === 'expense').reduce((s,tx) => s+tx.amount, 0);
  const thisProfit = thisIncome - thisExpense;
  const allIncome = transactions.filter(tx => tx.type === 'income').reduce((s,tx) => s+tx.amount, 0);
  const allExpense = transactions.filter(tx => tx.type === 'expense').reduce((s,tx) => s+tx.amount, 0);
  const allMonths = [...new Set(transactions.map(tx => tx.month))].sort().reverse();

  const openModal = (type: TxType) => {
    setModalType(type);
    setForm({ category: '', amount: '', note: '' });
    setShowModal(true);
  };

  const saveTransaction = () => {
    if (!form.category || !form.amount) return;
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const date = now.toISOString().split('T')[0];
    setTransactions([{ id: Date.now().toString(), type: modalType, category: form.category, amount: parseInt(form.amount), note: form.note, date, month }, ...transactions]);
    setShowModal(false);
  };

  const reportTx = monthTx(reportMonth);
  const reportIncome = reportTx.filter(tx => tx.type === 'income').reduce((s,tx) => s+tx.amount, 0);
  const reportExpense = reportTx.filter(tx => tx.type === 'expense').reduce((s,tx) => s+tx.amount, 0);
  const reportProfit = reportIncome - reportExpense;
  const cats = modalType === 'income' ? INCOME_CATS[lang] : EXPENSE_CATS[lang];

  const formatMonth = (m: string) => {
    const [y, mo] = m.split('-');
    const months = lang === 'th' ? MONTHS_TH : MONTHS_EN;
    return `${months[parseInt(mo)-1]} ${lang === 'th' ? parseInt(y)+543 : y}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a6b3c" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📒 {t.appName}</Text>
          <Text style={styles.headerSub}>{t.appSub}</Text>
        </View>
        <TouchableOpacity onPress={() => setLang(lang === 'th' ? 'en' : 'th')} style={styles.langBtn}>
          <Text style={styles.langText}>{lang === 'th' ? '🇬🇧 EN' : '🇹🇭 ไทย'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {tab === 'dashboard' && (
          <View>
            <Text style={styles.sectionTitle}>📊 {t.thisMonth} — {formatMonth(currentMonth)}</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: '#1a6b3c' }]}>
                <Text style={styles.statNumber}>฿{(thisIncome/1000).toFixed(0)}K</Text>
                <Text style={styles.statLabel}>{t.totalIncome}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#c0392b' }]}>
                <Text style={styles.statNumber}>฿{(thisExpense/1000).toFixed(0)}K</Text>
                <Text style={styles.statLabel}>{t.totalExpense}</Text>
              </View>
            </View>
            <View style={[styles.profitCard, { backgroundColor: thisProfit >= 0 ? '#1a6b3c' : '#c0392b' }]}>
              <Text style={styles.profitLabel}>{thisProfit >= 0 ? '📈 '+t.profit : '📉 '+t.loss}</Text>
              <Text style={styles.profitAmount}>฿{Math.abs(thisProfit).toLocaleString()}</Text>
            </View>
            <Text style={styles.sectionTitle}>📊 {t.allTime}</Text>
            <View style={styles.barContainer}>
              <View style={styles.barRow}>
                <Text style={styles.barLabel}>{t.totalIncome}</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${Math.min(100,(allIncome/(allIncome+allExpense))*100)}%`, backgroundColor: '#1a6b3c' }]} />
                </View>
                <Text style={styles.barValue}>฿{(allIncome/1000).toFixed(0)}K</Text>
              </View>
              <View style={styles.barRow}>
                <Text style={styles.barLabel}>{t.totalExpense}</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${Math.min(100,(allExpense/(allIncome+allExpense))*100)}%`, backgroundColor: '#c0392b' }]} />
                </View>
                <Text style={styles.barValue}>฿{(allExpense/1000).toFixed(0)}K</Text>
              </View>
            </View>
            <View style={styles.quickBtns}>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#1a6b3c' }]} onPress={() => openModal('income')}>
                <Text style={styles.quickBtnText}>+ {t.addIncome}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#c0392b' }]} onPress={() => openModal('expense')}>
                <Text style={styles.quickBtnText}>+ {t.addExpense}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionTitle}>🕐 รายการล่าสุด</Text>
            {transactions.slice(0,5).map(tx => (
              <View key={tx.id} style={styles.txCard}>
                <View style={[styles.txDot, { backgroundColor: tx.type === 'income' ? '#1a6b3c' : '#c0392b' }]} />
                <View style={styles.txInfo}>
                  <Text style={styles.txCat}>{tx.category}</Text>
                  <Text style={styles.txNote}>{tx.note} • {tx.date}</Text>
                </View>
                <Text style={[styles.txAmount, { color: tx.type === 'income' ? '#1a6b3c' : '#c0392b' }]}>
                  {tx.type === 'income' ? '+' : '-'}฿{tx.amount.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {tab === 'income' && (
          <View>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>💰 {t.income}</Text>
              <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#1a6b3c' }]} onPress={() => openModal('income')}>
                <Text style={styles.addBtnText}>+ {t.addIncome}</Text>
              </TouchableOpacity>
            </View>
            {transactions.filter(tx => tx.type === 'income').length === 0
              ? <Text style={styles.noData}>{t.noData}</Text>
              : transactions.filter(tx => tx.type === 'income').map(tx => (
                <View key={tx.id} style={styles.txCard}>
                  <View style={[styles.txDot, { backgroundColor: '#1a6b3c' }]} />
                  <View style={styles.txInfo}>
                    <Text style={styles.txCat}>{tx.category}</Text>
                    <Text style={styles.txNote}>{tx.note} • {tx.date}</Text>
                  </View>
                  <Text style={[styles.txAmount, { color: '#1a6b3c' }]}>+฿{tx.amount.toLocaleString()}</Text>
                </View>
              ))}
          </View>
        )}

        {tab === 'expense' && (
          <View>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>💸 {t.expense}</Text>
              <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#c0392b' }]} onPress={() => openModal('expense')}>
                <Text style={styles.addBtnText}>+ {t.addExpense}</Text>
              </TouchableOpacity>
            </View>
            {transactions.filter(tx => tx.type === 'expense').length === 0
              ? <Text style={styles.noData}>{t.noData}</Text>
              : transactions.filter(tx => tx.type === 'expense').map(tx => (
                <View key={tx.id} style={styles.txCard}>
                  <View style={[styles.txDot, { backgroundColor: '#c0392b' }]} />
                  <View style={styles.txInfo}>
                    <Text style={styles.txCat}>{tx.category}</Text>
                    <Text style={styles.txNote}>{tx.note} • {tx.date}</Text>
                  </View>
                  <Text style={[styles.txAmount, { color: '#c0392b' }]}>-฿{tx.amount.toLocaleString()}</Text>
                </View>
              ))}
          </View>
        )}

        {tab === 'report' && (
          <View>
            <Text style={styles.sectionTitle}>📋 {t.report}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
              {allMonths.map(m => (
                <TouchableOpacity key={m} style={[styles.monthBtn, reportMonth === m && styles.monthBtnActive]} onPress={() => setReportMonth(m)}>
                  <Text style={[styles.monthBtnText, reportMonth === m && styles.monthBtnTextActive]}>{formatMonth(m)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.reportCard}>
              <Text style={styles.reportMonth}>📅 {formatMonth(reportMonth)}</Text>
              <View style={styles.reportRow}>
                <Text style={styles.reportLabel}>💰 {t.totalIncome}</Text>
                <Text style={[styles.reportValue, { color: '#1a6b3c' }]}>฿{reportIncome.toLocaleString()}</Text>
              </View>
              <View style={styles.reportDivider} />
              <View style={styles.reportRow}>
                <Text style={styles.reportLabel}>💸 {t.totalExpense}</Text>
                <Text style={[styles.reportValue, { color: '#c0392b' }]}>฿{reportExpense.toLocaleString()}</Text>
              </View>
              <View style={styles.reportDivider} />
              <View style={styles.reportRow}>
                <Text style={styles.reportLabel}>📊 {reportProfit >= 0 ? t.profit : t.loss}</Text>
                <Text style={[styles.reportValue, { color: reportProfit >= 0 ? '#1a6b3c' : '#c0392b', fontSize: 20, fontWeight: 'bold' }]}>
                  {reportProfit >= 0 ? '+' : '-'}฿{Math.abs(reportProfit).toLocaleString()}
                </Text>
              </View>
            </View>
            <Text style={styles.sectionTitle}>💸 รายจ่ายแยกหมวด</Text>
            {(() => {
              const expCats = [...new Set(reportTx.filter(tx => tx.type === 'expense').map(tx => tx.category))];
              return expCats.length === 0 ? <Text style={styles.noData}>{t.noData}</Text>
                : expCats.map(cat => {
                  const total = reportTx.filter(tx => tx.type === 'expense' && tx.category === cat).reduce((s,tx) => s+tx.amount, 0);
                  const pct = reportExpense > 0 ? (total/reportExpense)*100 : 0;
                  return (
                    <View key={cat} style={styles.catCard}>
                      <View style={styles.rowBetween}>
                        <Text style={styles.catName}>{cat}</Text>
                        <Text style={styles.catAmount}>฿{total.toLocaleString()}</Text>
                      </View>
                      <View style={styles.catBarBg}>
                        <View style={[styles.catBarFill, { width: `${pct}%` }]} />
                      </View>
                      <Text style={styles.catPct}>{pct.toFixed(0)}%</Text>
                    </View>
                  );
                });
            })()}
            <Text style={styles.sectionTitle}>📝 รายการทั้งหมด</Text>
            {reportTx.length === 0 ? <Text style={styles.noData}>{t.noData}</Text>
              : reportTx.map(tx => (
                <View key={tx.id} style={styles.txCard}>
                  <View style={[styles.txDot, { backgroundColor: tx.type === 'income' ? '#1a6b3c' : '#c0392b' }]} />
                  <View style={styles.txInfo}>
                    <Text style={styles.txCat}>{tx.category}</Text>
                    <Text style={styles.txNote}>{tx.note} • {tx.date}</Text>
                  </View>
                  <Text style={[styles.txAmount, { color: tx.type === 'income' ? '#1a6b3c' : '#c0392b' }]}>
                    {tx.type === 'income' ? '+' : '-'}฿{tx.amount.toLocaleString()}
                  </Text>
                </View>
              ))}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.tabBar}>
        {[
          { key: 'dashboard', icon: '📊', label: t.dashboard },
          { key: 'income', icon: '💰', label: t.income },
          { key: 'expense', icon: '💸', label: t.expense },
          { key: 'report', icon: '📋', label: t.report },
        ].map(item => (
          <TouchableOpacity key={item.key} style={[styles.tabItem, tab === item.key && styles.tabItemActive]} onPress={() => setTab(item.key as any)}>
            <Text style={styles.tabIcon}>{item.icon}</Text>
            <Text style={[styles.tabLabel, tab === item.key && styles.tabLabelActive]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{modalType === 'income' ? '💰 '+t.addIncome : '💸 '+t.addExpense}</Text>
            <Text style={styles.inputLabel}>{t.selectCat}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {cats.map(cat => (
                <TouchableOpacity key={cat} style={[styles.catChip, form.category === cat && styles.catChipActive]} onPress={() => setForm({...form, category: cat})}>
                  <Text style={[styles.catChipText, form.category === cat && styles.catChipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.inputLabel}>{t.amount}</Text>
            <TextInput style={styles.input} placeholder="0" keyboardType="numeric" value={form.amount} onChangeText={v => setForm({...form, amount: v})} />
            <Text style={styles.inputLabel}>{t.note}</Text>
            <TextInput style={styles.input} placeholder={lang === 'th' ? 'หมายเหตุ...' : 'Note...'} value={form.note} onChangeText={v => setForm({...form, note: v})} />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelBtnText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: modalType === 'income' ? '#1a6b3c' : '#c0392b' }]} onPress={saveTransaction}>
                <Text style={styles.saveBtnText}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#1a6b3c', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 12, color: '#a8d5b5' },
  langBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  langText: { color: '#fff', fontSize: 13 },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a6b3c', marginTop: 8, marginBottom: 12 },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard: { flex: 1, borderRadius: 12, padding: 16, alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  profitCard: { borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 20 },
  profitLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
  profitAmount: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: 4 },
  barContainer: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20, elevation: 2 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  barLabel: { width: 70, fontSize: 11, color: '#666' },
  barBg: { flex: 1, height: 12, backgroundColor: '#f0f0f0', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
  barValue: { width: 50, fontSize: 11, color: '#333', textAlign: 'right', fontWeight: 'bold' },
  quickBtns: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  quickBtn: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  quickBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  txCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  txDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  txInfo: { flex: 1 },
  txCat: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  txNote: { fontSize: 11, color: '#999', marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: 'bold' },
  noData: { textAlign: 'center', color: '#999', marginTop: 20 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  monthScroll: { marginBottom: 16 },
  monthBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#eee', marginRight: 8 },
  monthBtnActive: { backgroundColor: '#1a6b3c' },
  monthBtnText: { color: '#666', fontSize: 13 },
  monthBtnTextActive: { color: '#fff', fontWeight: 'bold' },
  reportCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, elevation: 2 },
  reportMonth: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  reportRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  reportLabel: { fontSize: 15, color: '#666' },
  reportValue: { fontSize: 16, fontWeight: 'bold' },
  reportDivider: { height: 1, backgroundColor: '#f0f0f0' },
  catCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, elevation: 1 },
  catName: { fontSize: 14, color: '#333', fontWeight: 'bold' },
  catAmount: { fontSize: 14, color: '#c0392b', fontWeight: 'bold' },
  catBarBg: { height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, marginTop: 8, overflow: 'hidden' },
  catBarFill: { height: '100%', backgroundColor: '#c0392b', borderRadius: 4 },
  catPct: { fontSize: 11, color: '#999', marginTop: 4 },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', paddingBottom: 8 },
  tabItem: { flex: 1, alignItems: 'center', paddingTop: 8 },
  tabItemActive: { borderTopWidth: 2, borderTopColor: '#1a6b3c' },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 10, color: '#999', marginTop: 2 },
  tabLabelActive: { color: '#1a6b3c', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  inputLabel: { fontSize: 13, color: '#666', marginBottom: 6 },
  catScroll: { marginBottom: 14 },
  catChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 8 },
  catChipActive: { backgroundColor: '#1a6b3c' },
  catChipText: { fontSize: 13, color: '#666' },
  catChipTextActive: { color: '#fff', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 15 },
  modalBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, alignItems: 'center' },
  cancelBtnText: { color: '#666', fontSize: 15 },
  saveBtn: { flex: 1, borderRadius: 10, padding: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});