import { toast } from 'react-toastify';
import https from 'https';

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
  }
];

const quoteCategories = [
  "motivation", "success", "resilience", "inspiration", 
  "dreams", "life", "philosophy", "self-belief"
];

const QUOTE_APIS = [
  {
    url: 'https://api.quotable.io/random',
    transform: (data) => ({
      text: data.content,
      author: data.author,
      tags: data.tags || ['motivation']
    }),
    agent: new https.Agent({ 
      rejectUnauthorized: false 
    })
  },
  {
    url: 'https://type.fit/api/quotes',
    transform: (data) => {
      const quote = data[Math.floor(Math.random() * data.length)];
      return {
        text: quote.text,
        author: quote.author || 'Unknown',
        tags: ['inspiration']
      };
    },
    agent: new https.Agent({ 
      rejectUnauthorized: false 
    })
  }
];

async function fetchRandomQuote(options = {}) {
  const { category } = options;

  for (const api of QUOTE_APIS) {
    try {
      const response = await fetch(api.url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        agent: api.agent
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const processedQuote = api.transform(data);

      // Фильтрация по категории, если указана
      if (category && processedQuote.tags) {
        const matchingQuote = processedQuote.tags.includes(category) 
          ? processedQuote 
          : null;

        if (matchingQuote) {
          return {
            text: matchingQuote.text,
            author: matchingQuote.author,
            category: category
          };
        }
      }

      return {
        text: processedQuote.text,
        author: processedQuote.author,
        category: category || (processedQuote.tags && processedQuote.tags[0]) || 'motivation'
      };

    } catch (error) {
      console.warn(`Ошибка при получении цитаты от ${api.url}:`, error);
      continue;
    }
  }

  // Fallback на локальные цитаты
  const filteredQuotes = category 
    ? localQuotes.filter(quote => quote.tags.includes(category))
    : localQuotes;

  const quote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];

  toast.info('Использована локальная цитата', {
    position: "bottom-right",
    autoClose: 2000
  });

  return {
    text: quote.content,
    author: quote.author,
    category: category || quote.tags[0]
  };
}

function getQuoteCategories() {
  return Promise.resolve(quoteCategories);
}

export { 
  fetchRandomQuote, 
  getQuoteCategories, 
  quoteCategories 
};
