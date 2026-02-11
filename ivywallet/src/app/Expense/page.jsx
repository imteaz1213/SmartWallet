"use client";
import React, { useState, useEffect, useMemo } from "react";
import styles from "./expense.module.css";
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import Cookies from "js-cookie";
import { Calendar, ChevronDown, Wallet, Edit2, Trash2, TrendingUp, TrendingDown, FileText, Home  } from "lucide-react";
import ExpPopup from "../components/ExpPopup/ExpPopup";
import { useRouter } from "next/navigation";

const Expense = () => {
  const [open, setOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState([]);
  const [userExpense, setUserExpense] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [isOpen_c, setIsOpen_c] = useState(false);
  const [total, setTotal] = useState(0);
  const router = useRouter();
  

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];


  const getUserExpense = async (month) => {
    try {
      const user_id = Cookies.get("user");
      const res = await fetch(`http://localhost:8000/api/Expense/GetExpenseByMonth/${user_id}/${month + 1}`);
      const data = await res.json();
      setUserExpense(data || []);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setUserExpense([]);
    }
  };


  const getTotalExpense = async (month) => {
    try {
      const user_id = Cookies.get("user");
      const res = await fetch(`http://localhost:8000/api/Expense/FullExpenseOfAUser/${user_id}/${month + 1}`);
      const data = await res.json();
      setTotal(data || 0);
    } catch (err) {
      console.error("Error fetching total expense:", err);
      setTotal(0);
    }
  };

  const refreshExpenses = async () => {
    await getUserExpense(selectedMonth);
    await getTotalExpense(selectedMonth);
  };

  useEffect(() => {
    refreshExpenses();
  }, [selectedMonth]);

  const deleteExpense = async (id) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      const token = Cookies.get("jwtToken");
      const res = await fetch(`http://localhost:8000/api/Expense/DeleteExpense/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) refreshExpenses();
      else alert("Failed to delete expense");
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  const pieData = useMemo(() => userExpense.map(e => ({ name: e.c_Name, value: Number(e.e_Amount) || 0 })), [userExpense]);
  const barChartData = useMemo(() => userExpense.map(e => ({ name: e.c_Name, amount: Number(e.e_Amount) || 0, color: e.c_Color })), [userExpense]);
  const COLORS = userExpense.map(e => e.c_Color);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{payload[0].payload.name}</p>
          <p className={styles.tooltipValue} style={{ color: payload[0].fill }}>
            {Number(payload[0].value).toLocaleString()} BDT
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.container}>

      <div className={styles.slimSidebar}>
        <button className={styles.iconBtn} onClick={() => router.push("/")}>
          <Home size={24} />
        </button>
        <button className={styles.iconBtn} onClick={() => router.push("/Income")}>
          <TrendingUp size={24} />
        </button>
        <button className={styles.iconBtn} onClick={() => router.push("/Expense")}>
          <TrendingDown size={24} />
        </button>
        <button className={styles.iconBtn} onClick={() => router.push("/Budget")}>
          <Wallet size={24} />
        </button>
        <button className={styles.iconBtn} onClick={() => router.push("/Report")}>
          <FileText size={24} />
        </button>
      </div>
     
      <div className={styles.nav}>
        <div className={styles.upper}>
          <div className={styles.titleWrapper}>
            <Wallet size={32} className={styles.iconBlue} />
            <div>
              <h1>Expense</h1>
              <p className={styles.subtitle}>Track your spending</p>
            </div>
          </div>
          <div className={styles.totalAmount}>
            <span className={styles.totalLabel}>Total</span>
            <div className={styles.totalValue}>{total.toLocaleString()} BDT</div>
          </div>
        </div>

        <div className={styles.navActions}>
     
          <div className={styles.monthSelectorWrapper}>
            <div className={styles.monthButton} onClick={() => setIsOpen_c(!isOpen_c)}>
              <Calendar size={20} />
              <span>{months[selectedMonth]}</span>
              <ChevronDown size={18} />
            </div>
            {isOpen_c && (
              <div className={styles.dropdown}>
                {months.map((month, index) => (
                  <div
                    key={month}
                    className={`${styles.dropdownItem} ${selectedMonth === index ? styles.active : ""}`}
                    onClick={() => { setSelectedMonth(index); setIsOpen_c(false); }}
                  >
                    {month}
                  </div>
                ))}
              </div>
            )}
          </div>

     
          <div className={styles.img} onClick={() => { setEditingExpense([]); setOpen(true); }}>
            <img src="/add.png" height={23} width={23} />
          </div>
        </div>
      </div>


      <div className={styles.content}>
  
        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Expense Distribution</h3>
            </div>
            <div className={styles.pie_chart}>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={140} dataKey="value"
                    label={entry => total > 0 ? `${entry.name}: ${((entry.value / total) * 100).toFixed(1)}%` : `${entry.name}: 0%`}>
                    {pieData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Category Breakdown</h3>
            </div>
            <div className={styles.bar_chart}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" radius={[8,8,0,0]}>
                    {barChartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className={styles.categorySection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.chartTitle}>Expense Categories</h3>
          </div>
          <div className={styles.card_wrapper}>
            {userExpense.map(v => (
              <div key={v.id} className={styles.cards}>
                <div className={styles.cardGlow} style={{ background: `${v.c_Color}20` }} />
                <div className={styles.cardContent}>
                  <div className={styles.cardIcon} style={{ background: `${v.c_Color}30` }}>
                    <img src={v.c_Image} height={33} width={33} />
                  </div>
                  <div className={styles.card_title}>
                    <span>{v.c_Name}</span>
                    <h1 style={{ color: v.c_Color }}>{Number(v.e_Amount || 0).toLocaleString()}</h1>
                  </div>
                </div>

                <div className={styles.progressWrapper}>
                  <div className={styles.progressBar} style={{
                    width: total > 0 ? `${((v.e_Amount || 0)/total)*100}%` : "0%",
                    background: v.c_Color
                  }} />
                </div>
                <p className={styles.percentText}>
                  {total > 0 ? `${(((v.e_Amount || 0)/total)*100).toFixed(1)}% of total` : "0% of total"}
                </p>

                <div className={styles.cardFooter}>
                  <button className={styles.editBtn} onClick={() => { setEditingExpense(v); setOpen(true); }}>
                    <Edit2 size={16} />
                  </button>
                  <button className={styles.deleteBtn} onClick={() => deleteExpense(v.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

   
      {open && (
        <ExpPopup editData={editingExpense} onClose={() => setOpen(false)} refresh={refreshExpenses} />
      )}
    </div>
  );
};

export default Expense;
