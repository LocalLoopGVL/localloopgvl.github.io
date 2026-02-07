const output = document.getElementById('output');

const openModalBtn = document.getElementById('openModal');
const closeModalBtn = document.getElementById('closeModal');
const modalOverlay = document.getElementById('modalOverlay');
const accessModal = document.getElementById('accessModal');
const closeAccessBtn = document.getElementById('closeAccess');
const sendBtn = document.getElementById('send');

const socket = new WebSocket('https://carly-vaned-christiana.ngrok-free.dev');

openModalBtn.addEventListener('click', () => {
  modalOverlay.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
  modalOverlay.classList.add('hidden');
});

closeAccessBtn.addEventListener('click', () => {
  accessModal.classList.add('hidden');
});

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);

  if (message.type === 'init') {
    message.events.forEach(createEventBox);
  }

  if (message.type === 'new') {
    createEventBox(message.event);
  }

  if (message.type === 'error') {
    accessModal.classList.remove('hidden');
  }
});

function formatUnixDate(unix) {
  const date = new Date(unix * 1000); // seconds → ms

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${month}/${day}/${year} @ ${hours}:${minutes}`;
}

function createEventBox(data) {
  const box = document.createElement('div');
  const wrapper = document.createElement('div');
  box.classList.add('event-box');

  const nameEl = document.createElement('div');
  nameEl.classList.add('event-name');
  nameEl.innerText = data.name;

  const dateEl = document.createElement('div');
  dateEl.classList.add('event-date');
  dateEl.innerText = formatUnixDate(Number(data.time));

  const descEl = document.createElement('div');
  descEl.classList.add('event-desc');
  descEl.innerText = data.description;

  const companyEl = document.createElement('div');
  companyEl.classList.add('event-company');
  companyEl.innerText = 'Posted by: ' + data.company;

  const interestEl = document.createElement('button');
  interestEl.classList.add('event-interest');
  interestEl.innerText = 'Get notified!';

  // append all elements to the box
  wrapper.appendChild(nameEl);
  wrapper.appendChild(dateEl);
  wrapper.appendChild(descEl);
  wrapper.appendChild(companyEl);
  box.appendChild(wrapper);

  box.appendChild(interestEl);

  output.appendChild(box);
};

sendBtn.addEventListener('click', () => {
  const unixTime = document.getElementById('time').value;

  if (!unixTime || isNaN(unixTime)) {
    alert('Please enter a valid Unix timestamp.');
    return;
  }

  const data = {
    name: document.getElementById('name').value,
    time: Number(unixTime),
    description: document.getElementById('description').value,
    company: document.getElementById('company').value,
    access: document.getElementById('access').value
  };

  socket.send(JSON.stringify(data));
  modalOverlay.classList.add('hidden');
});

socket.onerror = (error) => {
  const box = document.createElement('div');
  box.classList.add('error-box');

  const errorEl = document.createElement('div');
  errorEl.classList.add('error');
  errorEl.innerText = "Uh oh!";

  const errorinfoEl = document.createElement('div');
  errorinfoEl.classList.add('error-info');
  errorinfoEl.innerText = "Something went wrong with the WebSocket connection. Try reloading the page. If the problem persists, we may be down for maintenance.";

  const errormsgEl = document.createElement('div');
  errormsgEl.classList.add('error-msg');
  errormsgEl.innerText = "Error details: " + error.message;

  const errorbtnEl = document.createElement('button');
  errorbtnEl.classList.add('error-btn');
  errorbtnEl.onclick = refreshPage;
  errorbtnEl.innerText = "Refresh Page";

  box.appendChild(errorEl);
  box.appendChild(errorinfoEl);
  box.appendChild(errormsgEl);
  box.appendChild(errorbtnEl);
  output.appendChild(box);
};

// Device overlay for mobile users
function refreshPage() {
  location.reload();
};