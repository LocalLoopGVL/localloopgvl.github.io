const signupBtn = document.getElementById('signup');
const loginBtn = document.getElementById('login');
const logoutBtn = document.getElementById('logout');
const accountError = document.getElementById('accountError');
const accountForm = document.getElementById('accountForm');
const loggedInMsg = document.getElementById('loggedInMsg');
const loggedInText = document.getElementById('loggedInText');
const errors = document.getElementById('errors');

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

/* ---------------- FORM SUBMIT HANDLER ---------------- */
accountForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (document.activeElement === signupBtn) sendAccount('signup');
  else if (document.activeElement === loginBtn) sendAccount('login');
});

/* ---------------- LOGOUT ---------------- */
logoutBtn.addEventListener('click', () => {
  const loginId = localStorage.getItem('loginId');
  if (!loginId) return;

  socket.send(JSON.stringify({
    type: 'logout',
    loginId
  }));

  localStorage.removeItem('loginId');
  localStorage.removeItem('userId');

  accountForm.classList.remove('hidden');
  loggedInMsg.classList.add('hidden');
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

/* ---------------- CONNECTION FAIL ---------------- */
socket.onclose = (event) => {
  const box = document.createElement('div');
  box.classList.add('error-box');

  const titleEl = document.createElement('div');
  titleEl.classList.add('error');
  titleEl.innerText = "Uh oh!";

  const infoEl = document.createElement('div');
  infoEl.classList.add('error-info');
  infoEl.innerText = "Something went wrong with the WebSocket connection. Try reloading the page. If the problem persists, we may be down for maintenance.";

  const codeEl = document.createElement('div');
  codeEl.classList.add('error-msg');
  codeEl.innerText = "Code: " + event.code;

  const btnEl = document.createElement('button');
  btnEl.classList.add('error-btn');
  btnEl.onclick = refreshPage;
  btnEl.innerText = "Refresh Page";

  box.appendChild(titleEl);
  box.appendChild(infoEl);
  box.appendChild(codeEl);
  box.appendChild(btnEl);
  errors.appendChild(box);

  loggedInMsg.classList.add('hidden');
  accountForm.classList.add('hidden');
};

function refreshPage() {
  location.reload();
}
