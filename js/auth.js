import { api } from './api.js';
import i18n from './i18n.js';

class AuthUI {
    constructor() {
        this.form = document.getElementById('auth-form');
        this.authTitle = document.getElementById('auth-title');
        this.registerFields = document.getElementById('register-fields');
        this.toggleAuth = document.getElementById('toggle-auth');
        this.submitBtn = document.getElementById('submit-btn');
        this.buttonText = document.getElementById('button-text');
        this.buttonLoader = document.getElementById('button-loader');
        this.toast = document.getElementById('toast');
        this.togglePasswordBtn = document.getElementById('toggle-password');
        this.isLogin = true;

        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        this.toggleAuth.addEventListener('click', (e) => {
            e.preventDefault();
            this.isLogin = !this.isLogin;
            this.updateUI();
        });

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Real-time validation
        this.form.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => this.validateField(input));
            input.addEventListener('blur', () => this.validateField(input));
        });

        // Password visibility toggle
        this.togglePasswordBtn.addEventListener('click', () => {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            this.togglePasswordBtn.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });

        // Password strength meter
        document.getElementById('password').addEventListener('input', (e) => {
            this.updatePasswordStrength(e.target.value);
        });
    }

    updateUI() {
        this.authTitle.textContent = i18n.t(this.isLogin ? 'login' : 'register');
        this.buttonText.textContent = i18n.t(this.isLogin ? 'login' : 'register');
        this.toggleAuth.textContent = i18n.t(this.isLogin ? 'register' : 'login');
        this.registerFields.classList.toggle('hidden', this.isLogin);
        this.form.reset();
        this.clearErrors();
    }

    validateField(input) {
        const value = input.value.trim();
        const errorElement = document.getElementById(`${input.id}-error`);
        let error = '';

        switch (input.id) {
            case 'username':
                if (!value) error = i18n.t('required_field');
                else if (value.length < 3) error = i18n.t('min_length', { 0: '3' });
                break;

            case 'password':
                if (!value) error = i18n.t('required_field');
                else if (value.length < 6) error = i18n.t('min_length', { 0: '6' });
                break;

            case 'email':
                if (!this.isLogin) {
                    if (!value) error = i18n.t('required_field');
                    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                        error = i18n.t('invalid_email');
                    }
                }
                break;

            case 'confirm-password':
                if (!this.isLogin) {
                    const password = document.getElementById('password').value;
                    if (!value) error = i18n.t('required_field');
                    else if (value !== password) error = i18n.t('passwords_not_match');
                }
                break;

            case 'role':
                if (!this.isLogin && !value) error = i18n.t('required_field');
                break;
        }

        if (errorElement) {
            errorElement.textContent = error;
            input.classList.toggle('error', !!error);
        }

        return !error;
    }

    updatePasswordStrength(password) {
        const strengthElement = document.getElementById('password-strength');
        if (!password) {
            strengthElement.style.width = '0';
            return;
        }

        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*]/.test(password)
        };

        const strength = Object.values(checks).filter(Boolean).length;
        const percentage = (strength / 5) * 100;
        const colors = ['#ef4444', '#f59e0b', '#10b981'];
        const colorIndex = Math.floor((strength - 1) / 2);

        strengthElement.style.width = `${percentage}%`;
        strengthElement.style.backgroundColor = colors[colorIndex] || colors[0];
    }

    showToast(message, type = 'success') {
        this.toast.textContent = message;
        this.toast.className = `toast toast-${type} animate-fadeIn`;
        setTimeout(() => this.toast.classList.add('hidden'), 3000);
    }

    setLoading(loading) {
        this.submitBtn.disabled = loading;
        this.buttonText.classList.toggle('hidden', loading);
        this.buttonLoader.classList.toggle('hidden', !loading);
    }

    clearErrors() {
        this.form.querySelectorAll('.error-message').forEach(error => error.textContent = '');
        this.form.querySelectorAll('input').forEach(input => input.classList.remove('error'));
    }

    validateForm() {
        let isValid = true;
        const requiredFields = ['username', 'password'];

        if (!this.isLogin) {
            requiredFields.push('email', 'confirm-password', 'role');
        }

        requiredFields.forEach(fieldId => {
            const input = document.getElementById(fieldId);
            if (input && !this.validateField(input)) {
                isValid = false;
            }
        });

        if (!this.isLogin) {
            const terms = document.getElementById('terms');
            const termsError = document.getElementById('terms-error');
            if (!terms.checked) {
                termsError.textContent = i18n.t('required_field');
                isValid = false;
            } else {
                termsError.textContent = '';
            }
        }

        return isValid;
    }

    async handleSubmit(e) {
        e.preventDefault();
        if (!this.validateForm()) return;

        this.setLoading(true);
        try {
            const formData = {
                username: document.getElementById('username').value,
                password: document.getElementById('password').value
            };

            if (!this.isLogin) {
                formData.email = document.getElementById('email').value;
                formData.role = document.getElementById('role').value;
                formData.name = document.getElementById('name').value;
                const result = await api.register(formData);
                if (result.success) {
                    this.showToast(i18n.t('registration_success'));
                    this.isLogin = true;
                    this.updateUI();
                }
            } else {
                const result = await api.login(formData);
                if (result.success) {
                    const rememberMe = document.getElementById('remember-me').checked;
                    if (rememberMe) {
                        localStorage.setItem('remember_me', 'true');
                    }
                    window.location.href = 'dashboard.html';
                }
            }
        } catch (error) {
            this.showToast(error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }
}

// Initialize auth UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthUI();
});