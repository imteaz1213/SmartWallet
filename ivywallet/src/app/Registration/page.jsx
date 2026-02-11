"use client"
import React, { useState, useEffect } from "react";
import styles from "./registration.module.css";
import { useRouter } from "next/navigation";
import { User, Lock, Mail, MapPin, Phone, DollarSign, ArrowRight, Sparkles, CheckCircle } from "lucide-react";

const Registration = () => { 
    const router = useRouter();
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [currency, setCurrency] = useState([]);
    const [phone, setPhone] = useState("");
    const [curr_id, setCurr_id] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const Getcurrency = async () => {
        try {
            const res = await fetch(`http://localhost:8000/api/Home/GetCurrency`, {
                method: "GET"
            });
            const data = await res.json();
            setCurrency(data);
        } catch (error) {
            console.error(error);
        }
    }
    
    const Register = async (data) => {
        try {
            setIsLoading(true);
            const response = await fetch(`http://localhost:8000/api/Auth/Register/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error("Registration failed");
            }
            
            alert("Registration successful! Please login.");
            router.push("/Login");
        } catch (e) {
            console.error("Failed", e);
            alert("Registration failed. Please try again.");
            setIsLoading(false);
        }
    };
    
    const handle = (e) => {
        e.preventDefault();
        
        if (!userName || !email || !password || !address || !phone || !curr_id) {
            alert("Please fill in all fields");
            return;
        }
        
        const user = { 
            name: userName, 
            email: email, 
            password: password, 
            address: address, 
            phone: phone,
            currencyId: Number(curr_id)
        };
        Register(user);
    };


    useEffect(() => {
        Getcurrency();
    }, []);
    

    return (
        <div className={styles.main}>
            <div className={styles.backgroundGradient}></div>
            <div className={styles.backgroundPattern}></div>
            
            <div className={styles.container}>
                {/* Left Side - Branding */}
                <div className={styles.leftSection}>
                    <div className={styles.brandingContent}>
                        <div className={styles.logoSection}>
                            <Sparkles className={styles.logoIcon} size={40} />
                            <h1 className={styles.brandTitle}>SmartWallet</h1>
                        </div>
                        <h2 className={styles.welcomeTitle}>Start Your Financial Journey</h2>
                        <p className={styles.welcomeText}>
                            Join thousands of users who are taking control of their finances. 
                            Track, manage, and grow your wealth with our powerful tools.
                        </p>
                        <div className={styles.benefits}>
                            <div className={styles.benefit}>
                                <CheckCircle className={styles.checkIcon} size={24} />
                                <div>
                                    <h4>Smart Tracking</h4>
                                    <p>Automatically categorize and track all your transactions</p>
                                </div>
                            </div>
                            <div className={styles.benefit}>
                                <CheckCircle className={styles.checkIcon} size={24} />
                                <div>
                                    <h4>Visual Insights</h4>
                                    <p>Beautiful charts and reports for better understanding</p>
                                </div>
                            </div>
                            <div className={styles.benefit}>
                                <CheckCircle className={styles.checkIcon} size={24} />
                                <div>
                                    <h4>Budget Goals</h4>
                                    <p>Set and achieve your financial targets with ease</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Registration Form */}
                <div className={styles.rightSection}>
                    <div className={styles.formContainer}>
                        <div className={styles.formHeader}>
                            <h2 className={styles.formTitle}>Create Account</h2>
                            <p className={styles.formSubtitle}>Fill in your details to get started</p>
                        </div>

                        <form onSubmit={handle} className={styles.form}>
                            <div className={styles.formGrid}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Full Name</label>
                                    <div className={styles.inputWrapper}>
                                        <User className={styles.inputIcon} size={20} />
                                        <input 
                                            type="text" 
                                            onChange={(e) => setUserName(e.target.value)} 
                                            value={userName}  
                                            className={styles.input}
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Email Address</label>
                                    <div className={styles.inputWrapper}>
                                        <Mail className={styles.inputIcon} size={20} />
                                        <input 
                                            type="email" 
                                            onChange={(e) => setEmail(e.target.value)} 
                                            value={email} 
                                            className={styles.input}
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Password</label>
                                    <div className={styles.inputWrapper}>
                                        <Lock className={styles.inputIcon} size={20} />
                                        <input 
                                            type="password" 
                                            onChange={(e) => setPassword(e.target.value)} 
                                            value={password} 
                                            className={styles.input}
                                            placeholder="Create a password"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Phone Number</label>
                                    <div className={styles.inputWrapper}>
                                        <Phone className={styles.inputIcon} size={20} />
                                        <input 
                                            type="tel" 
                                            onChange={(e) => setPhone(e.target.value)} 
                                            value={phone} 
                                            className={styles.input}
                                            placeholder="Enter your phone"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Address</label>
                                    <div className={styles.inputWrapper}>
                                        <MapPin className={styles.inputIcon} size={20} />
                                        <input 
                                            type="text" 
                                            onChange={(e) => setAddress(e.target.value)} 
                                            value={address} 
                                            className={styles.input}
                                            placeholder="Enter your address"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Currency</label>
                                    <div className={styles.inputWrapper}>
                                        <DollarSign className={styles.inputIcon} size={20} />
                                        <select 
                                            value={curr_id} 
                                            onChange={(e) => setCurr_id(e.target.value)} 
                                            className={styles.input}
                                            required
                                        >
                                            <option value="">Select currency...</option>
                                            {currency.map((c) => (
                                                <option key={c.id} value={c.id}>{c.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className={styles.submitBtn}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span>Creating Account...</span>
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className={styles.divider}>
                            <span>OR</span>
                        </div>

                        <div className={styles.footer}>
                            <p className={styles.footerText}>
                                Already have an account?
                            </p>
                            <button onClick={() => router.push("/Login")} className={styles.loginBtn}>
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Registration;