// Sends a resident message to the community team and queues an automated acknowledgement.
// No staff member answers in this prototype; replace this with a real API call later.
export function sendToTeam(actions, text, attachment = null) {
  actions.sendMessage(text, attachment);
  setTimeout(() => {
    actions.addTeamReply("Thanks, we've received your message. A member of the community team will reply here.");
  }, 1400);
}
