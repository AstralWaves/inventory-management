if (document.getElementById('update-stock-form')) {
    document.getElementById('update-stock-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Stock updated');
    });
}

if (document.getElementById('issue-stock-form')) {
    document.getElementById('issue-stock-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Stock issued');
    });
}

if (document.getElementById('report-faulty-form')) {
    document.getElementById('report-faulty-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Faulty stock reported');
    });
}