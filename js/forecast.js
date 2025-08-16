const tableBody = document.getElementById('forecast-table');
tableBody.innerHTML = inventory.map(item => `<tr><td class="p-2 border">${item.product}</td><td class="p-2 border">${item.forecast}</td></tr>`).join('');

let chart = null;
const ctx = document.getElementById('forecast-chart').getContext('2d');
chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: inventory.map(i => i.product),
        datasets: [{
            label: 'Forecast',
            data: inventory.map(i => i.forecast),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    },
    options: { scales: { y: { beginAtZero: true } }, animation: { duration: 1000, easing: 'easeOutBounce' } }
});