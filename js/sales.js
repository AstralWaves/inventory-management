if (document.getElementById('availability-table')) {
    const availabilityTable = document.getElementById('availability-table');
    availabilityTable.innerHTML = inventory.map(item => `
        <tr>
            <td class="p-2 border">${item.product}</td>
            <td class="p-2 border">${item.stock}</td>
        </tr>
    `).join('');
}

if (document.getElementById('record-sale-form')) {
    document.getElementById('record-sale-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Sale recorded');
    });
}