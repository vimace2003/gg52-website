// Newsletter form handler with client-side validation
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('newsletter');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.querySelector('input[type="email"]').value.trim();
    const button = form.querySelector('button');
    const originalText = button.textContent;

    // Client-side validation
    if (!email || !email.includes('@')) {
      showMessage('Email inválido', 'error');
      return;
    }

    // Disable button and show loading state
    button.disabled = true;
    button.textContent = 'Inscrevendo...';

    try {
      const response = await fetch('./newsletter.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: `email=${encodeURIComponent(email)}`
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showMessage(data.message, 'success');
        form.reset();
      } else {
        showMessage(data.message || data.error || 'Erro desconhecido', 'error');
      }
    } catch (error) {
      console.error('Newsletter error:', error);
      showMessage('Erro de conexão. Tente novamente.', 'error');
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  });

  function showMessage(message, type) {
    // Remove previous message if exists
    const oldMsg = form.querySelector('.newsletter-message');
    if (oldMsg) oldMsg.remove();

    const msg = document.createElement('div');
    msg.className = `newsletter-message newsletter-${type}`;
    msg.textContent = message;
    msg.setAttribute('role', 'alert');
    form.parentNode.insertBefore(msg, form.nextSibling);

    // Auto-remove after 5 seconds
    setTimeout(() => msg.remove(), 5000);
  }
});
