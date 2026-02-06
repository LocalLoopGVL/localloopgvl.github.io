const layout = document.getElementById('layout')
const back = document.getElementById('back')
const ui = document.getElementById('ui')
const sidebar = document.getElementById('side')
const active = document.getElementById('active')
const savedTheme = localStorage.getItem('theme');
const body = document.body

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    layout.classList.add('open');
    ui.classList.add('open');
    sidebar.classList.add('nav-fx');
  }, 0);
});

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

if (savedTheme === 'dark') {
  body.classList.add('dark');
};