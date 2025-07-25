import React, { useState } from 'react'
import './Login.css'
import { assets } from '../../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'

const Login = ({ setShowLogin }) => {
    const [currState, setCurrState] = useState({
        name: '',
        email: '',
        password: '',
        dob: ''
    })
    const [error, setError] = useState('')
    const [isLogin, setIsLogin] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [showSuccessPopup, setShowSuccessPopup] = useState(false)
    const [showDisclaimer, setShowDisclaimer] = useState(true)

    const { login } = useAuth()

    const onChangeHandler = (e) => {
        const { name, value } = e.target
        setCurrState(prev => ({ ...prev, [name]: value }))
        setError('')
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        const { name, email, password, dob } = currState

        if ((!isLogin && (!name || !dob)) || !email || !password) {
            setError('Please fill all required fields')
            return
        }

        try {
            const BASE_URL = import.meta.env.VITE_API_BASE_URL
            const endpoint = isLogin ? '/api/users/login' : '/api/users/register'
            const response = await axios.post(`${BASE_URL}${endpoint}`, currState)

            if (response.data.success) {
                if (isLogin) {
                    if (response.data.token) {
                        login(response.data.token, response.data.user)
                        toast.success('Logged in successfully!')
                        setShowLogin(false)
                        window.location.reload()
                    } else {
                        setError('No token received. Login failed.')
                    }
                } else {
                    setShowSuccessPopup(true)
                }
            } else {
                setError(response.data.message || 'Something went wrong')
                toast.error(response.data.message || 'Something went wrong')
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Server error'
            setError(msg)
            toast.error(msg)
        }
    }

    const handleSuccessPopupClose = () => {
        setShowSuccessPopup(false)
        setIsLogin(true)
        setCurrState({ name: '', email: '', password: '', dob: '' })
    }

    return (
        <div className="login-overlay">
            {showDisclaimer && (
                <div className="news-banner">
    <p>
      ⚠️Disclaimer: This is a <strong> PLAYFUL EDUCATIONAL </strong>project.<br /> <strong>Do NOT use real emails or passwords.</strong> Alcohol delivery is restricted in India. Developers are not responsible for misuse.
    </p>
  </div>
            )}

            {showSuccessPopup ? (
                <div className="success-popup">
                    <div className="success-content">
                        <h3>🎉 Registration Successful!</h3>
                        <p>ID proof verification coming soon in future updates.</p>
                        <button onClick={handleSuccessPopupClose}>Continue to Login</button>
                    </div>
                </div>
            ) : (
                <div className="login-container">
                    <div className="login-title">
                        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
                        <img
                            src={assets.cross_icon}
                            alt="Close"
                            className="close-button"
                            onClick={() => setShowLogin(false)}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={onSubmit} className="login-inputs">
                        {!isLogin && (
                            <>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                    value={currState.name}
                                    onChange={onChangeHandler}
                                    required
                                />
                                <div className="dob-field">
                                    <label>Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dob"
                                        value={currState.dob || ''}
                                        onChange={onChangeHandler}
                                        required
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </>
                        )}
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={currState.email}
                            onChange={onChangeHandler}
                            required
                        />
                        <div className="password-container">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Password"
                                value={currState.password}
                                onChange={onChangeHandler}
                                required
                            />
                            <button
                                type="button"
                                className="show-password-button"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>

                        {!isLogin && (
                            <div className="terms-privacy">
                                <div className="checkbox-wrapper">
                                    <input type="checkbox" id="terms" required />
                                    <label htmlFor="terms">
                                        I agree to the <a href="/legal">Terms & Conditions</a> and <a href="/about-us">Privacy Policy</a>
                                    </label>
                                </div>
                            </div>
                        )}

                        <button type="submit" className="submit-button">
                            {isLogin ? 'Login' : 'Sign Up'}
                        </button>

                        <p className="toggle-auth">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <span
                                onClick={() => {
                                    setIsLogin(!isLogin)
                                    setCurrState({ name: '', email: '', password: '', dob: '' })
                                    setError('')
                                }}
                            >
                                {isLogin ? 'Sign Up' : 'Login'}
                            </span>
                        </p>
                    </form>
                </div>
            )}
        </div>
    )
}

export default Login
