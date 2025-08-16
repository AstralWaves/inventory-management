if (document.getElementById('po-table')) {
    const poTable = document.getElementById('po-table');
    poTable.innerHTML = purchaseOrders.map(po => `
        <tr>
            <td class="p-2 border">${po.id}</td>
            <td class="p-2 border">${po.supplier}</td>
            <td class="p-2 border">${po.products}</td>
            <td class="p-2 border">
                <button class="bg-green-500 text-white px-2 py-1 rounded mr-2 hover:bg-green-600 transition-all" onclick="approvePO(${po.id})">Approve</button>
                <button class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-all" onclick="rejectPO(${po.id})">Reject</button>
            </td>
        </tr>
    `).join('');
}

if (document.getElementById('create-po-form')) {
    document.getElementById('create-po-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('PO created and submitted');
    });
}

if (document.getElementById('order-table')) {
    const orderTable = document.getElementById('order-table');
    orderTable.innerHTML = purchaseOrders.map(po => `
        <tr>
            <td class="p-2 border">${po.id}</td>
            <td class="p-2 border">${po.status}</td>
            <td class="p-2 border">
                <button class="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-all" onclick="updateStatus(${po.id})">Update</button>
            </td>
        </tr>
    `).join('');
}

window.approvePO = (id) => { alert(`PO ${id} approved`); };
window.rejectPO = (id) => { alert(`PO ${id} rejected`); };
window.updateStatus = (id) => { alert(`Status updated for ${id}`); };