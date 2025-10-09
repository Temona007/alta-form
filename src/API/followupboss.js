// Follow Up Boss API client using Netlify Functions as proxy
// This keeps the API key secure on the server side while allowing direct calls from React

const NETLIFY_FUNCTION_URL = '/.netlify/functions/followupboss';

async function callNetlifyFunction(action, payload = {}) {
  const response = await fetch(NETLIFY_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action,
      ...payload,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Netlify Function error ${response.status}: ${error}`);
  }

  const result = await response.json();
  return result;
}

// People API
export async function getPeople({ limit = 20, page = 1, q, updatedMin, createdMin } = {}) {
  return callNetlifyFunction('getPeople', { limit, page, q, updatedMin, createdMin });
}

export async function getPerson(id) {
  return callNetlifyFunction('getPerson', { id });
}

export async function createPerson(payload) {
  return callNetlifyFunction('createPerson', payload);
}

export async function updatePerson(id, payload) {
  return callNetlifyFunction('updatePerson', { id, ...payload });
}

export async function deletePerson(id) {
  return callNetlifyFunction('deletePerson', { id });
}

// Notes API
export async function addNote(payload) {
  return callNetlifyFunction('addNote', payload);
}

export async function getNote(id) {
  return callNetlifyFunction('getNote', { id });
}

export async function updateNote(id, payload) {
  return callNetlifyFunction('updateNote', { id, ...payload });
}

export async function deleteNote(id) {
  return callNetlifyFunction('deleteNote', { id });
}

// Users API
export async function getUsers({ limit = 50, page = 1 } = {}) {
  return callNetlifyFunction('getUsers', { limit, page });
}

export async function getUser(id) {
  return callNetlifyFunction('getUser', { id });
}

// Identity
export async function getMe() {
  return callNetlifyFunction('getMe');
}

// Helper function to create or find person by email
export async function getOrCreatePersonByEmail({ firstName, lastName, email, phone, tags = ['Alta Lead'], stage = 'New', source = 'Website' }) {
  if (!email) throw new Error('email is required');
  
  // First try to find existing person
  const search = await getPeople({ q: email, limit: 1 });
  const existing = (search?.people || search?.items || []).find(p =>
    (p.emails || []).some(e => (e.value || '').toLowerCase() === email.toLowerCase())
  );
  
  if (existing) return existing;

  // Create new person if not found
  const payload = {
    firstName,
    lastName,
    emails: email ? [{ value: email }] : [],
    phones: phone ? [{ value: phone }] : [],
    tags,
    stage,
    source,
  };
  
  return createPerson(payload);
}