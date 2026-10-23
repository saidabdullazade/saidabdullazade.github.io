const DEMO_USER = 'doctor';
const DEMO_PASSWORD = '1111';

document.querySelector('#login-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.querySelector('#username').value.trim();
  const password = document.querySelector('#password').value;
  const error = document.querySelector('#login-error');

  if (username === DEMO_USER && password === DEMO_PASSWORD) {
    sessionStorage.setItem('mediqAdmin', username);
    window.location.href = 'dashboard.html';
  } else {
    error.textContent = 'İstifadəçi adı və ya parol yanlışdır. Demo: doctor / 1111';
  }
});
