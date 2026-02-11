
"use client";
import { useEffect, useState } from "react";
import styles from "./budgPopup.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, X, DollarSign, Tag, CheckCircle } from "lucide-react";
import Cookies from "js-cookie";

const BudgPopup = ({ onClose, budget = null, refreshBudgets }) => {
  const [category, setCategory] = useState([]);
  const [title, setTitle] = useState(budget?.title || "");
  const [cat, setCat] = useState(budget?.categoryId || 0);

  // Fix for invalid date: ensure string is parsed correctly
  const parseBudgetDate = (dateStr) => {
    if (!dateStr) return new Date();
    // Replace space with T if needed and append Z to treat as UTC
    const formatted = dateStr.includes("T") ? dateStr : dateStr.replace(" ", "T");
    return new Date(formatted.endsWith("Z") ? formatted : formatted + "Z");
  };

  const [selectedDate, setSelectedDate] = useState(
    budget ? parseBudgetDate(budget.date) : new Date()
  );
  const [amount, setAmount] = useState(budget?.total || 0);
  const [isOpen, setIsOpen] = useState(false);

  const formattedDate = selectedDate.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Fetch categories
  const getCategory = async () => {
    try {
      const token = Cookies.get("jwtToken");
      const res = await fetch(`http://localhost:8000/api/Home/GetCategory`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      setCategory(data);
    } catch (err) {
      console.error("Error fetching category:", err);
    }
  };

  // Add or update budget
  const saveBudget = async () => {
    const user = parseInt(Cookies.get("user"));
    if (!user) return alert("User not found");
    if (!cat) return alert("Please select a category");

    const budgetData = {
      id: budget?.id || 0,
      title: title,
      amount: parseFloat(amount),
      date: selectedDate.toISOString(),
      userId: user,
      categoryIds: [parseInt(cat)],
    };

    try {
      const url = budget
        ? `http://localhost:8000/api/Budget/UpdateBudget`
        : `http://localhost:8000/api/Budget/AddBudget`;
      const method = budget ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(budgetData),
      });

      if (res.ok) {
        onClose();
        refreshBudgets?.(); // Refresh the budget list
      } else {
        const errorText = await res.text();
        alert(`Failed to ${budget ? "update" : "add"} budget: ${errorText}`);
      }
    } catch (err) {
      console.error(`Error ${budget ? "updating" : "adding"} budget:`, err);
      alert(`Error ${budget ? "updating" : "adding"} budget`);
    }
  };

  useEffect(() => {
    getCategory();
  }, []);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.iconWrapper}>
              <CheckCircle size={28} />
            </div>
            <div>
              <h2 className={styles.title}>{budget ? "Update Budget" : "Add New Budget"}</h2>
              <p className={styles.subtitle}>Set your spending limit</p>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className={styles.formContainer}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Tag size={18} />
              <span>Budget Title</span>
            </label>
            <input
              className={styles.input}
              placeholder="e.g., Monthly Groceries"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <DollarSign size={18} />
              <span>Budget Amount</span>
            </label>
            <div className={styles.inputWrapper}>
              <input
                className={styles.input}
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") setAmount("");
                  else if (parseFloat(value) >= 0) setAmount(value);
                }}
                type="number"
              />
              <span className={styles.currency}>BDT</span>
            </div>
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
              <Calendar size={18} />
              <span>Date</span>
            </label>
            <div className={styles.infoCard} onClick={() => setIsOpen(true)}>
              <div className={styles.infoLeft}>
                <Calendar className={styles.infoIcon} size={18} />
                <span className={styles.infoLabel}>Created on</span>
              </div>
              <span className={styles.infoValue}>{formattedDate}</span>
              {isOpen && (
                <div className={styles.datePickerWrapper}>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => {
                      setSelectedDate(date);
                      setIsOpen(false);
                    }}
                    onClickOutside={() => setIsOpen(false)}
                    inline
                    showTimeSelect
                    timeFormat="hh:mm aa"
                    dateFormat="MMM d, yyyy h:mm aa"
                    className={styles.customDatepicker}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className={styles.popupButtons}>
          <button className={styles.btnCancel} onClick={onClose}>
            Cancel
          </button>
          <button onClick={saveBudget} className={styles.btnSave}>
            <CheckCircle size={18} />
            {budget ? "Update Budget" : "Add Budget"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgPopup;
