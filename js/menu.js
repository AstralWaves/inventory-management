const menus = {
    manager: [
        { name: 'Dashboard', id: 'dashboard.html' },
        { name: 'Forecast Report', id: 'forecast-report.html' },
        { name: 'Review Purchase Orders', id: 'review-po.html' }
    ],
    purchaser: [
        { name: 'Dashboard', id: 'dashboard.html' },
        { name: 'Forecast Data', id: 'forecast-data.html' },
        { name: 'Create Purchase Orders', id: 'create-po.html' },
        { name: 'Track Order Status', id: 'track-order.html' }
    ],
    salesperson: [
        { name: 'Dashboard', id: 'dashboard.html' },
        { name: 'Check Availability', id: 'check-availability.html' },
        { name: 'Record Sale', id: 'record-sale.html' },
        { name: 'Submit Feedback', id: 'submit-feedback.html' }
    ],
    warehouse: [
        { name: 'Dashboard', id: 'dashboard.html' },
        { name: 'Update Stock', id: 'update-stock.html' },
        { name: 'Issue Stock', id: 'issue-stock.html' },
        { name: 'Report Faulty Stock', id: 'report-faulty.html' }
    ]
};

const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) window.location.href = 'login.html';

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
});

const menuList = document.getElementById('menu-list');
menuList.innerHTML = '';
menus[currentUser.role].forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${item.id}" class="block text-left px-4 py-2 hover:bg-indigo-100 transition-all rounded">${item.name}</a>`;
    menuList.appendChild(li);
});