// Список API для цитат с резервными вариантами
const QUOTE_APIS = [
  'https://api.quotable.io/random',
  'https://type.fit/api/quotes'
];

// Резервные цитаты на случай недоступности API
const FALLBACK_QUOTES = [
  {
    text: "Верьте в себя и у вас все получится.",
    author: "Неизвестный автор",
    tags: ["motivation"]
  },
  {
    text: "Успех - это сумма малых усилий, повторенных изо дня в день.",
    author: "Роберт Колье",
    tags: ["success"]
  },
  {
    text: "Важна не победа, а участие.",
    author: "Пьер де Кубертен",
    tags: ["inspiration"]
  }
];

import { toast } from 'react-toastify';

const localQuotes = [
  { content: "Успех - это способность идти от неудачи к неудаче, не теряя энтузиазма.", author: "Уинстон Черчилль" },
  { content: "Величайшая слава в жизни состоит не в том, чтобы никогда не падать, а в том, чтобы подниматься после каждого падения.", author: "Нельсон Мандела" },
  { content: "Невозможное сегодня станет возможным завтра.", author: "Walt Disney" },
  { content: "Жизнь - это то, что с тобой происходит, пока ты занят другими планами.", author: "Джон Леннон" },
  { content: "Верь в себя и в то, что ты хочешь делать, и в свои мечты.", author: "Стив Джобс" }
];

class QuoteManager {
  constructor() {
    // Храним последнюю цитату для каждого чата
    this.chatQuotes = new Map();
  }

  async getQuoteForChat(chatId) {
    // Если для этого чата уже была цитата, возвращаем её
    if (this.chatQuotes.has(chatId)) {
      return this.chatQuotes.get(chatId);
    }

    try {
      const response = await fetch('https://api.quotable.io/random', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка сети');
      }

      const data = await response.json();
      
      const quote = {
        text: data.content,
        author: data.author,
        timestamp: Date.now()
      };

      // Сохраняем цитату для этого чата
      this.chatQuotes.set(chatId, quote);

      // Логируем получение цитаты
      console.log('🌐 Начало получения цитаты');
      console.log('✅ Цитата успешно получена:', quote);

      return quote;
    } catch (error) {
      console.error('Ошибка загрузки цитаты:', error);
      
      toast.warn('Не удалось загрузить цитату. Используется локальная цитата.', {
        position: "bottom-right",
        autoClose: 3000
      });

      // Возвращаем случайную локальную цитату
      const fallbackQuote = localQuotes[Math.floor(Math.random() * localQuotes.length)];
      
      const quote = {
        text: fallbackQuote.content,
        author: fallbackQuote.author,
        timestamp: Date.now()
      };

      // Сохраняем fallback цитату
      this.chatQuotes.set(chatId, quote);

      return quote;
    }
  }

  // Метод для очистки цитат для конкретного чата
  clearChatQuote(chatId) {
    this.chatQuotes.delete(chatId);
  }

  // Полная очистка всех сохраненных цитат
  clearAllChatQuotes() {
    this.chatQuotes.clear();
  }
}

// Создаем единственный экземпляр QuoteManager
export const quoteManager = new QuoteManager();

export { localQuotes };

// Универсальная функция получения цитат
async function fetchWithFallback(urls, options = {}) {
  const defaultOptions = {
    timeout: 5000,
    fallbackData: null,
    transformResponse: (data) => data
  };
  const mergedOptions = { ...defaultOptions, ...options };

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), mergedOptions.timeout);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ошибка! статус: ${response.status}`);
      }

      const rawData = await response.json();
      return mergedOptions.transformResponse(rawData);
    } catch (error) {
      console.warn(`Ошибка при получении с ${url}:`, error);
      continue;
    }
  }

  console.warn('Все попытки получения данных не удались');
  return mergedOptions.fallbackData || FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
}

// Получение случайной цитаты
export const fetchRandomQuote = async (userId, options = {}) => {
  // Проверяем, есть ли уже цитата для этого пользователя
  if (userQuoteCache.has(userId)) {
    return userQuoteCache.get(userId);
  }

  const { 
    category = null,  // Категория цитаты
    tags = []         // Теги для фильтрации цитат
  } = options;

  try {
    // Формируем URL с учетом тегов и категории
    const url = new URL('https://api.quotable.io/random');
    if (category) {
      url.searchParams.append('tags', category);
    }
    if (tags && tags.length > 0) {
      tags.forEach(tag => url.searchParams.append('tags', tag));
    }

    const data = await fetchWithFallback(QUOTE_APIS, {
      fallbackData: localQuotes[Math.floor(Math.random() * localQuotes.length)],
      transformResponse: (data) => {
        // Обработка разных форматов ответа
        if (data.content) {  // Quotable API
          return {
            text: data.content,
            author: data.author,
            category: data.tags?.[0] || 'general'
          };
        }
        if (Array.isArray(data)) {  // type.fit API
          const quote = data[Math.floor(Math.random() * data.length)];
          return {
            text: quote.text,
            author: quote.author,
            category: 'general'
          };
        }
        return data;
      }
    });

    if (!data) {
      throw new Error('Ошибка сети');
    }

    const quote = {
      text: data.text || 'Цитата не найдена',
      author: data.author || 'Неизвестный автор',
      category: data.category || 'Разное'
    };

    // Кэшируем цитату для пользователя
    userQuoteCache.set(userId, quote);

    return quote;
  } catch (error) {
    console.error('Ошибка загрузки цитаты:', error);
    
    // Логирование и уведомление об ошибке
    toast.warn('Не удалось загрузить цитату. Используется локальная цитата.', {
      position: "bottom-right",
      autoClose: 3000
    });

    // Возврат случайной локальной цитаты
    const fallbackQuote = localQuotes[Math.floor(Math.random() * localQuotes.length)];
    
    // Кэшируем fallback цитату
    userQuoteCache.set(userId, {
      text: fallbackQuote.content,
      author: fallbackQuote.author
    });

    return {
      text: fallbackQuote.content,
      author: fallbackQuote.author
    };
  }
};

// Кэш цитат для каждого пользователя
const userQuoteCache = new Map();

// Функция для очистки кэша цитат (например, при новой сессии или logout)
function clearUserQuoteCache(userId) {
  if (userId) {
    userQuoteCache.delete(userId);
  } else {
    userQuoteCache.clear();
  }
}

// Получение списка доступных тегов
export const getQuoteCategories = async () => {
  try {
    const response = await fetch('https://api.quotable.io/tags');
    const tags = await response.json();
    return tags.map(tag => tag.name).slice(0, 10); // Возвращаем первые 10 тегов
  } catch (error) {
    console.warn('Не удалось получить категории:', error);
    return ['motivation', 'success', 'life', 'wisdom', 'inspiration'];
  }
};

export { clearUserQuoteCache };
