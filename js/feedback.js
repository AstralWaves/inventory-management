if (document.getElementById('feedback-form')) {
    document.getElementById('feedback-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Feedback submitted');
    });
}