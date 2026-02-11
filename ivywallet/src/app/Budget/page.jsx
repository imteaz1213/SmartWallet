
"use client";
import React, { useEffect, useState } from "react";
import styles from "./budget.module.css";
import BudgPopup from "../components/BudgPopup/BudgPopup";
import { Calendar, ChevronDown, Target, DollarSign, TrendingUp, CheckCircle, AlertCircle, Edit2,Wallet, Trash2, TrendingDown, FileText, Home } from "lucide-react";
import Cookies from "js-cookie";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { useRouter } from "next/navigation";

const BudgetPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [open_drawer, setOpen_drawer] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [budgetData, setBudgetData] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const router = useRouter();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getBudget = async (month = selectedMonth + 1) => {
    const user = Cookies.get("user");
    if (!user) return;

    try {
      const res = await fetch(`http://localhost:8000/api/Budget/GetBudgetById/${user}/${month}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      setBudgetData(data);
    } catch (err) {
      console.error("Error fetching budgets:", err);
    }
  };

  const deleteBudget = async (budgetId) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;

    try {
      const res = await fetch(`http://localhost:8000/api/Budget/DeleteBudget/${budgetId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Budget Deleted Successfully");
        getBudget();
      } else {
        alert("Failed to delete budget");
      }
    } catch (err) {
      console.error("Error deleting budget:", err);
    }
  };

  const handleEditBudget = (budget) => {
    setSelectedBudget({
      id: budget.id,
      title: budget.name,
      categoryId: budget.categoryId,
      total: budget.total,
      spent: budget.spent,
      date: budget.date,
      color: budget.color
    });
    setOpen_drawer(true);
  };


  const budgets = budgetData.map((item) => ({ 
    id: item.id,
    name: item.budgetName,
    category: item.categoryName,
    categoryId: item.categoryId,
    total: item.total,
    spent: item.spent,
    color: item.color,
    date: item.date
  })); 
  console.log(budgets);

 
  const totalBudget = budgets.reduce((sum, b) => sum + b.total, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const budgetsExceeded = budgets.filter(b => b.spent > b.total).length;
  const budgetsOnTrack = budgets.filter(b => b.spent <= b.total).length;

 
  const chartData = budgets.map(b => ({ name: b.name, Budget: b.total, Spent: b.spent, color: b.color }));
  const statusData = [
    { name: "On Track", value: budgetsOnTrack, color: "#10b981" },
    { name: "Exceeded", value: budgetsExceeded, color: "#ef4444" }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{payload[0].payload.name}</p>
          {payload.map((entry, index) => (
            <p key={index} className={styles.tooltipValue} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()} BDT
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    getBudget();
  }, [selectedMonth]);

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
      
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.titleWrapper}>
            <Target size={32} className={styles.iconBlue} />
            <h1 className={styles.mainTitle}>Budget Tracker</h1>
          </div>
          <p className={styles.subtitle}>Monitor and manage your spending limits</p>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.monthSelectorWrapper}>
            <div className={styles.monthButton} onClick={() => setIsOpen(!isOpen)}>
              <Calendar size={20} />
              <span>{months[selectedMonth]}</span>
              <ChevronDown size={18} />
            </div>
            {isOpen && (
              <div className={styles.dropdown}>
                {months.map((month, index) => (
                  <div
                    key={month}
                    className={`${styles.dropdownItem} ${selectedMonth === index ? styles.active : ""}`}
                    onClick={() => {
                      setSelectedMonth(index);
                      setIsOpen(false);
                    }}
                  >
                    {month}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.btn} onClick={() => { setSelectedBudget(null); setOpen_drawer(true); }}>
            <img src="/add.png" height={23} width={23} alt="Add" />
          </div>
        </div>
      </div>

      
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statCardBlue}`}>
          <div className={styles.statGlow}></div>
          <div className={styles.statIcon}><DollarSign size={24} /></div>
          <p className={styles.statLabel}>Total Budget</p>
          <h3 className={styles.statValue}>{totalBudget.toLocaleString()} BDT</h3>
        </div>
        <div className={`${styles.statCard} ${styles.statCardPurple}`}>
          <div className={styles.statGlow}></div>
          <div className={styles.statIcon}><TrendingUp size={24} /></div>
          <p className={styles.statLabel}>Total Spent</p>
          <h3 className={styles.statValue}>{totalSpent.toLocaleString()} BDT</h3>
        </div>
        <div className={`${styles.statCard} ${styles.statCardGreen}`}>
          <div className={styles.statGlow}></div>
          <div className={styles.statIcon}><CheckCircle size={24} /></div>
          <p className={styles.statLabel}>On Track</p>
          <h3 className={styles.statValue}>{budgetsOnTrack} Budgets</h3>
        </div>
        <div className={`${styles.statCard} ${styles.statCardRed}`}>
          <div className={styles.statGlow}></div>
          <div className={styles.statIcon}><AlertCircle size={24} /></div>
          <p className={styles.statLabel}>Exceeded</p>
          <h3 className={styles.statValue}>{budgetsExceeded} Budgets</h3>
        </div>
      </div>

    
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={`${styles.chartIndicator} ${styles.indicatorBlue}`}></div>
            <h3 className={styles.chartTitle}>Budget vs Spending</h3>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Budget" fill="#60a5fa" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Spent" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.Spent > entry.Budget ? "#ef4444" : entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={`${styles.chartIndicator} ${styles.indicatorGreen}`}></div>
            <h3 className={styles.chartTitle}>Budget Status</h3>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={130}
                dataKey="value"
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.budgetSection}>
        <div className={styles.sectionHeader}>
          <div className={`${styles.chartIndicator} ${styles.indicatorPink}`}></div>
          <h3 className={styles.chartTitle}>Budget Overview</h3>
        </div>
        <div className={styles.budgets}>
          {budgets.map((budget) => {
            const exceeded = budget.spent > budget.total;
            const left = exceeded ? budget.spent - budget.total : budget.total - budget.spent;
            const percent = Math.min((budget.spent / budget.total) * 100, 100);

            return (
              <div key={budget.id} className={`${styles.card} ${exceeded ? styles.cardExceeded : ""}`}>
                <div className={styles.cardGlow} style={{ background: exceeded ? "rgba(239, 68, 68, 0.2)" : `${budget.color}20` }}></div>
                <div className={styles.cardHeader}>
                  <div>
                    <h3>{budget.name}</h3>
                    <p className={styles.sub}>{budget.category}</p>
                  </div>
                  <div className={styles.amount} style={{ color: exceeded ? "#ef4444" : budget.color }}>
                    {budget.total.toLocaleString()} BDT
                  </div>
                </div>
                <div className={styles.status} style={{ backgroundColor: exceeded ? "rgba(239, 68, 68, 0.2)" : `${budget.color}20` }}>
                  <div className={styles.statusHeader}>
                    {exceeded ? <AlertCircle size={18} color="#ef4444" /> : <CheckCircle size={18} style={{ color: budget.color }} />}
                    <p className={styles.statusTitle} style={{ color: exceeded ? "#ef4444" : budget.color }}>
                      {exceeded ? "Budget exceeded by" : "Left to spend"}
                    </p>
                  </div>
                  <h4 style={{ color: exceeded ? "#ef4444" : budget.color }}>{left.toFixed(2)} <span>BDT</span></h4>
                  <p className={styles.ratio}>{budget.spent.toFixed(2)}/{budget.total.toFixed(2)} BDT</p>
                  <div className={styles.progressWrapper}>
                    <div className={styles.progressBar} style={{
                      width: `${percent}%`,
                      background: exceeded ? "linear-gradient(90deg, #ef4444, #dc2626)" : `linear-gradient(90deg, ${budget.color}, ${budget.color}dd)`
                    }} />
                  </div>
                  <p className={styles.percentText}>{percent.toFixed(1)}% Used</p>
                </div>
                <div className={styles.cardFooter}>
                  <button className={styles.editBtn} onClick={() => handleEditBudget(budget)}>
                    <Edit2 size={16} /> Edit
                  </button>
                  <button className={styles.deleteBtn} onClick={() => deleteBudget(budget.id)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {open_drawer && (
        <BudgPopup
          onClose={() => setOpen_drawer(false)}
          budget={selectedBudget}
          refreshBudgets={getBudget}
        />
      )}
    </div>
  );
};

export default BudgetPage;
