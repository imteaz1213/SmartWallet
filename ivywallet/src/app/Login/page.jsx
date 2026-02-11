"use client"
import React, { useState } from "react";
import styles from "./login.module.css"
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Mail, Lock, ArrowRight, Sparkles } from "lucide-react";

const Login = () => { 
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const login = async (data) => {
        try {
            setIsLoading(true);
            const response = await fetch(`http://localhost:8000/api/Auth/Login/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                alert("Invalid credentials!");
                setIsLoading(false);
                return;
            }
            
            const result = await response.json();
            Cookies.set("jwtToken", result.token, { expires: 1 });
            Cookies.set("user", result.user.id, { expires: 1 });
            router.push("/Main");
        } catch (error) {
            console.error(error);
            alert("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    const handle = (e) => {
        e.preventDefault();
        if (!email || !password) {
            alert("Please fill in all fields");
            return;
        }
        const cred = {
            email: email,
            password: password
        };
        login(cred);
    };

    const Go = () => {
        router.push("/Registration");
    };

    return (
        <div className={styles.main}>
            <div className={styles.backgroundGradient}></div>
            <div className={styles.backgroundPattern}></div>
            
            <div className={styles.container}>
        
                <div className={styles.leftSection}>
                    <div className={styles.brandingContent}>
                        <div className={styles.logoSection}>
                            <Sparkles className={styles.logoIcon} size={40} />
                            <h1 className={styles.brandTitle}>SmartWallet</h1>
                        </div>
                        <h2 className={styles.welcomeTitle}>Welcome Back!</h2>
                        <p className={styles.welcomeText}>
                            Manage your finances smarter. Track every penny, plan your budget, 
                            and achieve your financial goals with ease.
                        </p>
                        <div className={styles.features}>
                            <div className={styles.feature}>
                                <div className={styles.featureIcon}>💰</div>
                                <span>Track Income & Expenses</span>
                            </div>
                            <div className={styles.feature}>
                                <div className={styles.featureIcon}>📊</div>
                                <span>Visual Reports</span>
                            </div>
                            <div className={styles.feature}>
                                <div className={styles.featureIcon}>🎯</div>
                                <span>Budget Planning</span>
                            </div>
                        </div>
                    </div>
                </div>

            
                <div className={styles.rightSection}>
                    <div className={styles.formContainer}>
                        <div className={styles.formHeader}>
                            <h2 className={styles.formTitle}>Sign In</h2>
                            <p className={styles.formSubtitle}>Enter your credentials to access your account</p>
                        </div>

                        <form onSubmit={handle} className={styles.form}>
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
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.forgotPassword}>
                                <a href="#" className={styles.forgotLink}>Forgot password?</a>
                            </div>

                            <button 
                                type="submit" 
                                className={styles.loginBtn}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span>Signing in...</span>
                                ) : (
                                    <>
                                        <span>Sign In</span>
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
                                Don't have an account?
                            </p>
                            <button onClick={Go} className={styles.registerBtn}>
                                Create Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;