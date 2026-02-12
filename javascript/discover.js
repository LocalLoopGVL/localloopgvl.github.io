const output = document.getElementById('output');

const openModalBtn = document.getElementById('openModal');
const closeModalBtn = document.getElementById('closeModal');
const modalOverlay = document.getElementById('modalOverlay');
const accessModal = document.getElementById('accessModal');
const closeAccessBtn = document.getElementById('closeAccess');
const sendBtn = document.getElementById('send');
const errors = document.getElementById('errors');

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

  if (message.type === 'success') {
    modalOverlay.classList.add('hidden');
    sendBtn.disabled = false;
    sendBtn.innerText = "Send";
    document.querySelectorAll('#modalOverlay input').forEach(el => el.value = '');
  }

  if (message.type === 'init') {
    message.events.sort((a, b) => Number(b.time) - Number(a.time)).forEach(createEventBox);
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

function formatUnixDate(unix) {
  const date = new Date(unix * 1000);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${month} ${day}, ${year} • ${hours}:${minutes} ${ampm}`;
}

function createEventBox(data) {
  const box = document.createElement('div');
  box.classList.add('event-box');

  const wrapper = document.createElement('div');

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

  const interestEl = document.createElement('button');
  interestEl.classList.add('event-interest');
  interestEl.innerText = 'Get notified!';

  wrapper.appendChild(nameEl);
  wrapper.appendChild(dateEl);
  wrapper.appendChild(locationEl);
  wrapper.appendChild(descEl);
  wrapper.appendChild(companyEl);

  box.appendChild(wrapper);
  box.appendChild(interestEl);

  output.prepend(box);
}

sendBtn.addEventListener('click', () => {
  const dateVal = document.getElementById('date').value;
  const timeVal = document.getElementById('time').value;
  
  const requiredFields = [
    'name',
    'date',
    'time',
    'description',
    'company',
    'street',
    'city',
    'state',
    'access'
  ];
  
  let hasErrors = false;
  
  requiredFields.forEach(id => {
    const el = document.getElementById(id);
    el?.addEventListener('input', () => {
      if (el.value.trim()) {
        el.classList.remove('error');
      }
    });
  });
  
  requiredFields.forEach(id => {
    const el = document.getElementById(id);
  
    if (!el || !el.value.trim()) {
      hasErrors = true;
      el?.classList.add('fielderror');
    } else {
      el.classList.remove('fielderror');
    }
  });
  
  if (hasErrors) {
    return;
  }
  
  const combined = new Date(`${dateVal}T${timeVal}`);
  const unixTime = Math.floor(combined.getTime() / 1000);

  const data = {
    name: document.getElementById('name').value,
    time: unixTime,
    description: document.getElementById('description').value,
    company: document.getElementById('company').value,
    street: document.getElementById('street').value,
    city: document.getElementById('city').value,
    state: document.getElementById('state').value,
    access: document.getElementById('access').value,
  };

  socket.send(JSON.stringify(data));
  sendBtn.disabled = true;
  sendBtn.innerText = "Posting...";
});


socket.onclose = (event) => {
  sendBtn.disabled = false;
  sendBtn.innerText = "Send";

  const hasContent = output.children.length > 0;

  if (!hasContent) {
    // Nothing in output: show error screen
    output.classList.add('hidden');
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

  } else {
    // There are existing events: show stashed notice only
    const box = document.createElement('div');
    box.classList.add('error-box');

    const infoEl = document.createElement('div');
    infoEl.classList.add('error-info');
    infoEl.appendChild(document.createTextNode("Connection lost. Visible events are stashed. Try "));

    const reloadLink = document.createElement('a');
    reloadLink.href = "#";
    reloadLink.innerText = "reloading the page";
    reloadLink.onclick = (e) => {
      e.preventDefault();
      window.location.reload();
    };
    infoEl.appendChild(reloadLink);

    infoEl.appendChild(document.createTextNode("."));

    box.appendChild(infoEl);
    errors.prepend(box);
  }
};

function refreshPage() {
  location.reload();
};