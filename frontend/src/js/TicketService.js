import createRequest from './api/createRequest';

export default class TicketService {
  constructor() {
    this.baseUrl = 'http://localhost:7070/';
  }

  async list(callback, errorCallback) {
    try {
      const data = await createRequest({ url: `${this.baseUrl}?method=allTickets`, method: 'GET' });
      callback(data);
    } catch (error) {
      if (errorCallback) errorCallback(`Не удалось загрузить тикеты: ${error.message}`);
    }
  }

  async get(id, callback, errorCallback) {
    try {
      const data = await createRequest({ url: `${this.baseUrl}?method=ticketById&id=${id}`, method: 'GET' });
      callback(data);
    } catch (error) {
      if (errorCallback) errorCallback(`Не удалось получить данные тикета: ${error.message}`);
    }
  }

  async create(data, callback, errorCallback) {
    try {
      const response = await createRequest({ url: `${this.baseUrl}?method=createTicket`, method: 'POST', data });
      callback(response);
    } catch (error) {
      if (errorCallback) errorCallback(`Ошибка при создании тикета: ${error.message}`);
    }
  }

  async update(id, data, callback, errorCallback) {
    try {
      const response = await createRequest({ url: `${this.baseUrl}?method=updateById&id=${id}`, method: 'POST', data });
      callback(response);
    } catch (error) {
      if (errorCallback) errorCallback(`Ошибка при сохранении изменений: ${error.message}`);
    }
  }

  async delete(id, callback, errorCallback) {
    try {
      const response = await createRequest({ url: `${this.baseUrl}?method=deleteById&id=${id}`, method: 'GET' });
      callback(response);
    } catch (error) {
      if (errorCallback) errorCallback(`Ошибка при удалении тикета: ${error.message}`);
    }
  }
}
