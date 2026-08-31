const createRequest = async (options = {}) => {
  const { url, method = 'GET', data } = options;
  const config = {
    method,
    headers: {},
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorText = `HTTP ошибка: ${response.status}`;
    try {
      const errorData = await response.json();
      errorText = errorData.error || errorData.message || errorText;
    } catch (e) {
      // Если бэкенд прислал не JSON, а обычный текст или упал совсем — оставляем статус
    }
    throw new Error(errorText);
  }

  if (response.status === 204) {
    return true;
  }
  return response.json();
};

export default createRequest;
