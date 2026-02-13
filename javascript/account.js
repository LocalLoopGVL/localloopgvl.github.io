const signupBtn = document.getElementById('signup');
const loginBtn = document.getElementById('login');
const logoutBtn = document.getElementById('logout');
const accountError = document.getElementById('accountError');
const accountForm = document.getElementById('accountForm');
const loggedInMsg = document.getElementById('loggedInMsg');
const loggedInText = document.getElementById('loggedInText');

/* ---------------- WEBSOCKET ---------------- */
const socket = new WebSocket('wss://carly-vaned-christiana.ngrok-free.dev');

/* ---------------- SESSION VALIDATION ---------------- */
socket.addEventListener('open', () => {
  const loginId = localStorage.getItem('loginId');

  if (loginId) {
    socket.send(JSON.stringify({
      type: 'validate_session',
      loginId
    }));
  } else {
    accountForm.classList.remove('hidden');
  }
});

/* ---------------- ACCOUNT FUNCTIONS ---------------- */
function sendAccount(type) {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    accountError.innerText = "Fill out all fields.";
    return;
  }

  const data = { type, email, password };
  socket.send(JSON.stringify(data));
}

/* ---------------- EVENT LISTENERS ---------------- */
signupBtn.addEventListener('click', () => sendAccount('signup'));
loginBtn.addEventListener('click', () => sendAccount('login'));

logoutBtn.addEventListener('click', () => {
  const loginId = localStorage.getItem('loginId');
  if (!loginId) return;

  socket.send(JSON.stringify({
    type: 'logout',
    loginId
  }));

  localStorage.removeItem('loginId');
  localStorage.removeItem('userId');

  document.getElementById('accountForm').classList.remove('hidden');
  document.getElementById('loggedInMsg').classList.add('hidden');
});

/* ---------------- WEBSOCKET MESSAGE HANDLER ---------------- */
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);

  /* ---------- SESSION VALID ---------- */
  if (message.type === 'session_valid') {

    accountForm.classList.add('hidden');
    loggedInMsg.classList.remove('hidden');
    loggedInText.innerText = `You're logged in as ${message.email}`;
  }

  /* ---------- SESSION INVALID ---------- */
  if (message.type === 'session_invalid') {
    localStorage.removeItem('loginId');

    accountForm.classList.remove('hidden');
    loggedInMsg.classList.add('hidden');
  }

  /* ---------- ACCOUNT SUCCESS ---------- */
  if (message.type === 'account_success') {
    localStorage.setItem('loginId', message.loginId);
    localStorage.setItem('userId', message.userId);

    accountForm.classList.add('hidden');
    loggedInMsg.classList.remove('hidden');
    loggedInText.innerText = "You're logged in!";
  }

  /* ---------- ACCOUNT ERROR ---------- */
  if (message.type === 'account_error') {
    accountError.innerText = message.message;
  }
});
