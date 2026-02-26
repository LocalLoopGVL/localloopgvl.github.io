const output = document.getElementById('output');

const openModalBtn = document.getElementById('openModal');
const closeModalBtn = document.getElementById('closeModal');
const modalOverlay = document.getElementById('modalOverlay');
const eventForm = document.getElementById('eventForm');

const accessModal = document.getElementById('accessModal');
const closeAccessBtn = document.getElementById('closeAccess');
const description = document.getElementById('description');

const sendBtn = document.getElementById('send');
const errors = document.getElementById('errors');

const viewModalOverlay = document.getElementById('viewModalOverlay');
const closeViewModal = document.getElementById('closeViewModal');

const viewName = document.getElementById('viewName');
const viewDate = document.getElementById('viewDate');
const viewLocation = document.getElementById('viewLocation');
const viewDescription = document.getElementById('viewDescription');
const viewCompany = document.getElementById('viewCompany');

/* ---------------- WEBSOCKET ---------------- */
const socket = new WebSocket('wss://carly-vaned-christiana.ngrok-free.dev');

/* ---------------- UI ---------------- */
openModalBtn.addEventListener('click', () => {
  const loginId = localStorage.getItem('loginId');
  const userId = localStorage.getItem('userId');

  if (!loginId || !userId) {
    accessModal.classList.remove('hidden');
    return;
  }

  modalOverlay.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
  modalOverlay.classList.add('hidden');
});

closeAccessBtn.addEventListener('click', () => {
  accessModal.classList.add('hidden');
});

description.addEventListener('input', () => {
  description.style.height = 'auto';
  description.style.height = description.scrollHeight + 'px';
});

/* ---------------- SESSION VALIDATION ---------------- */
socket.addEventListener('open', () => {
  const loginId = localStorage.getItem('loginId');

  if (loginId) {
    socket.send(JSON.stringify({
      type: 'validate_session',
      loginId
    }));
  }
});

/* ---------------- MESSAGE HANDLER ---------------- */
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);

  if (message.type === 'session_invalid') {
    localStorage.removeItem('loginId');
    accessModal.classList.remove('hidden');
  }

  if (message.type === 'success') {
    modalOverlay.classList.add('hidden');
    sendBtn.disabled = false;
    sendBtn.innerText = "Send";

    document.querySelectorAll('#modalOverlay input').forEach(el => el.value = '');
    document.getElementById('description').value = '';
  }

  if (message.type === 'init') {
    message.events
      .sort((a, b) => Number(b.time) - Number(a.time))
      .forEach(createEventBox);
  }

  if (message.type === 'new') {
    createEventBox(message.event);
  }

  if (message.type === 'error') {
    modalOverlay.classList.add('hidden');
    sendBtn.disabled = false;
    sendBtn.innerText = "Send";
    accessModal.classList.remove('hidden');
  }
});

/* ---------------- DATE FORMAT ---------------- */
function formatUnixDate(unix) {
  const date = new Date(unix * 1000);

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} • ${hours}:${minutes} ${ampm}`;
}

/* ---------------- EVENT BOX ---------------- */
function createEventBox(data) {
  const box = document.createElement('div');
  box.classList.add('event-box');

  const wrapper = document.createElement('div');
  box.dataset.id = data.id;
  box.dataset.event = JSON.stringify(data);

  const nameEl = document.createElement('div');
  nameEl.classList.add('event-name');
  nameEl.innerText = data.name;

  const dateEl = document.createElement('div');
  dateEl.classList.add('event-date');
  dateEl.innerText = formatUnixDate(Number(data.time));

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

  const interestEl = document.createElement('button');
  interestEl.classList.add('event-interest');
  interestEl.innerText = 'Remind Me';

  wrapper.append(nameEl, dateEl, locationEl, descEl, companyEl);
  wrapper.classList.add('wrapper');
  box.append(wrapper, dividerEl, interestEl);

  output.prepend(box);
}

/* ---------------- CREATE EVENT ---------------- */
eventForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const loginId = localStorage.getItem('loginId');
  const userId = localStorage.getItem('userId');
  const dateVal = document.getElementById('date').value;
  const timeVal = document.getElementById('time').value;

  const requiredFields = [
    'name','date','time','description',
    'company','street','city','state'
  ];

  let hasErrors = false;

  requiredFields.forEach(id => {
    const el = document.getElementById(id);
    if (!el || !el.value.trim()) {
      hasErrors = true;
      el?.classList.add('fielderror');
    }
  });

  if (hasErrors) return;

  if (!loginId || !userId) {
    accessModal.classList.remove('hidden');
    return;
  }

  const unixTime = Math.floor(
    new Date(`${dateVal}T${timeVal}`).getTime() / 1000
  );

  const data = {
    type: 'create_event',
    loginId,
    userId,
    name: document.getElementById('name').value,
    time: unixTime,
    description: document.getElementById('description').value,
    company: document.getElementById('company').value,
    street: document.getElementById('street').value,
    city: document.getElementById('city').value,
    state: document.getElementById('state').value
  };

  socket.send(JSON.stringify(data));

  sendBtn.disabled = true;
  sendBtn.innerText = "Posting...";
});

/* ---------------- CONNECTION FAIL ---------------- */
socket.onclose = (event) => {
  sendBtn.disabled = false;
  sendBtn.innerText = "Send";

  const hasContent = output.children.length > 0;

  if (!hasContent) {
    output.classList.add('hidden');

    const box = document.createElement('div');
    box.classList.add('error-box');

    const titleEl = document.createElement('div');
    titleEl.classList.add('error');
    titleEl.innerText = "Uh oh!";

    const infoEl = document.createElement('div');
    infoEl.classList.add('error-info');
    infoEl.innerText =
      "Something went wrong with the WebSocket connection. Try reloading the page.";

    const codeEl = document.createElement('div');
    codeEl.classList.add('error-msg');
    codeEl.innerText = "Code: " + event.code;

    const btnEl = document.createElement('button');
    btnEl.classList.add('error-btn');
    btnEl.onclick = () => location.reload();
    btnEl.innerText = "Refresh Page";

    box.append(titleEl, infoEl, codeEl, btnEl);
    errors.appendChild(box);
  }
};

/* ---------------- EXPAND EVENT ---------------- */
output.addEventListener('click', (e) => {
  const box = e.target.closest('.event-box');
  if (!box) return;
  if (e.target.closest('.event-interest')) return;

  const data = JSON.parse(box.dataset.event);

  viewName.innerText = data.name;
  viewDate.innerText = formatUnixDate(Number(data.time));
  viewLocation.innerText = `${data.street}, ${data.city}, ${data.state}`;
  viewDescription.innerText = data.description;
  viewCompany.innerText = "Hosted by: " + data.company;

  viewModalOverlay.classList.remove('hidden');
});

closeViewModal.addEventListener('click', () => {
  viewModalOverlay.classList.add('hidden');
});

const modalShades = document.querySelectorAll('.modal-overlay');

modalShades.forEach((shade) => {
  shade.addEventListener('click', (e) => {
    if (e.target === shade) {
      shade.classList.add('hidden');
    }
  });
});