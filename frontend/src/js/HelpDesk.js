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

      <div class="modal-overlay hidden" id="error-modal">
        <div class="modal-content">
          <h3 class="modal-title">Ошибка</h3>
          <p class="modal-text" id="error-modal-text"></p>
          <div class="modal-actions">
            <button type="button" class="modal-btn modal-btn-ok" id="error-modal-ok">Ок</button>
          </div>
        </div>
      </div>
    `;
  }

  initElements() {
    this.listEl = this.container.querySelector('#tickets-list');
    this.ticketModal = new TicketForm(this.container.querySelector('#ticket-modal'));
    this.deleteModal = this.container.querySelector('#delete-modal');
    this.errorModal = this.container.querySelector('#error-modal');
    this.errorModalText = this.container.querySelector('#error-modal-text');
  }

  showError(message) {
    this.errorModalText.textContent = message;
    this.errorModal.classList.remove('hidden');
  }

  showFormError(message) {
    const existing = this.ticketModal.modalEl.querySelector('.form-error');
    if (existing) existing.remove();

    const errorEl = document.createElement('div');
    errorEl.className = 'form-error';
    errorEl.textContent = message;
    errorEl.style.cssText = 'color: #dc2626; font-size: 13px; margin-bottom: 12px;';

    const { form } = this.ticketModal;
    form.insertBefore(errorEl, form.firstChild);

    const nameInput = form.querySelector('#ticket-name');
    nameInput.style.borderColor = '#dc2626';
    nameInput.addEventListener('input', function resetBorder() {
      nameInput.style.borderColor = '';
      nameInput.removeEventListener('input', resetBorder);
    });
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

    this.container.querySelector('#error-modal-ok').addEventListener('click', () => {
      this.errorModal.classList.add('hidden');
    });

    this.ticketModal.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const { id, name, description } = this.ticketModal.getData();

      if (!name || !name.trim()) {
        this.showFormError('Поле «Краткое описание» обязательно для заполнения');
        return;
      }

      const trimmedName = name.trim();

      if (id) {
        this.ticketService.update(
          id,
          { name: trimmedName, description },
          () => {
            this.ticketModal.close();
            this.refresh();
          },
          (msg) => this.showError(msg),
        );
      } else {
        this.ticketService.create(
          { name: trimmedName, description, status: false },
          () => {
            this.ticketModal.close();
            this.refresh();
          },
          (msg) => this.showError(msg),
        );
      }
    });

    this.container.querySelector('#confirm-delete-btn').addEventListener('click', () => {
      if (this.ticketToDelete) {
        this.ticketService.delete(
          this.ticketToDelete,
          () => {
            this.deleteModal.classList.add('hidden');
            this.ticketToDelete = null;
            this.refresh();
          },
          (msg) => this.showError(msg),
        );
      }
    });

    this.listEl.addEventListener('click', (e) => {
      const ticketEl = e.target.closest('.ticket');
      if (!ticketEl) return;
      const { id } = ticketEl.dataset;

      if (e.target.classList.contains('ticket-status')) {
        const isDone = e.target.classList.contains('done');
        this.ticketService.update(
          id,
          { status: !isDone },
          () => {
            if (!isDone) {
              e.target.classList.add('done');
              e.target.textContent = '✓';
            } else {
              e.target.classList.remove('done');
              e.target.textContent = '';
            }
          },
          (msg) => this.showError(msg),
        );
        return;
      }

      if (e.target.classList.contains('edit-btn')) {
        this.ticketService.get(
          id,
          (fullTicket) => this.ticketModal.open('edit', fullTicket),
          (msg) => this.showError(msg),
        );
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
        this.ticketService.get(
          id,
          (fullTicket) => {
            descEl.textContent = fullTicket.description || 'Описание отсутствует';
            descEl.classList.remove('hidden');
          },
          (msg) => this.showError(msg),
        );
      }
    });
  }

  refresh() {
    this.listEl.innerHTML = '';
    this.ticketService.list(
      (tickets) => {
        if (!tickets) return;
        tickets.forEach((ticket) => {
          const html = TicketView.renderTicket(ticket);
          this.listEl.insertAdjacentHTML('beforeend', html);
        });
      },
      (msg) => this.showError(msg),
    );
  }
}
