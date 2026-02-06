const toggleBtn = document.getElementById('toggle');

if (savedTheme === 'dark') {
  body.classList.add('dark');
  toggleBtn.checked = true;
}

toggleBtn.addEventListener('change', () => {
  if (toggleBtn.checked) {
    body.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    body.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
});