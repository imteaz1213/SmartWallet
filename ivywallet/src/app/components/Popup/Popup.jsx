
"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./popup.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Calendar,
  X,
  DollarSign,
  Tag,
  CheckCircle,
  Wallet,
  NotepadText,
} from "lucide-react";
import Cookies from "js-cookie";

const Popup = ({ onClose, income = null, refreshIncome }) => {
  const token = Cookies.get("jwtToken");
  const userId = Cookies.get("user");

  
  const parseIncomeDate = () => {
    if (!income) return new Date();

    const raw =
      income.date ||
      income.i_Date ||
      income.i_date ||
      income.createdAt ||
      income.Date ||
      income.dateTime;

    if (!raw) return new Date();

    const d = new Date(raw);
    return isNaN(d.getTime()) ? new Date() : d;
  };


  const [title, setTitle] = useState(income?.title || "");
  const [amount, setAmount] = useState(income?.i_Amount || "");
  const [cat, setCat] = useState(income?.categoryId || "");
  const [accountId, setAccountId] = useState(income?.accountId || "");
  const [desc, setDesc] = useState(income?.description || "");
  const [selectedDate, setSelectedDate] = useState(parseIncomeDate());
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const datePickerRef = useRef(null);

  const formattedDate = isNaN(selectedDate)
    ? "Select Date"
    : selectedDate.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

  const getCategory = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/Home/GetCategory", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategory(await res.json());
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const getAccounts = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/Home/GetAccount");
      setAccounts(await res.json());
    } catch (err) {
      console.error("Error fetching accounts:", err);
    }
  };


  const saveIncome = async () => {
    if (!title || !amount) return alert("Title and Amount are required");

    const data = {
      id: income?.id,
      title,
      description: desc,
      date: selectedDate.toISOString(),
      amount: Number(amount),
      categoryId: cat ? Number(cat) : null,
      accountId: accountId ? Number(accountId) : null,
      userId: Number(userId),
    };

    try {
      const url = income
        ? `http://localhost:8000/api/Income/UpdateIncome`
        : `http://localhost:8000/api/Income/AddIncome`;

      const method = income ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        alert(`Failed to ${income ? "update" : "add"} income`);
        console.log("Response status:", data);
        return;
      }

      refreshIncome?.();
      onClose();
    } catch (err) {
      console.error("Error saving income:", err);
      alert("Error saving income.");
    }
  };

  

  useEffect(() => {
    getCategory();
    getAccounts();

    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.iconWrapper}>
              <CheckCircle size={28} />
            </div>
            <div>
              <h2 className={styles.title}>
                {income ? "Update Income" : "Add New Income"}
              </h2>
              <p className={styles.subtitle}>Set your income!</p>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

      
        <div className={styles.formContainer}>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Tag size={18} />
              <span>Income Title</span>
            </label>
            <input
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Salary"
            />
          </div>

          
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <DollarSign size={18} />
              <span>Amount</span>
            </label>
            <input
              className={styles.input}
              type="number"
              value={amount}
              onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setAmount(''); 
                  } else if (parseFloat(value) >= 0) {
                    setAmount(value);
                  }
                }} 

            />
          </div>

        
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Tag size={18} />
              <span>Category</span>
            </label>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className={styles.dropdownSelect}
            >
              <option value="">Choose Category...</option>
              {category.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Wallet size={18} />
              <span>Account</span>
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className={styles.dropdownSelect}
            >
              <option value="">Choose Account...</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

    
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <NotepadText size={18} />
              <span>Description</span>
            </label>
            <input
              className={styles.input}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Short note..."
            />
          </div>

          
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Calendar size={18} />
              <span>Date</span>
            </label>
            <div
              className={styles.infoCard}
              onClick={() => setIsOpen(true)}
              ref={datePickerRef}
            >
              <span className={styles.infoValue}>{formattedDate}</span>

              {isOpen && (
                <div className={styles.datePickerWrapper}>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(d) => {
                      setSelectedDate(d);
                      setIsOpen(false);
                    }}
                    inline
                    showTimeSelect
                    dateFormat="MMM d, yyyy h:mm aa"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        
        <div className={styles.popupButtons}>
          <button className={styles.btnCancel} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.btnSave} onClick={saveIncome}>
            <CheckCircle size={18} /> {income ? "Update Income" : "Add Income"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
