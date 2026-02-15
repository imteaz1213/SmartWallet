
"use client";
import React, { useEffect, useState, useRef } from "react";
import styles from "./exppopup.module.css";
import {
  Calendar, X, DollarSign, Tag, CheckCircle, Wallet, NotepadText
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const ExpPopup = ({ onClose, editData = null, refresh }) => {
  const router = useRouter();
  const datePickerRef = useRef(null);

  
  const [category, setCategory] = useState([]);
  const [accounts, setAccounts] = useState([]);

  
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [cat, setCat] = useState("");
  const [accountId, setAccountId] = useState("");
  const [desc, setDesc] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);

 
  useEffect(() => {
    if (editData) {
      setTitle(editData.e_Name || "");
      setAmount(editData.e_Amount || "");
      setCat(editData.CategoryId || "");
      setAccountId(editData.AccountId || "");
      setDesc(editData.Description || "");


      const parsedDate = new Date(editData.Date);
      setSelectedDate(isNaN(parsedDate.getTime()) ? new Date() : parsedDate);
    } else {
      setTitle("");
      setAmount("");
      setCat("");
      setAccountId("");
      setDesc("");
      setSelectedDate(new Date());
    }
  }, [editData]);


  const formattedDate = isNaN(selectedDate.getTime())
    ? ""
    : selectedDate.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });


  const getCategory = async () => {
    try {
      const token = Cookies.get("jwtToken");
      const res = await fetch("http://localhost:8000/api/Home/GetCategory", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCategory(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };


  const getAccount = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/Home/GetAccount");
      const data = await res.json();
      setAccounts(data);
    } catch (err) {
      console.error("Error fetching accounts:", err);
    }
  };

  useEffect(() => {
    getCategory();
    getAccount();

    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const saveExpense = async () => {
    const user = Cookies.get("user");
    if (!user) {
      router.push("/Login");
      return;
    }

    if (!title || !amount) {
      alert("Title and Amount are required!");
      return;
    }

    const data = {
      Id: editData?.id || 0,
      Title: title,
      Amount: parseFloat(amount),
      CategoryId: cat ? Number(cat) : null,
      AccountId: accountId ? Number(accountId) : null,
      Description: desc,
      Date: selectedDate.toISOString(),
      UserId: Number(user),
    };

    try {
      const url = editData
        ? "http://localhost:8000/api/Expense/UpdateExpense"
        : "http://localhost:8000/api/Expense/AddExpense";

      const method = editData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        alert("Failed to save expense");
        return;
      }

      refresh?.();
      onClose();
    } catch (err) {
      console.error("Error saving expense:", err);
      alert("Something went wrong!");
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>

       
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.iconWrapper}><CheckCircle size={28} /></div>
            <div>
              <h2 className={styles.title}>{editData ? "Update Expense" : "Add New Expense"}</h2>
              <p className={styles.subtitle}>{editData ? "Edit your expense!" : "Set your expense!"}</p>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}><X size={24} /></button>
        </div>

 
        <div className={styles.formContainer}>

          <div className={styles.formGroup}>
            <label className={styles.label}><Tag size={18} /><span>Expense Title</span></label>
            <input className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Rent" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}><DollarSign size={18} /><span>Amount</span></label>
            <input className={styles.input} type="number" value={amount} onChange={(e) => {
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
            <label className={styles.label}><Tag size={18} /><span>Category</span></label>
            <select className={styles.dropdownSelect} value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">Choose Category...</option>
              {category.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}><Wallet size={18} /><span>Account</span></label>
            <select className={styles.dropdownSelect} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              <option value="">Choose Account...</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}><NotepadText size={18} /><span>Description</span></label>
            <input className={styles.input} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Short note..." />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}><Calendar size={18} /><span>Date</span></label>
            <div className={styles.infoCard} onClick={() => setIsOpen(true)} ref={datePickerRef}>
              <span className={styles.infoValue}>{formattedDate || "Select Date"}</span>
              {isOpen && (
                <div className={styles.datePickerWrapper}>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(d) => { setSelectedDate(d); setIsOpen(false); }}
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
          <button className={styles.btnCancel} onClick={onClose}>Cancel</button>
          <button className={styles.btnSave} onClick={saveExpense}>
            <CheckCircle size={18} /> {editData ? "Update Expense" : "Add Expense"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ExpPopup;
