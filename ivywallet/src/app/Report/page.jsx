
"use client";
import React, { useState, useEffect } from "react";
import styles from "./report.module.css";
import {
  Calendar,
  ChevronDown,
  Filter,
  Download,
  FileText,
  DollarSign,
  Tag,
  CreditCard,
  TrendingUp,
  Search,TrendingDown, Home,Wallet
} from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const Report = () => {
  
  const [startMonth, setStartMonth] = useState(new Date().getMonth());
  const [endMonth, setEndMonth] = useState(new Date().getMonth());
  const [isOpenStart, setIsOpenStart] = useState(false);
  const [isOpenEnd, setIsOpenEnd] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [category, setCategory] = useState([]);
  const [cat, setCat] = useState("");
  const [type, setType] = useState("");
  const [data, setData] = useState([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const router = useRouter();


  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  
  const getAccount = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/Home/GetAccount");
      const data = await res.json();
      setAccounts(data);
    } catch (err) {
      console.error("Error fetching accounts:", err);
    }
  };

  
  const getCategory = async () => {
    try {
      const token = Cookies.get("jwtToken");
      const res = await fetch("http://localhost:8000/api/Home/GetCategory", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCategory(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };


  const exportCSV = () => {
    if (data.length === 0) {
      alert("No data to export!");
      return;
    }

    const header = Object.keys(data[0]).join(",") + "\n";
    const rows = data.map(row => Object.values(row).join(",")).join("\n");

    const csvContent = header + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  
  const applyFilter = async () => {
    try {
      const user = Cookies.get("user");
      const params = new URLSearchParams({
        user,
        startMonth: (startMonth + 1).toString(),
        endMonth: (endMonth + 1).toString()
      });

      if (accountId) params.append("accountId", accountId.toString());
      if (cat) params.append("categoryId", cat.toString());
      if (type) params.append("type", type.toLowerCase());
      if (amount && !isNaN(amount) && amount > 0) params.append("amount", amount.toString());

      const res = await fetch(`http://localhost:8000/api/Report/ApplyFilter/ApplyFilter?${params.toString()}`);
      const d = await res.json();
      setData(d);
    } catch (err) {
      console.error("Error applying filter:", err);
    }
  };

  useEffect(() => {
    getAccount();
    getCategory();
  }, []);


  const totalAmount = data.reduce((sum, item) => sum + (item.amount || 0), 0);
  const incomeTotal = data.filter(item => item.type?.toLowerCase() === "income").reduce((sum, item) => sum + (item.amount || 0), 0);
  const expenseTotal = data.filter(item => item.type?.toLowerCase() === "expense").reduce((sum, item) => sum + (item.amount || 0), 0);

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
          <FileText size={32} className={styles.iconBlue} />
          <div>
            <h1 className={styles.mainTitle}>Reports & Analytics</h1>
            <p className={styles.subtitle}>Filter and export your financial data</p>
          </div>
        </div>
      </div>

      
      <div className={styles.filter}>
        <div className={styles.filterHeader}>
          <div className={styles.filterTitleWrapper}>
            <Filter size={24} className={styles.iconBlue} />
            <h2 className={styles.filterTitle}>Filter Options</h2>
          </div>
        </div>

        <div className={styles.filterGrid}>

          {/* Type */}
          <div className={styles.filterCard}>
            <h3 className={styles.sectionTitle}><Tag size={18}/> By Type</h3>
            <div className={styles.radioGroup}>
              <label className={`${styles.radioOption} ${type === "income" ? styles.active : ''}`}>
                <input 
                  type="radio" 
                  name="type" 
                  value="income" 
                  checked={type === "income"} 
                  onChange={(e) => setType(e.target.value)} 
                />
                <div className={styles.radioContent}>
                  <TrendingUp size={20} /> <span>Income</span>
                </div>
              </label>
              <label className={`${styles.radioOption} ${type === "expense" ? styles.active : ''}`}>
                <input 
                  type="radio" 
                  name="type" 
                  value="expense" 
                  checked={type === "expense"} 
                  onChange={(e) => setType(e.target.value)} 
                />
                <div className={styles.radioContent}>
                  <TrendingDown size={20} /> <span>Expense</span>
                </div>
              </label>
            </div>
          </div>

          {/* Start Month */}
          <div className={styles.filterCard}>
            <h3 className={styles.sectionTitle}><Calendar size={18}/> Start Month</h3>
            <div className={styles.monthSelectorWrapper}>
              <div className={styles.monthButton} onClick={() => setIsOpenStart(!isOpenStart)}>
                {months[startMonth]} <ChevronDown size={18}/>
              </div>
              {isOpenStart && (
                <div className={styles.dropdown}>
                  {months.map((month, index) => (
                    <div key={month} className={`${styles.dropdownItem} ${startMonth === index ? styles.active : ''}`}
                      onClick={() => { setStartMonth(index); setIsOpenStart(false); }}>
                      {month}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* End Month */}
          <div className={styles.filterCard}>
            <h3 className={styles.sectionTitle}><Calendar size={18}/> End Month</h3>
            <div className={styles.monthSelectorWrapper}>
              <div className={styles.monthButton} onClick={() => setIsOpenEnd(!isOpenEnd)}>
                {months[endMonth]} <ChevronDown size={18}/>
              </div>
              {isOpenEnd && (
                <div className={styles.dropdown}>
                  {months.map((month, index) => (
                    <div key={month} className={`${styles.dropdownItem} ${endMonth === index ? styles.active : ''}`}
                      onClick={() => { setEndMonth(index); setIsOpenEnd(false); }}>
                      {month}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Account */}
          <div className={styles.filterCard}>
            <h3 className={styles.sectionTitle}><CreditCard size={18}/> By Account</h3>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={styles.dropdownSelect}>
              <option value="">Choose Account...</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          {/* Category */}
          <div className={styles.filterCard}>
            <h3 className={styles.sectionTitle}><Tag size={18}/> By Category</h3>
            <select value={cat} onChange={(e) => setCat(e.target.value)} className={styles.dropdownSelect}>
              <option value="">Choose Category...</option>
              {category.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Amount */}
          <div className={styles.filterCard}>
            <h3 className={styles.sectionTitle}><DollarSign size={18}/> Amount</h3>
            <div className={styles.inputWrapper}>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                className={styles.input} 
                placeholder="Enter Amount"
              />
              <span className={styles.currency}>BDT</span>
            </div>
          </div>

        
          <div className={styles.filterCard}>
            <h3 className={styles.sectionTitle}><Search size={18}/> Actions</h3>
            <div className={styles.buttonGroup}>
              <button className={styles.btnApply} onClick={applyFilter}>
                <Search size={18}/> Apply Filter
              </button>
              <button className={styles.btnExport} onClick={exportCSV}>
                <Download size={18}/> Export CSV
              </button>
            </div>
          </div>

        </div>
      </div>

    
      {data.length > 0 && (
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.statCardBlue}`}>
            <div className={styles.statIcon}><FileText size={24}/></div>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Total Records</p>
              <h3 className={styles.statValue}>{data.length}</h3>
            </div>
          </div>
        </div>
      )}

      
      <div className={styles.report}>
        {data.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><FileText size={64}/></div>
            <h3 className={styles.emptyTitle}>No Data Available</h3>
            <p className={styles.emptyText}>Please apply filters to see the report</p>
          </div>
        ) : (
          <div className={styles.cards}>
            {data.map((item, index) => (
              <div key={index} className={`${styles.card} ${item.type?.toLowerCase() === "income" ? styles.cardIncome : styles.cardExpense}`}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIconWrapper}>
                    {item.type?.toLowerCase() === "income" ? <TrendingUp size={24}/> : <TrendingDown size={24}/>}
                  </div>
                  <div className={styles.cardType}>
                    <span className={styles.typeBadge}>{item.type}</span>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardTitle}>
                    <Tag size={16}/>
                    <p>{item.categoryName}</p>
                  </div>
                  <div className={styles.cardAmt}>
                    <h1>{(item.amount || 0).toLocaleString()}</h1>
                    <span>BDT</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Report;
