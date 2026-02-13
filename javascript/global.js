const layout = document.getElementById('layout');
const back = document.getElementById('back');
const ui = document.getElementById('ui');
const sidebar = document.getElementById('side');
const active = document.getElementById('active');
const body = document.body;

/* ---------------- SAVED SETTINGS ---------------- */
const savedTheme = localStorage.getItem('theme');
const savedMotion = localStorage.getItem('motion');

/* ---------------- INITIAL ANIMATION ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    layout.classList.add('open');
    ui.classList.add('open');
    sidebar.classList.add('nav-fx');
  }, 0);
});

/* ---------------- NAVIGATION ---------------- */
back.addEventListener('click', () => {
  layout.classList.remove('open');
  ui.classList.remove('open');
  sidebar.classList.remove('nav-fx');
});

active.addEventListener('click', () => {
  layout.classList.add('open');
  ui.classList.add('open');
  sidebar.classList.add('nav-fx');
});

/* ---------------- THEME HANDLING ---------------- */
if (savedTheme === 'dark') {
  body.classList.add('dark');
} else if (savedTheme === 'light') {
  body.classList.add('light');
} else {
  // Use system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    body.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    body.classList.add('light');
    localStorage.setItem('theme', 'light');
  }
}

/* ---------------- MOTION HANDLING ---------------- */
if (savedMotion === 'reduced') {
  body.classList.add('reduced');
  if (typeof toggleMotion !== 'undefined') toggleMotion.checked = true;
}
