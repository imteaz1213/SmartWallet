"use client"
import React, { useState, useEffect } from "react";
import styles from "./main.module.css"
import { Calendar, ChevronDown, TrendingUp, TrendingDown, Wallet, FileText, LogOut, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const Main = () => {
      const [userIncomeData, setUserIncomeData] = useState([]);
      const [userExpenseData, setUserExpenseData] = useState([]);
      const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
      const [isOpen, setIsOpen] = useState(false);
      const router = useRouter();
      const [inc, setInc] = useState(0);
      const [exp, setExp] = useState(0);
      const [userCurr, setUserCurr] = useState("");
      const [total, setTotal] = useState(0);

      const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
      ];
      
      const getIncomeDataByMonth = async (month) => {
            const user_id = Cookies.get("user");
            const res = await fetch(`http://localhost:8000/api/Income/GetIncomeByMonth/${user_id}/${month + 1}`,
                  {
                        method: "GET",
                        headers: { "Content-Type": "application/json" }
                  }
            );
            const data = await res.json();
            setUserIncomeData(data);
      };


      const getExpenseDataByMonth = async (month) => {
            const user_id = Cookies.get("user");
            const res = await fetch(`http://localhost:8000/api/Expense/GetExpenseByMonth/${user_id}/${month + 1}`,   
                  {
                        method: "GET",                                  
                        headers: { "Content-Type": "application/json" }             
                  }
            );
            const data = await res.json();
            setUserExpenseData(data);
      };
      

      const getInc = async (month) => {
            const user_id = Cookies.get("user");
            const res = await fetch(`http://localhost:8000/api/Income/FullIncomeOfAUser/${user_id}/${month + 1}`,
                  {
                        method: "GET",                                  
                        headers: { "Content-Type": "application/json" }
                  }
            );
            const inc = await res.json();          
            setInc(inc);
      };

      const getExp = async (month) => {
            const user_id = Cookies.get("user");
            const res = await fetch(`http://localhost:8000/api/Expense/FullExpenseOfAUser/${user_id}/${month + 1}`,
                  {
                        method: "GET",                                  
                        headers: { "Content-Type": "application/json" }
                  }
            );
            const exp = await res.json();
            setExp(exp);
      };

      const getUserCurrency = async () => {
            const user_id = Cookies.get("user");
            const res = await fetch(`http://localhost:8000/api/Home/GetUserCurrency/${user_id}`,
                  {
                        method: "GET",                                  
                        headers: { "Content-Type": "application/json" }
                  }
            );
            const data = await res.json();
            setUserCurr(data[0].currency);
      }


      const logout = () => {
            Cookies.remove("user");
            Cookies.remove("jwtToken");
            router.push("/Login");
      }


      useEffect(() => { 
            getUserCurrency();
      }, []);

      useEffect(() => {
            setTotal(inc - exp);
      }, [inc, exp]);

      useEffect(() => {
            getInc(selectedMonth);
            getExp(selectedMonth);
      }, [selectedMonth]);     

      useEffect(() => {
            getIncomeDataByMonth(selectedMonth);
            getExpenseDataByMonth(selectedMonth);
      }, [selectedMonth]);


      return (
            <div className={styles.container}>
      
                  <div className={styles.sidebar}>
                        <div className={styles.logo}>
                              <h1 className={styles.logoText}>SmartWallet</h1>
                              <p className={styles.logoSubtext}>Smart Finance Manager</p>
                        </div>

                        <nav className={styles.nav}>
                              <button onClick={() => router.push("/Income")} className={styles.navItem}>
                                    <TrendingUp size={20} />
                                    <span>Income</span>
                              </button>
                              <button onClick={() => router.push("/Expense")} className={styles.navItem}>
                                    <TrendingDown size={20} />
                                    <span>Expense</span>
                              </button>
                              <button onClick={() => router.push("/Budget")} className={styles.navItem}>
                                    <Wallet size={20} />
                                    <span>Budget</span>
                              </button>
                              <button onClick={() => router.push("/Report")} className={styles.navItem}>
                                    <FileText size={20} />
                                    <span>Report</span>
                              </button>
                        </nav>

                        <button onClick={logout} className={styles.logoutBtn}>
                              <LogOut size={20} />
                              <span>Logout</span>
                        </button>
                  </div>

                  
                  <div className={styles.mainContent}>
            
                        <div className={styles.header}>
                              <div className={styles.headerText}>
                                    <h2 className={styles.welcomeText}>Welcome back!</h2>
                                    <p className={styles.headerSubtext}>Here's your financial overview</p>
                              </div>
                              
                              <div className={styles.headerActions}>
                                    <div className={styles.monthSelectorWrapper}>
                                          <button className={styles.monthButton} onClick={() => setIsOpen(!isOpen)}>
                                                <Calendar size={18} />
                                                      <span>{months[selectedMonth]}</span>
                                                <ChevronDown size={16} />
                                          </button>

                                          {isOpen && (
                                                <div className={styles.dropdown}>
                                                      {months.map((month, index) => (
                                                            <div
                                                                  key={month}
                                                                  className={styles.dropdownItem}
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
                              </div>
                        </div>

                        <div className={styles.statsGrid}>
                              <div onClick={() => router.push("/Income")} className={styles.incomeCard}>
                                    <div className={styles.cardDecoration}></div>
                                    <div className={styles.cardContent}>
                                          <div className={styles.cardHeader}>
                                                <div className={styles.cardIcon}>
                                                      <TrendingUp size={24} />
                                                </div>
                                                <span className={styles.cardTitle}>Income</span>
                                          </div>
                                          <p className={styles.cardAmount}>{inc.toLocaleString()} {userCurr}</p>
                                          <p className={styles.cardSubtext}>Here is the total income</p>
                                    </div>
                              </div>

                              <div onClick={() => router.push("/Expense")} className={styles.expenseCard}>
                                    <div className={styles.cardDecoration}></div>
                                    <div className={styles.cardContent}>
                                          <div className={styles.cardHeader}>
                                                <div className={styles.cardIcon}>
                                                      <TrendingDown size={24} />
                                                </div>
                                                <span className={styles.cardTitle}>Expense</span>
                                          </div>
                                          <p className={styles.cardAmount}>{exp.toLocaleString()} {userCurr}</p>
                                          <p className={styles.cardSubtext}>Here is the total expense</p>
                                    </div>
                              </div>

                              <div className={styles.balanceCard}>
                                    <div className={styles.cardDecoration}></div>
                                    <div className={styles.cardContent}>
                                          <div className={styles.cardHeader}>
                                                <div className={styles.cardIcon}>
                                                      <Wallet size={24} />
                                                </div>
                                                <span className={styles.cardTitle}>Balance</span>
                                          </div>
                                          <p className={`${styles.cardAmount} ${total < 0 ? styles.negative : styles.positive}`}>
                                                {total.toLocaleString()} {userCurr}
                                          </p>
                                          <p className={styles.cardSubtext}>{total < 0 ? 'Deficit' : 'Surplus'} this month</p>
                                    </div>
                              </div>
                        </div>

      
                        <div className={styles.transactionsSection}>
                              <h3 className={styles.sectionTitle}>Recent Transactions</h3>
                              
                              <div className={styles.transactionsList}>
                                    {userIncomeData.map((d, index) => (
                                          <div key={`income-${index}`} className={styles.transactionCard}>
                                                <div className={styles.transactionLeft}>
                                                      <div className={styles.transactionIconWrapper} style={{ background: `${d.c_Color}33`, borderColor: `${d.c_Color}66` }}>
                                                            <img src={d.c_Image} className={styles.transactionIcon} alt={d.c_Name} />
                                                      </div>
                                                      <div className={styles.transactionInfo}>
                                                            <p className={styles.transactionCategory}>{d.c_Name}</p>
                                                            <p className={styles.transactionAccount}>{d.a_Name}</p>
                                                      </div>
                                                </div>
                                                <div className={styles.transactionRight}>
                                                      <p className={styles.transactionAmountIncome}>+{d.i_Amount.toLocaleString()} {d.cr_Currency}</p>
                                                </div>
                                          </div>
                                    ))}

                                    {userExpenseData.map((d, index) => (
                                          <div key={`expense-${index}`} className={styles.transactionCard}>
                                                <div className={styles.transactionLeft}>
                                                      <div className={styles.transactionIconWrapper} style={{ background: `${d.c_Color}33`, borderColor: `${d.c_Color}66` }}>
                                                            <img src={d.c_Image} className={styles.transactionIcon} alt={d.c_Name} />
                                                      </div>
                                                      <div className={styles.transactionInfo}>
                                                            <p className={styles.transactionCategory}>{d.c_Name}</p>
                                                            <p className={styles.transactionAccount}>{d.a_Name}</p>
                                                      </div>
                                                </div>
                                                <div className={styles.transactionRight}>
                                                      <p className={styles.transactionAmountExpense}>-{d.e_Amount.toLocaleString()} {d.cr_Currency}</p>
                                                </div>
                                          </div>
                                    ))}

                                    {userIncomeData.length === 0 && userExpenseData.length === 0 && (
                                          <div className={styles.noData}>
                                                <p>No transactions found for {months[selectedMonth]}</p>
                                          </div>
                                    )}
                              </div>
                        </div>
                  </div>
            </div>
      );
};

export default Main;
