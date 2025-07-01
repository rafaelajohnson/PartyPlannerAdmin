// === Constants ===
const BASE   = 'https://fsa-crud-2aa9294fe819.herokuapp.com/api';
const COHORT = '2aa9294fe819';
const API    = `${BASE}/${COHORT}`;

// === State ===
let parties        = [];
let selectedParty  = null;

// === Data Fetchers ===
async function getParties() {
  try {
    const res    = await fetch(`${API}/events`);
    const result = await res.json();
    parties = result.data;
  } catch (err) {
    console.error('Error loading parties:', err);
    parties = [];
  }
}

async function getParty(id) {
  try {
    const res    = await fetch(`${API}/events/${id}`);
    const result = await res.json();
    selectedParty = result.data;
  } catch (err) {
    console.error(`Error loading party ${id}:`, err);
    selectedParty = null;
  }
}

async function createParty({ name, description, date, location }) {
  try {
    const isoDate = new Date(date).toISOString();
    const res     = await fetch(`${API}/events`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, description, date: isoDate, location })
    });
    const result = await res.json();
    await getParties();
    selectedParty = result.data;
    render();
  } catch (err) {
    console.error('Error creating party:', err);
  }
}

async function deleteParty(id) {
  try {
    await fetch(`${API}/events/${id}`, { method: 'DELETE' });
    selectedParty = null;
    await getParties();
    render();
  } catch (err) {
    console.error(`Error deleting party ${id}:`, err);
  }
}

// === Components ===
function PartyListItem(party) {
  const $li = document.createElement('li');
  if (party.id === selectedParty?.id) $li.classList.add('selected');

  const $link = document.createElement('a');
  $link.href = '#';
  $link.textContent = party.name;
  $link.addEventListener('click', async (e) => {
    e.preventDefault();
    await getParty(party.id);
    render();
  });

  $li.appendChild($link);
  return $li;
}

function PartyList() {
  const $ul = document.createElement('ul');
  $ul.classList.add('parties');
  const items = parties.map(PartyListItem);
  $ul.replaceChildren(...items);
  return $ul;
}

function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement('p');
    $p.textContent = 'Please select a party to see its details.';
    return $p;
  }

  const { id, name, date, location, description } = selectedParty;
  const $sec = document.createElement('section');
  $sec.innerHTML = `
    <h3>${name} #${id}</h3>
    <time datetime="${date}">${date.slice(0,10)}</time>
    <address>${location}</address>
    <p>${description}</p>
  `;

  const $btn = document.createElement('button');
  $btn.textContent = 'Delete party';
  $btn.addEventListener('click', () => deleteParty(id));
  $sec.appendChild($btn);

  return $sec;
}

function AddPartyForm() {
  const $form = document.createElement('form');

  // Name
  const $labelName = document.createElement('label');
  $labelName.textContent = 'Name';
  const $inputName = document.createElement('input');
  $inputName.type = 'text';
  $inputName.name = 'name';
  $inputName.required = true;
  $labelName.append($inputName);

  // Description
  const $labelDesc = document.createElement('label');
  $labelDesc.textContent = 'Description';
  const $inputDesc = document.createElement('input');
  $inputDesc.type = 'text';
  $inputDesc.name = 'description';
  $inputDesc.required = true;
  $labelDesc.append($inputDesc);

  // Date
  const $labelDate = document.createElement('label');
  $labelDate.textContent = 'Date';
  const $inputDate = document.createElement('input');
  $inputDate.type = 'date';
  $inputDate.name = 'date';
  $inputDate.required = true;
  $labelDate.append($inputDate);

  // Location
  const $labelLoc = document.createElement('label');
  $labelLoc.textContent = 'Location';
  const $inputLoc = document.createElement('input');
  $inputLoc.type = 'text';
  $inputLoc.name = 'location';
  $inputLoc.required = true;
  $labelLoc.append($inputLoc);

  // Submit
  const $btn = document.createElement('button');
  $btn.type = 'submit';
  $btn.textContent = 'Add party';

  $form.append($labelName, $labelDesc, $labelDate, $labelLoc, $btn);

  $form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const name        = form.name.value.trim();
    const description = form.description.value.trim();
    const date        = form.date.value;
    const location    = form.location.value.trim();
    if (!name || !description || !date || !location) return;
    await createParty({ name, description, date, location });
    form.reset();
  });

  return $form;
}

// === Render ===
function render() {
  const $app = document.querySelector('#app');
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
        <h2>Add a new party</h2>
        <AddPartyForm></AddPartyForm>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
    </main>
  `;

  $app.querySelector('PartyList').replaceWith(PartyList());
  $app.querySelector('SelectedParty').replaceWith(SelectedParty());
  $app.querySelector('AddPartyForm').replaceWith(AddPartyForm());
}

// === Initialization ===
async function init() {
  await getParties();
  render();
}

init();
