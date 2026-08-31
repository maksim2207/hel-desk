export default class TicketForm {
  constructor(modalEl) {
    this.modalEl = modalEl;
    this.form = modalEl.querySelector('form');
    this.titleEl = modalEl.querySelector('.modal-title');
  }

  open(mode, ticket = null) {
    this.form.reset();
    if (mode === 'add') {
      this.titleEl.textContent = 'Добавить тикет';
      if (this.form.elements.id) this.form.elements.id.value = '';
    } else if (mode === 'edit' && ticket) {
      this.titleEl.textContent = 'Редактировать тикет';
      if (this.form.elements.id) this.form.elements.id.value = ticket.id;
      this.form.elements.name.value = ticket.name;
      this.form.elements.description.value = ticket.description || '';
    }
    this.modalEl.classList.remove('hidden');
  }

  close() {
    this.modalEl.classList.add('hidden');
    this.form.reset();
  }

  getData() {
    const formData = new FormData(this.form);
    return {
      id: formData.get('id'),
      name: formData.get('name'),
      description: formData.get('description'),
    };
  }
}
