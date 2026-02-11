
"use client";
import React, { useState, useEffect, useMemo } from "react";
import styles from "./income.module.css";
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Calendar, ChevronDown, Wallet, Edit2, Trash2, TrendingUp, TrendingDown, FileText, Home  } from "lucide-react";
import Popup from "../components/Popup/Popup";

const Income = () => {
  const [open, setOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [userIncome, setUserIncome] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [isOpen_c, setIsOpen_c] = useState(false);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const refreshIncome = async () => {
    const month = selectedMonth;
    await getUserIncome(month);
    await getTotalIncome(month);
  };

  const getUserIncome = async (month) => {
    try {
      const user_id = Cookies.get("user");
      const res = await fetch(
        `http://localhost:8000/api/Income/GetIncomeByMonth/${user_id}/${month + 1}`
      );
      const data = await res.json();
      setUserIncome(data || []);
    } catch (err) {
      console.error("Income fetch error:", err);
      setUserIncome([]);
    }
  };

  const getTotalIncome = async (month) => {
    try {
      const user_id = Cookies.get("user");
      const res = await fetch(
        `http://localhost:8000/api/Income/FullIncomeOfAUser/${user_id}/${month + 1}`
      );
      const data = await res.json();
      setTotal(data || 0);
    } catch (err) {
      console.error("Total income fetch error:", err);
      setTotal(0);
    }
  };

  const deleteIncome = async (id) => {
    if (!confirm("Are you sure you want to delete this income?")) return;
    try {
      const token = Cookies.get("jwtToken");
      const res = await fetch(`http://localhost:8000/api/Income/DeleteIncome/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) refreshIncome();
      else alert("Failed to delete income");
    } catch (err) {
      console.error("Error deleting income:", err);
    }
  }; 
  
  
  const pieData = useMemo(() => userIncome.map(i => ({ name: i.c_Name, value: Number(i.i_Amount) || 0 })), [userIncome]);
  const barChartData = useMemo(() => userIncome.map(i => ({ name: i.c_Name, amount: Number(i.i_Amount) || 0, color: i.c_Color })), [userIncome]);
  const COLORS = userIncome.map(i => i.c_Color);

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

  useEffect(() => { refreshIncome(); }, [selectedMonth]);

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
              <h1>Income</h1>
              <p className={styles.subtitle}>Track your income</p>
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
                  <div key={month} className={`${styles.dropdownItem} ${selectedMonth === index ? styles.active : ""}`}
                    onClick={() => { setSelectedMonth(index); setIsOpen_c(false); }}>
                    {month}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.img} onClick={() => { setEditingIncome(null); setOpen(true); }}>
            <img src="/add.png" height={23} width={23} />
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Charts */}
        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <div className={`${styles.chartIndicator} ${styles.indicatorPie}`}></div>
              <h3 className={styles.chartTitle}>Income Distribution</h3>
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
              <div className={`${styles.chartIndicator} ${styles.indicatorBar}`}></div>
              <h3 className={styles.chartTitle}>Category Breakdown</h3>
            </div>
            <div className={styles.bar_chart}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis tickFormatter={value => `${(value / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" radius={[8,8,0,0]}>
                    {barChartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Income Cards */}
        <div className={styles.categorySection}>
          <div className={styles.sectionHeader}>
            <div className={`${styles.chartIndicator} ${styles.indicatorCategory}`}></div>
            <h3 className={styles.chartTitle}>Income Categories</h3>
          </div>

          <div className={styles.card_wrapper}>
            {userIncome.map((v) => (
              <div key={v.id} className={styles.cards}>
                <div className={styles.cardGlow} style={{ background: `${v.c_Color}20` }}></div>
                <div className={styles.cardContent}>
                  <div className={styles.cardIcon} style={{ background: `${v.c_Color}30` }}>
                    <img src={v.c_Image} height={33} width={33} />
                  </div>
                  <div className={styles.card_title}>
                    <span>{v.c_Name}</span>
                    <h1 style={{ color: v.c_Color }}>{Number(v.i_Amount || 0).toLocaleString()}</h1>
                  </div>
                </div>

                <div className={styles.progressWrapper}>
                  <div className={styles.progressBar} style={{
                    width: total > 0 ? `${((v.i_Amount || 0) / total) * 100}%` : "0%",
                    background: v.c_Color
                  }}></div>
                </div>
                <p className={styles.percentText}>
                  {total > 0 ? `${(((v.i_Amount || 0) / total) * 100).toFixed(1)}% of total` : "0% of total"}
                </p>

                <div className={styles.cardFooter}>
                  <button className={styles.editBtn} onClick={() => { setEditingIncome(v); setOpen(true); }}>
                    <Edit2 size={16} /> 
                  </button>
                  <button className={styles.deleteBtn} onClick={() => deleteIncome(v.id)}>
                    <Trash2 size={16} /> 
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {open && <Popup income={editingIncome} onClose={() => setOpen(false)} refreshIncome={refreshIncome} />}
    </div>
  );
};

export default Income;
