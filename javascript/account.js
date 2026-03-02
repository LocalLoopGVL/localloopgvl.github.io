const logoutBtn = document.getElementById('logout');
const loggedInMsg = document.getElementById('loggedInMsg');
const loggedInText = document.getElementById('loggedInText');
const errors = document.getElementById('errors');
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');
const goToSignup = document.getElementById('goToSignup');
const signupForm = document.getElementById('signupForm');
const signupEmail = document.getElementById('signupEmail');
const signupPassword = document.getElementById('signupPassword');
const signupSecurityCode = document.getElementById('signupSecurityCode');
const signupError = document.getElementById('signupError');
const backToLogin = document.getElementById('backToLogin');
const signupSubmit = document.getElementById('signupSubmit');
const loginSubmit = document.getElementById('loginSubmit');
const myEvents = document.getElementById('myEvents');
const output = document.getElementById('output');
const signUpText = document.getElementById('signUpText')


/* ---------------- ERROR HELPER ---------------- */
function setError(element, message) {
  element.innerText = message;
  if (message) {
    element.classList.remove('hidden');
  } else {
    element.classList.add('hidden');
  }
}

/* ---------------- WEBSOCKET ---------------- */
const socket = new WebSocket('wss://carly-vaned-christiana.ngrok-free.dev');

/* ---------------- SESSION VALIDATION ---------------- */
socket.addEventListener('open', () => {
  const sessionId = localStorage.getItem('sessionId');
  const userId = localStorage.getItem('userId'); // the account id
  if (sessionId && userId) {
    socket.send(JSON.stringify({ type: 'validate_session', sessionId, userId }));
  } else {
    loginForm.classList.remove('hidden');
  }
});

/* ---------------- LOGIN ---------------- */
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  if (!email || !password) {
    setError(loginError, 'Fill out all fields.');
    return;
  }

  setError(loginError, '');
  socket.send(JSON.stringify({ type: 'login', email, password }));
});

goToSignup.addEventListener('click', () => {
  const signUpMode = localStorage.getItem('signUpMode');
  const signUpState = localStorage.getItem('signUpEmail');

  loginForm.classList.add('hidden');
  signupForm.classList.remove('hidden');
  
  signupEmail.classList.remove('hidden');
  signupPassword.classList.remove('hidden');
  signupSecurityCode.classList.add('hidden');
  signupSubmit.innerText = 'Continue';

  signupEmail.value = '';
  signupPassword.value = '';
  signupSecurityCode.value = '';

  setError(signupError, '');
  setError(loginError, '');

  if (signUpMode === 'verify' && signUpState) {
    signupEmail.classList.add('hidden');
    signupPassword.classList.add('hidden');
    signupSecurityCode.classList.remove('hidden');
    signupSubmit.innerText = 'Verify';
    signUpText.innerText = `Verify for the email ${signUpState}`;
  } else {
    signUpText.innerText = "Let's get you started";
  }
});

/* ---------------- SIGNUP ---------------- */
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = signupEmail.value.trim();
  const password = signupPassword.value.trim();
  const code = signupSecurityCode.value.trim();

  const signUpState = localStorage.getItem('signUpEmail');
  const signUpMode = localStorage.getItem('signUpMode');

  if (signUpMode === 'verify') {
    if (!code) {
      setError(signupError, 'Enter verification code.');
      return;
    }

    setError(signupError, '');
    socket.send(JSON.stringify({ 
      type: 'verify_signup', 
      email: signUpState,
      code 
    }));
    return;
  }

  if (!email || !password) {
    setError(signupError, 'Fill out all fields.');
    return;
  }

  setError(signupError, '');
  localStorage.setItem('signUpEmail', email);
  socket.send(JSON.stringify({ type: 'signup', email, password }));
});

backToLogin.addEventListener('click', () => {
  signupForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
  signupEmail.value = '';
  signupPassword.value = '';
  signupSecurityCode.value = '';
  setError(signupError, '');
  setError(loginError, '');
});

/* ---------------- LOGOUT ---------------- */
logoutBtn.addEventListener('click', () => {
  const sessionId = localStorage.getItem('sessionId');
  if (!sessionId) return;

  socket.send(JSON.stringify({ type: 'logout', sessionId }));
  localStorage.removeItem('sessionId');
  localStorage.removeItem('userId');

  loggedInMsg.classList.add('hidden');
  logoutBtn.classList.add('hidden');
  myEvents.classList.add('hidden');
  loginForm.classList.remove('hidden');
});

/* ---------------- WEBSOCKET MESSAGE HANDLER ---------------- */
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);

  if (message.type === 'session_valid') {
    loginForm.classList.add('hidden');
    signupForm.classList.add('hidden');
    loggedInMsg.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    loggedInText.innerText = `${message.email}`;
    if (message.events && message.events.length !== 0) {
      myEvents.classList.remove('hidden');
      message.events
      .sort((a, b) => Number(b.time) - Number(a.time))
      .forEach(createEventBox);
    }
  }

  if (message.type === 'session_invalid') {
    localStorage.removeItem('sessionId');
    loggedInMsg.classList.add('hidden');
    logoutBtn.classList.add('hidden');
    myEvents.classList.add('hidden');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
  }

  if (message.type === 'account_error') {
    localStorage.removeItem('userId');
    localStorage.removeItem('sessionId');
    loggedInMsg.classList.add('hidden');
    logoutBtn.classList.add('hidden');
    myEvents.classList.add('hidden');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
  }

  if (message.type === 'account_success') {
    localStorage.setItem('sessionId', message.sessionId);
    localStorage.setItem('userId', message.userId);
    localStorage.removeItem('signUpMode');
    localStorage.removeItem('signUpEmail');

    setTimeout(() => location.reload(), 800);
  }

  if (message.type === 'account_error') {
    if (signupForm.classList.contains('hidden')) {
      setError(loginError, message.message);
    } else {
      setError(signupError, message.message);
    }
  }

  if (message.type === 'verification_required') {
    const signUpState = localStorage.getItem('signUpEmail');
    localStorage.setItem('signUpMode', 'verify');
  
    signupEmail.classList.add('hidden');
    signupPassword.classList.add('hidden');
    signupSecurityCode.classList.remove('hidden');
    signupSubmit.innerText = 'Verify';
    signUpText.innerText = `Verify for the email ${signUpState}`;
  
    setError(signupError, 'Enter the code sent to your email.');
  }
});

/* ---------------- ACCOUNT EVENTS ---------------- */
function createEventBox(data) {
  const box = document.createElement('div');
  box.classList.add('event-box');

  const wrapper = document.createElement('div');
  box.dataset.id = data.id;
  box.dataset.event = JSON.stringify(data);

  const nameEl = document.createElement('div');
  nameEl.classList.add('event-name');
  nameEl.innerText = data.name;

  const locationEl = document.createElement('div');
  locationEl.classList.add('event-location');
  locationEl.innerText = `${data.street}, ${data.city}, ${data.state}`;

  const descEl = document.createElement('div');
  descEl.classList.add('event-desc');
  descEl.innerText = data.description;

  const companyEl = document.createElement('div');
  companyEl.classList.add('event-company');
  companyEl.innerText = 'Hosted by: ' + data.company;

  const dividerEl = document.createElement('div');
  dividerEl.classList.add('divider');

  const editEl = document.createElement('button');
  editEl.classList.add('event-edit');
  editEl.innerText = 'Edit Event';

  wrapper.append(nameEl, locationEl, descEl, companyEl);
  wrapper.classList.add('wrapper');
  box.append(wrapper, dividerEl, editEl);

  output.append(box);
}

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
  logoutBtn.classList.add('hidden');
  myEvents.classList.add('hidden');
  loginForm.classList.add('hidden');
  signupForm.classList.add('hidden');
};