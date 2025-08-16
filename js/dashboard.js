import { api } from './api.js';
import i18n from './i18n.js';

class DashboardUI {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return;
        }

        this.initializeDashboard();
    }

    async initializeDashboard() {
        try {
            const [inventory, purchaseOrders, sales] = await Promise.all([
                api.getInventory(),
                api.getPurchaseOrders(),
                api.getSales()
            ]);

            this.renderDashboardCards(inventory, purchaseOrders, sales);
            this.renderStockChart(inventory);
            this.renderDemandForecast(sales);
            this.renderAlertsFeed(inventory, purchaseOrders);
            this.renderRecentUpdates(purchaseOrders, sales);
            this.setupFilters();
        } catch (error) {
            this.showError(error.message);
        }
    }

    renderDashboardCards(inventory, purchaseOrders, sales) {
        const cards = {
            totalSKUs: inventory.length,
            inStockUnits: inventory.reduce((sum, item) => sum + item.stock, 0),
            lowStockAlerts: inventory.filter(item => item.stock <= item.minStock).length,
            openPOs: purchaseOrders.filter(po => po.status === 'pending').length,
            upcomingDeliveries: purchaseOrders.filter(po => po.status === 'shipped').length
        };

        Object.entries(cards).forEach(([id, value]) => {
            const card = document.getElementById(id);
            if (card) {
                card.querySelector('.value').textContent = value;
                card.querySelector('.label').textContent = i18n.t(`dashboard.${id}`);
            }
        });
    }

    renderStockChart(inventory) {
        const ctx = document.getElementById('stockChart').getContext('2d');
        const sortedInventory = [...inventory].sort((a, b) => b.stock - a.stock).slice(0, 10);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedInventory.map(item => item.name),
                datasets: [{
                    label: i18n.t('dashboard.currentStock'),
                    data: sortedInventory.map(item => item.stock),
                    backgroundColor: '#3b82f6',
                    borderColor: '#2563eb',
                    borderWidth: 1
                }, {
                    label: i18n.t('dashboard.minStock'),
                    data: sortedInventory.map(item => item.minStock),
                    backgroundColor: '#ef4444',
                    borderColor: '#dc2626',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: i18n.t('dashboard.units')
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: i18n.t('dashboard.stockLevels')
                    }
                }
            }
        });
    }

    renderDemandForecast(sales) {
        const ctx = document.getElementById('forecastChart').getContext('2d');
        const monthlyData = this.aggregateMonthlyData(sales);
        const forecast = this.calculateForecast(monthlyData);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: [...monthlyData.labels, ...forecast.labels],
                datasets: [{
                    label: i18n.t('dashboard.actualSales'),
                    data: monthlyData.values.concat(Array(3).fill(null)),
                    borderColor: '#3b82f6',
                    fill: false
                }, {
                    label: i18n.t('dashboard.forecast'),
                    data: Array(monthlyData.values.length).fill(null).concat(forecast.values),
                    borderColor: '#10b981',
                    borderDash: [5, 5],
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: i18n.t('dashboard.demandForecast')
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: i18n.t('dashboard.units')
                        }
                    }
                }
            }
        });
    }

    aggregateMonthlyData(sales) {
        const monthlyMap = sales.reduce((acc, sale) => {
            const date = new Date(sale.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            acc[key] = (acc[key] || 0) + sale.quantity;
            return acc;
        }, {});

        const sortedMonths = Object.keys(monthlyMap).sort();
        return {
            labels: sortedMonths,
            values: sortedMonths.map(month => monthlyMap[month])
        };
    }

    calculateForecast(monthlyData) {
        const values = monthlyData.values;
        const n = values.length;
        if (n < 2) return { labels: [], values: [] };

        // Simple moving average forecast
        const period = 3;
        const lastValue = values[n - 1];
        const avgChange = values.slice(-period).reduce((sum, val, i, arr) => {
            return i > 0 ? sum + (val - arr[i - 1]) : sum;
        }, 0) / (period - 1);

        const forecastValues = Array(3).fill(0).map((_, i) => {
            return Math.max(0, Math.round(lastValue + avgChange * (i + 1)));
        });

        const lastDate = new Date(monthlyData.labels[n - 1]);
        const forecastLabels = Array(3).fill(0).map((_, i) => {
            const date = new Date(lastDate);
            date.setMonth(date.getMonth() + i + 1);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        });

        return {
            labels: forecastLabels,
            values: forecastValues
        };
    }

    renderAlertsFeed(inventory, purchaseOrders) {
        const alertsContainer = document.getElementById('alertsFeed');
        const lowStockItems = inventory
            .filter(item => item.stock <= item.minStock)
            .map(item => ({
                type: 'low_stock',
                item: item.name,
                current: item.stock,
                min: item.minStock
            }));

        const upcomingDeliveries = purchaseOrders
            .filter(po => po.status === 'shipped')
            .map(po => ({
                type: 'upcoming_delivery',
                id: po.id,
                supplier: po.supplier,
                date: po.expectedDelivery
            }));

        const alerts = [...lowStockItems, ...upcomingDeliveries]
            .sort((a, b) => b.date - a.date)
            .slice(0, 5);

        alertsContainer.innerHTML = alerts.length ? alerts.map(alert => this.createAlertHTML(alert)).join('') :
            `<div class="empty-state">${i18n.t('dashboard.noAlerts')}</div>`;
    }

    createAlertHTML(alert) {
        const icons = {
            low_stock: '⚠️',
            upcoming_delivery: '📦'
        };

        if (alert.type === 'low_stock') {
            return `
                <div class="alert alert-warning">
                    <span class="icon">${icons[alert.type]}</span>
                    <div class="content">
                        <h4>${i18n.t('dashboard.lowStockAlert')}</h4>
                        <p>${i18n.t('dashboard.lowStockMessage', { item: alert.item, current: alert.current, min: alert.min })}</p>
                    </div>
                </div>`;
        } else {
            return `
                <div class="alert alert-info">
                    <span class="icon">${icons[alert.type]}</span>
                    <div class="content">
                        <h4>${i18n.t('dashboard.upcomingDelivery')}</h4>
                        <p>${i18n.t('dashboard.deliveryMessage', { id: alert.id, supplier: alert.supplier, date: new Date(alert.date).toLocaleDateString() })}</p>
                    </div>
                </div>`;
        }
    }

    renderRecentUpdates(purchaseOrders, sales) {
        const updatesContainer = document.getElementById('recentUpdates');
        const recentPOs = purchaseOrders
            .slice(-3)
            .map(po => ({
                type: 'po',
                date: new Date(po.date),
                id: po.id,
                supplier: po.supplier,
                status: po.status
            }));

        const recentSales = sales
            .slice(-3)
            .map(sale => ({
                type: 'sale',
                date: new Date(sale.date),
                product: sale.product,
                quantity: sale.quantity
            }));

        const updates = [...recentPOs, ...recentSales]
            .sort((a, b) => b.date - a.date)
            .slice(0, 5);

        updatesContainer.innerHTML = updates.length ? updates.map(update => this.createUpdateHTML(update)).join('') :
            `<div class="empty-state">${i18n.t('dashboard.noUpdates')}</div>`;
    }

    createUpdateHTML(update) {
        const icons = {
            po: '📋',
            sale: '💰'
        };

        if (update.type === 'po') {
            return `
                <div class="update">
                    <span class="icon">${icons[update.type]}</span>
                    <div class="content">
                        <p>${i18n.t('dashboard.poUpdate', { id: update.id, supplier: update.supplier, status: update.status })}</p>
                        <small>${update.date.toLocaleDateString()}</small>
                    </div>
                </div>`;
        } else {
            return `
                <div class="update">
                    <span class="icon">${icons[update.type]}</span>
                    <div class="content">
                        <p>${i18n.t('dashboard.saleUpdate', { product: update.product, quantity: update.quantity })}</p>
                        <small>${update.date.toLocaleDateString()}</small>
                    </div>
                </div>`;
        }
    }

    setupFilters() {
        const filterForm = document.getElementById('dashboardFilters');
        if (!filterForm) return;

        filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const filters = {
                dateRange: document.getElementById('dateRange').value,
                category: document.getElementById('category').value,
                supplier: document.getElementById('supplier').value,
                location: document.getElementById('location').value
            };

            this.applyFilters(filters);
        });
    }

    applyFilters(filters) {
        // Re-fetch and update dashboard with filters
        this.initializeDashboard(filters);
    }

    showError(message) {
        const errorContainer = document.getElementById('errorContainer');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.classList.remove('hidden');
            setTimeout(() => errorContainer.classList.add('hidden'), 5000);
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardUI();
});