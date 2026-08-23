const { google } = require('googleapis');
const { getAuthenticatedClient } = require('./googleAuth');

async function createCalendarEvent(user, { summary, description, startTime, endTime }) {
  const auth = await getAuthenticatedClient(user);
  const calendar = google.calendar({ version: 'v3', auth });

  const event = {
    summary,
    description,
    start: { dateTime: new Date(startTime).toISOString() },
    end: { dateTime: new Date(endTime).toISOString() }
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event
  });

  return response.data; // includes response.data.id — save this to update/delete later
}

async function updateCalendarEvent(user, eventId, { summary, description, startTime, endTime }) {
  const auth = await getAuthenticatedClient(user);
  const calendar = google.calendar({ version: 'v3', auth });

  const response = await calendar.events.update({
    calendarId: 'primary',
    eventId,
    requestBody: {
      summary,
      description,
      start: { dateTime: new Date(startTime).toISOString() },
      end: { dateTime: new Date(endTime).toISOString() }
    }
  });

  return response.data;
}

async function deleteCalendarEvent(user, eventId) {
  const auth = await getAuthenticatedClient(user);
  const calendar = google.calendar({ version: 'v3', auth });
  await calendar.events.delete({ calendarId: 'primary', eventId });
}

module.exports = { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent };
