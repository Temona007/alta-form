// Netlify Function to proxy Follow Up Boss API calls
// Keeps API key secure on server side

const FUB_API_KEY = process.env.FUB_API_KEY;
const FUB_BASE_URL = 'https://api.followupboss.com/v1';

if (!FUB_API_KEY) {
  throw new Error('FUB_API_KEY environment variable is required');
}

function getAuthHeader() {
  const token = Buffer.from(`${FUB_API_KEY}:`).toString('base64');
  return `Basic ${token}`;
}

async function makeFubRequest(path, options = {}) {
  const { method = 'GET', query = {}, body } = options;
  
  // Build query string
  const queryString = new URLSearchParams(
    Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString();
  
  const url = `${FUB_BASE_URL}${path}${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthHeader(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(`FUB API error ${response.status}: ${JSON.stringify(data)}`);
  }

  return data;
}

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { action, ...payload } = JSON.parse(event.body);

    let result;

    switch (action) {
      // People
      case 'getPeople':
        result = await makeFubRequest('/people', { query: payload });
        break;
      case 'getPerson':
        result = await makeFubRequest(`/people/${payload.id}`);
        break;
      case 'createPerson':
        result = await makeFubRequest('/people', { method: 'POST', body: payload });
        break;
      case 'updatePerson':
        result = await makeFubRequest(`/people/${payload.id}`, { 
          method: 'PUT', 
          body: { ...payload, id: undefined } 
        });
        break;
      case 'deletePerson':
        result = await makeFubRequest(`/people/${payload.id}`, { method: 'DELETE' });
        break;

      // Notes
      case 'addNote':
        result = await makeFubRequest('/notes', { method: 'POST', body: payload });
        break;
      case 'getNote':
        result = await makeFubRequest(`/notes/${payload.id}`);
        break;
      case 'updateNote':
        result = await makeFubRequest(`/notes/${payload.id}`, { 
          method: 'PUT', 
          body: { ...payload, id: undefined } 
        });
        break;
      case 'deleteNote':
        result = await makeFubRequest(`/notes/${payload.id}`, { method: 'DELETE' });
        break;

      // Users
      case 'getUsers':
        result = await makeFubRequest('/users', { query: payload });
        break;
      case 'getUser':
        result = await makeFubRequest(`/users/${payload.id}`);
        break;

      // Identity
      case 'getMe':
        result = await makeFubRequest('/me');
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };

  } catch (error) {
    console.error('Netlify Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};