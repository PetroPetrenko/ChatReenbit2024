import { toast } from 'react-toastify';

const localQuotes = [
  { 
    content: "Успех - это способность идти от неудачи к неудаче, не теряя энтузиазма.", 
    author: "Уинстон Черчилль",
    tags: ["motivation", "success"]
  },
  { 
    content: "Величайшая слава в жизни состоит не в том, чтобы никогда не падать, а в том, чтобы подниматься после каждого падения.", 
    author: "Нельсон Мандела",
    tags: ["resilience", "inspiration"]
  },
  { 
    content: "Невозможное сегодня станет возможным завтра.", 
    author: "Walt Disney",
    tags: ["dreams", "possibility"]
  },
  { 
    content: "Жизнь - это то, что с тобой происходит, пока ты занят другими планами.", 
    author: "Джон Леннон",
    tags: ["life", "philosophy"]
  },
  { 
    content: "Верь в себя и в то, что ты хочешь делать, и в свои мечты.", 
    author: "Стив Джобс",
    tags: ["self-belief", "motivation"]
  },
  {
    content: "Не бойся идти медленно, бойся стоять на месте.",
    author: "Конфуций",
    tags: ["progress", "motivation"]
  },
  {
    content: "Твой успех и есть твоя величайшая месть.",
    author: "Фрида Кало",
    tags: ["success", "inspiration"]
  },
  {
    content: "Единственный способ делать великие дела - любить то, что ты делаешь.",
    author: "Стив Джобс",
    tags: ["passion", "work"]
  }
];

class QuoteManager {
  constructor() {
    this._chatQuotes = new Map();
    this._usedQuotes = new Set(); // Трекинг использованных цитат
  }

  _getUniqueRandomQuote() {
    // Если все цитаты были использованы, сбрасываем список использованных
    if (this._usedQuotes.size >= localQuotes.length) {
      this._usedQuotes.clear();
    }

    // Находим цитату, которая еще не использовалась
    let quote;
    do {
      quote = localQuotes[Math.floor(Math.random() * localQuotes.length)];
    } while (this._usedQuotes.has(quote.content));

    this._usedQuotes.add(quote.content);
    return quote;
  }

  async fetchQuote(chatId, options = {}) {
    // Если для этого чата уже есть цитата, возвращаем её
    if (this._chatQuotes.has(chatId)) {
      return this._chatQuotes.get(chatId);
    }

    // Получаем уникальную цитату
    const selectedQuote = this._getUniqueRandomQuote();

    const quote = {
      quote: selectedQuote.content,
      author: selectedQuote.author,
      tags: selectedQuote.tags || ['motivation'],
      length: selectedQuote.content.length,
      source: 'local'
    };

    // Сохраняем цитату для конкретного чата
    this._chatQuotes.set(chatId, quote);

    // Уведомление пользователя
    toast.info('Цитата дня', {
      position: "bottom-right",
      autoClose: 3000
    });

    return quote;
  }

  // Методы для сброса и управления цитатами
  resetQuoteForChat(chatId) {
    this._chatQuotes.delete(chatId);
  }

  reset() {
    this._chatQuotes.clear();
    this._usedQuotes.clear();
  }

  resetQuote() {
    this.reset();
  }

  // Получение цитат по тегу
  getQuotesByTag(tag) {
    return localQuotes.filter(quote => 
      quote.tags && quote.tags.includes(tag)
    );
  }

  // Получение случайной цитаты по тегу
  getRandomQuoteByTag(tag) {
    const taggedQuotes = this.getQuotesByTag(tag);
    return taggedQuotes.length > 0 
      ? taggedQuotes[Math.floor(Math.random() * taggedQuotes.length)]
      : this._getUniqueRandomQuote();
  }
}

// Создаем единственный экземпляр QuoteManager
export const quoteManager = new QuoteManager();
export { localQuotes };
