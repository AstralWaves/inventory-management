// API Layer for CRUD operations and role-based access control

// Simulated token management
const generateToken = (user) => {
    return btoa(JSON.stringify({ userId: user.username, role: user.role, exp: Date.now() + 3600000 }));
};

const verifyToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
        const decoded = JSON.parse(atob(token));
        if (decoded.exp < Date.now()) {
            localStorage.removeItem('token');
            return null;
        }
        return decoded;
    } catch (e) {
        localStorage.removeItem('token');
        return null;
    }
};

// Role-based access control
const permissions = {
    admin: ['*'],
    manager: ['view_inventory', 'view_forecast', 'manage_po', 'view_reports'],
    purchaser: ['view_forecast', 'create_po', 'track_orders', 'view_inventory', 'view_warehouse'],
    salesperson: ['record_sale', 'check_stock', 'submit_feedback'],
    warehouse: ['update_stock', 'issue_stock', 'report_faulty']
};

const canAccess = (feature) => {
    const user = verifyToken();
    if (!user) return false;
    
    const userPermissions = permissions[user.role];
    return userPermissions.includes('*') || userPermissions.includes(feature);
};

// CRUD operations with role checks
const api = {
    // Authentication
    login: async (credentials) => {
        const users = JSON.parse(localStorage.getItem('users')) || {};
        const user = users[credentials.username];
        
        if (user && user.password === credentials.password) {
            const token = generateToken({ username: credentials.username, role: user.role });
            localStorage.setItem('token', token);
            return { success: true, user: { username: credentials.username, role: user.role } };
        }
        throw new Error('Invalid credentials');
    },

    register: async (userData) => {
        const users = JSON.parse(localStorage.getItem('users')) || {};
        if (users[userData.username]) {
            throw new Error('Username already exists');
        }
        
        users[userData.username] = {
            password: userData.password,
            role: userData.role,
            email: userData.email,
            name: userData.name
        };
        
        localStorage.setItem('users', JSON.stringify(users));
        return { success: true };
    },

    // Inventory
    getInventory: async () => {
        if (!canAccess('view_inventory')) throw new Error('Unauthorized');
        return JSON.parse(localStorage.getItem('inventory')) || [];
    },

    updateStock: async (productId, quantity, type = 'update') => {
        if (!canAccess('update_stock')) throw new Error('Unauthorized');
        
        const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
        const product = inventory.find(p => p.id === productId);
        
        if (!product) throw new Error('Product not found');
        
        if (type === 'update') {
            product.stock = quantity;
        } else if (type === 'adjust') {
            product.stock += quantity;
        }
        
        localStorage.setItem('inventory', JSON.stringify(inventory));
        return { success: true, product };
    },

    // Purchase Orders
    createPO: async (poData) => {
        if (!canAccess('create_po')) throw new Error('Unauthorized');
        
        const pos = JSON.parse(localStorage.getItem('purchaseOrders')) || [];
        const newPO = {
            id: Date.now(),
            ...poData,
            status: 'draft',
            createdAt: new Date().toISOString()
        };
        
        pos.push(newPO);
        localStorage.setItem('purchaseOrders', JSON.stringify(pos));
        return { success: true, po: newPO };
    },

    // Sales
    recordSale: async (saleData) => {
        if (!canAccess('record_sale')) throw new Error('Unauthorized');
        
        const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
        const product = inventory.find(p => p.id === saleData.productId);
        
        if (!product) throw new Error('Product not found');
        if (product.stock < saleData.quantity) throw new Error('Insufficient stock');
        
        product.stock -= saleData.quantity;
        
        const sales = JSON.parse(localStorage.getItem('sales')) || [];
        const newSale = {
            id: Date.now(),
            ...saleData,
            timestamp: new Date().toISOString()
        };
        
        sales.push(newSale);
        localStorage.setItem('inventory', JSON.stringify(inventory));
        localStorage.setItem('sales', JSON.stringify(sales));
        
        return { success: true, sale: newSale };
    }
};

export { api, canAccess, verifyToken };