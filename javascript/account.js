const logoutBtn = document.getElementById('logout');
const accountError = document.getElementById('accountError');
const accountForm = document.getElementById('accountForm');
const loggedInMsg = document.getElementById('loggedInMsg');
const loggedInText = document.getElementById('loggedInText');
const errors = document.getElementById('errors');
const startBox = document.getElementById('startBox');
const startLogin = document.getElementById('startLogin');
const startSignup = document.getElementById('startSignup');
const securityCodeInput = document.getElementById('securityCode');
const backToStart = document.getElementById('backToStart');
const submitBtn = document.getElementById('submitAccount');

let accountMode = null;

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
    startBox.classList.remove('hidden');
  }
});

/* ---------------- FORM SUBMIT (FIXED) ---------------- */
accountForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!accountMode) return;
  sendAccount();
});

/* ---------------- ACCOUNT FUNCTION ---------------- */
function sendAccount() {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const securityCode = securityCodeInput.value.trim();

  if (accountMode === 'verify') {
    if (!securityCode) {
      accountError.innerText = 'Enter verification code.';
      return;
    }

    socket.send(JSON.stringify({
      type: 'verify_signup',
      email,
      code: securityCode
    }));

    return;
  }

  if (!email || !password) {
    accountError.innerText = "Fill out all fields.";
    return;
  }

  socket.send(JSON.stringify({
    type: accountMode,
    email,
    password
  }));
}

/* ---------------- START OPTIONS ---------------- */
startLogin.addEventListener('click', () => {
  accountMode = 'login';
  startBox.classList.add('hidden');
  accountForm.classList.remove('hidden');
  securityCodeInput.classList.add('hidden');
  submitBtn.innerText = 'Continue';
});

startSignup.addEventListener('click', () => {
  accountMode = 'signup';
  startBox.classList.add('hidden');
  accountForm.classList.remove('hidden');
  securityCodeInput.classList.add('hidden');
  submitBtn.innerText = 'Continue';
});

/* ---------------- BACK BUTTON ---------------- */
backToStart.addEventListener('click', () => {
  accountMode = null;

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  emailInput.value = '';
  passwordInput.value = '';
  securityCodeInput.value = '';

  emailInput.disabled = false;
  passwordInput.disabled = false;

  securityCodeInput.classList.add('hidden');
  submitBtn.innerText = 'Continue';

  accountError.innerText = '';

  accountForm.classList.add('hidden');
  startBox.classList.remove('hidden');
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

  loggedInMsg.classList.add('hidden');
  startBox.classList.remove('hidden');
});

/* ---------------- WEBSOCKET MESSAGE HANDLER ---------------- */
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);

  if (message.type === 'session_valid') {
    accountForm.classList.add('hidden');
    startBox.classList.add('hidden');
    loggedInMsg.classList.remove('hidden');
    loggedInText.innerText = `You're logged in as ${message.email}`;
  }

  if (message.type === 'session_invalid') {
    localStorage.removeItem('loginId');
    accountForm.classList.add('hidden');
    loggedInMsg.classList.add('hidden');
    startBox.classList.remove('hidden');
  }

  if (message.type === 'account_success') {
    localStorage.setItem('loginId', message.loginId);
    localStorage.setItem('userId', message.userId);

    setTimeout(() => {
      location.reload();
    }, 800);
  }

  if (message.type === 'account_error') {
    accountError.innerText = message.message;
  }

  if (message.type === 'verification_required') {
    accountMode = 'verify';

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    emailInput.disabled = true;
    passwordInput.disabled = true;

    securityCodeInput.classList.remove('hidden');
    submitBtn.innerText = 'Verify';

    accountError.innerText = 'Enter the code sent to your email.';
  }
});

/* ---------------- CONNECTION FAIL ---------------- */
socket.onclose = (event) => {
  const box = document.createElement('div');
  box.classList.add('error-box');

  box.innerHTML = `
    <div class="error">Uh oh!</div>
    <div class="error-info">
      Something went wrong with the WebSocket connection.
      Try reloading the page.
    </div>
    <div class="error-msg">Code: ${event.code}</div>
    <button class="error-btn" onclick="location.reload()">Refresh Page</button>
  `;

  errors.appendChild(box);

  loggedInMsg.classList.add('hidden');
  accountForm.classList.add('hidden');
};