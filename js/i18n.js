// Internationalization support
const defaultLocale = 'en';

const translations = {
    en: {
        // Common
        app_title: 'Inventory Management System',
        loading: 'Loading...',
        error: 'An error occurred',
        success: 'Success',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        submit: 'Submit',
        confirm: 'Confirm',
        back: 'Back',
        
        // Authentication
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        username: 'Username',
        password: 'Password',
        confirm_password: 'Confirm Password',
        email: 'Email',
        role: 'Role',
        remember_me: 'Remember me',
        forgot_password: 'Forgot Password?',
        invalid_credentials: 'Invalid username or password',
        registration_success: 'Registration successful',
        passwords_not_match: 'Passwords do not match',
        
        // Roles
        admin: 'Administrator',
        manager: 'Manager',
        purchaser: 'Purchaser',
        salesperson: 'Salesperson',
        warehouse: 'Warehouse Staff',
        
        // Dashboard
        dashboard: 'Dashboard',
        total_skus: 'Total SKUs',
        in_stock: 'In Stock',
        low_stock: 'Low Stock',
        open_pos: 'Open POs',
        upcoming_deliveries: 'Upcoming Deliveries',
        recent_updates: 'Recent Updates',
        alerts: 'Alerts',
        
        // Inventory
        inventory: 'Inventory',
        product: 'Product',
        quantity: 'Quantity',
        stock_level: 'Stock Level',
        reorder_point: 'Reorder Point',
        location: 'Location',
        
        // Purchase Orders
        purchase_orders: 'Purchase Orders',
        create_po: 'Create Purchase Order',
        review_po: 'Review Purchase Order',
        supplier: 'Supplier',
        expected_delivery: 'Expected Delivery',
        po_status: {
            draft: 'Draft',
            submitted: 'Submitted',
            approved: 'Approved',
            rejected: 'Rejected',
            shipped: 'Shipped',
            received: 'Received'
        },
        
        // Sales
        sales: 'Sales',
        record_sale: 'Record Sale',
        customer: 'Customer',
        sale_date: 'Sale Date',
        total_amount: 'Total Amount',
        check_availability: 'Check Availability',
        available: 'Available',
        out_of_stock: 'Out of Stock',
        low_stock_warning: 'Low Stock Warning',
        
        // Feedback
        feedback: 'Feedback',
        rating: 'Rating',
        comments: 'Comments',
        demand_indication: 'Demand Indication',
        submit_feedback: 'Submit Feedback',
        
        // Warehouse
        update_stock: 'Update Stock',
        issue_stock: 'Issue Stock',
        report_faulty: 'Report Faulty Stock',
        received_quantity: 'Received Quantity',
        damaged_quantity: 'Damaged Quantity',
        fault_type: 'Fault Type',
        
        // Settings
        settings: 'Settings',
        profile: 'Profile',
        theme: 'Theme',
        language: 'Language',
        notifications: 'Notifications',
        
        // Validation Messages
        required_field: 'This field is required',
        invalid_email: 'Please enter a valid email address',
        min_length: 'Must be at least {0} characters',
        max_length: 'Must be less than {0} characters',
        positive_number: 'Must be a positive number',
        
        // Error Messages
        unauthorized: 'You are not authorized to perform this action',
        session_expired: 'Your session has expired. Please login again',
        network_error: 'Network error. Please try again',
        
        // Success Messages
        changes_saved: 'Changes saved successfully',
        item_created: 'Item created successfully',
        item_updated: 'Item updated successfully',
        item_deleted: 'Item deleted successfully'
    }
};

class I18n {
    constructor() {
        this.locale = localStorage.getItem('locale') || defaultLocale;
    }

    setLocale(locale) {
        if (translations[locale]) {
            this.locale = locale;
            localStorage.setItem('locale', locale);
        }
    }

    t(key, params = {}) {
        const keys = key.split('.');
        let translation = translations[this.locale];

        for (const k of keys) {
            translation = translation[k];
            if (!translation) break;
        }

        if (!translation) return key;

        return Object.entries(params).reduce(
            (str, [key, value]) => str.replace(`{${key}}`, value),
            translation
        );
    }

    getLocale() {
        return this.locale;
    }

    getAvailableLocales() {
        return Object.keys(translations);
    }
}

const i18n = new I18n();
export default i18n;