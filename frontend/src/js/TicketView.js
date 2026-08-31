export default class TicketView {
  static renderTicket(ticket) {
    const formattedDate = new Date(ticket.created)
      .toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
      .replace(',', '');

    return `
      <div class="ticket" data-id="${ticket.id}">
        <div class="ticket-header">
          <div class="ticket-status ${ticket.status ? 'done' : ''}">
            ${ticket.status ? '✓' : ''}
          </div>
          <div class="ticket-name">${ticket.name}</div>
          <div class="ticket-date">${formattedDate}</div>
          <div class="ticket-actions">
            <button class="edit-btn">✎</button>
            <button class="delete-btn">✗</button>
          </div>
        </div>
        <div class="ticket-description hidden"></div>
      </div>
    `;
  }
}
