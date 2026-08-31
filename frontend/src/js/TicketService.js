/* eslint-disable no-console, no-alert */
import createRequest from './api/createRequest';

export default class TicketService {
  constructor() {
    this.baseUrl = 'http://localhost:7070/';
  }

  async list(callback) {
    try {
      const data = await createRequest({ url: `${this.baseUrl}?method=allTickets`, method: 'GET' });
      callback(data);
    } catch (error) {
      console.error(error);
      alert(`Не удалось загрузить тикеты:\n${error.message}`);
    }
  }

  async get(id, callback) {
    try {
      const data = await createRequest({ url: `${this.baseUrl}?method=ticketById&id=${id}`, method: 'GET' });
      callback(data);
    } catch (error) {
      console.error(error);
      alert(`Не удалось получить данные тикета:\n${error.message}`);
    }
  }

  async create(data, callback) {
    try {
      const response = await createRequest({ url: `${this.baseUrl}?method=createTicket`, method: 'POST', data });
      callback(response);
    } catch (error) {
      console.error(error);
      alert(`Ошибка при создании тикета:\n${error.message}`);
    }
  }

  async update(id, data, callback) {
    try {
      const response = await createRequest({ url: `${this.baseUrl}?method=updateById&id=${id}`, method: 'POST', data });
      callback(response);
    } catch (error) {
      console.error(error);
      alert(`Ошибка при сохранении изменений:\n${error.message}`);
    }
  }

  async delete(id, callback) {
    try {
      const response = await createRequest({ url: `${this.baseUrl}?method=deleteById&id=${id}`, method: 'GET' });
      callback(response);
    } catch (error) {
      console.error(error);
      alert(`Ошибка при удалении тикета:\n${error.message}`);
    }
  }
}
