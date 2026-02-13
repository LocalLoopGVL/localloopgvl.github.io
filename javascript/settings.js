const toggleTheme = document.getElementById('toggleTheme');
const toggleMotion = document.getElementById('toggleMotion');

/* ---------------- INITIAL STATE ---------------- */
if (savedTheme === 'dark') {
  body.classList.add('dark');
  toggleTheme.checked = true;
}

if (savedMotion === 'reduced') {
  body.classList.add('reduced');
  toggleMotion.checked = true;
}

/* ---------------- EVENT LISTENERS ---------------- */
toggleTheme.addEventListener('change', () => {
  if (toggleTheme.checked) {
    body.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    body.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
});

toggleMotion.addEventListener('change', () => {
  if (toggleMotion.checked) {
    body.classList.add('reduced');
    localStorage.setItem('motion', 'reduced');
  } else {
    body.classList.remove('reduced');
    localStorage.setItem('motion', 'normal');
  }
});