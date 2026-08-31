import TicketForm from './TicketForm';
import TicketView from './TicketView';

export default class HelpDesk {
  constructor(container, ticketService) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('This is not HTML element!');
    }
    this.container = container;
    this.ticketService = ticketService;
    this.ticketToDelete = null;
  }

  init() {
    this.renderBaseHTML();
    this.initElements();
    this.registerEvents();
    this.refresh();
  }

  renderBaseHTML() {
    this.container.innerHTML = `
      <div class="helpdesk-app">
        <header class="helpdesk-header">
          <button id="add-ticket-btn" class="add-ticket-btn">Добавить тикет</button>
        </header>
        <main class="tickets-container" id="tickets-list"></main>
      </div>

      <div class="modal-overlay hidden" id="ticket-modal">
        <div class="modal-content">
          <h3 class="modal-title" id="modal-title-text">Добавить тикет</h3>
          <form id="ticket-form">
            <input type="hidden" id="ticket-id" name="id">
            
            <div class="form-group">
              <label for="ticket-name">Краткое описание</label>
              <input type="text" id="ticket-name" class="form-control" name="name" required>
            </div>
            
            <div class="form-group">
              <label for="ticket-description">Подробное описание</label>
              <textarea id="ticket-description" class="form-control" name="description" rows="4"></textarea>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="modal-btn modal-btn-cancel" id="cancel-modal-btn">Отмена</button>
              <button type="submit" class="modal-btn modal-btn-ok">Ок</button>
            </div>
          </form>
        </div>
      </div>

      <div class="modal-overlay hidden" id="delete-modal">
        <div class="modal-content">
          <h3 class="modal-title">Удалить тикет</h3>
          <p class="modal-text">Вы уверены, что хотите удалить этот тикет? Это действие необратимо.</p>
          <div class="modal-actions">
            <button type="button" class="modal-btn modal-btn-cancel" id="cancel-delete-btn">Отмена</button>
            <button type="button" class="modal-btn modal-btn-ok" id="confirm-delete-btn">Ок</button>
          </div>
        </div>
      </div>
    `;
  }

  initElements() {
    this.listEl = this.container.querySelector('#tickets-list');
    this.ticketModal = new TicketForm(this.container.querySelector('#ticket-modal'));
    this.deleteModal = this.container.querySelector('#delete-modal');
  }

  registerEvents() {
    this.container.querySelector('#add-ticket-btn').addEventListener('click', () => {
      this.ticketModal.open('add');
    });

    this.container.querySelector('#cancel-modal-btn').addEventListener('click', () => this.ticketModal.close());
    this.container.querySelector('#cancel-delete-btn').addEventListener('click', () => {
      this.deleteModal.classList.add('hidden');
      this.ticketToDelete = null;
    });

    this.ticketModal.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const { id, name, description } = this.ticketModal.getData();

      if (id) {
        this.ticketService.update(id, { name, description }, () => {
          this.ticketModal.close();
          this.refresh();
        });
      } else {
        this.ticketService.create({ name, description, status: false }, () => {
          this.ticketModal.close();
          this.refresh();
        });
      }
    });

    this.container.querySelector('#confirm-delete-btn').addEventListener('click', () => {
      if (this.ticketToDelete) {
        this.ticketService.delete(this.ticketToDelete, () => {
          this.deleteModal.classList.add('hidden');
          this.ticketToDelete = null;
          this.refresh();
        });
      }
    });

    this.listEl.addEventListener('click', (e) => {
      const ticketEl = e.target.closest('.ticket');
      if (!ticketEl) return;
      const { id } = ticketEl.dataset;

      if (e.target.classList.contains('ticket-status')) {
        const isDone = e.target.classList.contains('done');
        this.ticketService.update(id, { status: !isDone }, () => this.refresh());
        return;
      }

      if (e.target.classList.contains('edit-btn')) {
        this.ticketService.get(id, (fullTicket) => this.ticketModal.open('edit', fullTicket));
        return;
      }

      if (e.target.classList.contains('delete-btn')) {
        this.ticketToDelete = id;
        this.deleteModal.classList.remove('hidden');
        return;
      }

      const descEl = ticketEl.querySelector('.ticket-description');
      if (!descEl.classList.contains('hidden')) {
        descEl.classList.add('hidden');
      } else {
        this.ticketService.get(id, (fullTicket) => {
          descEl.textContent = fullTicket.description || 'Описание отсутствует';
          descEl.classList.remove('hidden');
        });
      }
    });
  }

  refresh() {
    this.listEl.innerHTML = '';
    this.ticketService.list((tickets) => {
      if (!tickets) return;
      tickets.forEach((ticket) => {
        const html = TicketView.renderTicket(ticket);
        this.listEl.insertAdjacentHTML('beforeend', html);
      });
    });
  }
}
