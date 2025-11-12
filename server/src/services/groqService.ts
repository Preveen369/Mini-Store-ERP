import { config } from '../config';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class GroqService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = config.groq.apiKey;
    this.baseUrl = config.groq.baseUrl;
    this.model = config.groq.model;
  }

  async chat(messages: GroqMessage[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Groq API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Groq API error response:', errorData);
        throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as GroqResponse;
      return data.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('Groq API error:', error.message);
      throw new Error(`Failed to get response from LLM: ${error.message}`);
    }
  }

  // Generate narrative insights from dashboard data
  async generateInsights(data: any): Promise<string> {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: 'You are a friendly business mentor who explains store performance in simple, encouraging language. Turn complex numbers into easy-to-understand advice that any store owner can follow. Provide 3-5 bullet points with specific, actionable recommendations in everyday language.',
      },
      {
        role: 'user',
        content: `Here's my store data: ${JSON.stringify(data)}\n\nHelp me understand what's happening with my business and what I should do about it. Keep it simple and encouraging.`,
      },
    ];

    return this.chat(messages);
  }

  // Generate dashboard-specific insights (quick actionable items)
  async generateDashboardInsights(data: any): Promise<string> {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: `You are a friendly business mentor helping a store owner succeed. Generate immediate actionable insights in simple, encouraging language. 
        Format your response as:
        1. Start with a warm, motivational opening line
        2. Then provide 3-4 bullet points in this EXACT format: "* **Action Title**: Simple explanation in everyday language"
        
        Focus on: urgent actions, quick wins, alerts, and today's priorities. 
        Use a supportive, easy-to-understand tone. Avoid business jargon. Be specific with numbers and product names when available.
        Speak like you're talking to a friend who owns a store.`,
      },
      {
        role: 'user',
        content: `Current business snapshot: ${JSON.stringify(data)}
        
        Provide TODAY'S priorities and immediate actions in simple, friendly language. Explain things like you're talking to a friend. Use the format: "* **Action Title**: Easy-to-understand explanation"`,
      },
    ];

    return this.chat(messages);
  }

  // Generate reports-specific insights (analytical and strategic)
  async generateReportsInsights(data: any, period: string): Promise<string> {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: `You are a helpful business advisor who explains complex data in simple terms. Generate insights for the specified time period in language that any business owner can understand.
        Format your response as:
        1. Start with: "**What Your Numbers Tell You (${period})**"
        2. Then a friendly overview paragraph starting with "Here's what I found in your data..."
        3. Provide 4-5 numbered insights in this EXACT format: "1. **Simple Title**: Easy explanation with what this means for your business"
        
        Focus on: trends, performance insights, practical recommendations, and what to do next.
        Avoid complex business terms. Explain everything in plain English like you're talking to a neighbor who owns a store.`,
      },
      {
        role: 'user',
        content: `Business performance for ${period}: ${JSON.stringify(data)}
        
        Help me understand what these numbers mean for my business. Explain everything in simple terms that anyone can understand. Use numbered format: "1. **Simple Title**: What this means for you"`,
      },
    ];

    return this.chat(messages);
  }

  // Convert natural language query to action
  async parseNaturalLanguageQuery(query: string): Promise<any> {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: `Convert the user's natural language request into a JSON action object. 
Allowed actions: report_summary, product_search, low_stock_list, profit_by_period, top_products, expense_analysis, general_inquiry.
For date-related queries, extract from/to dates in YYYY-MM-DD format.
For product searches, extract search terms.
For time periods, extract days (e.g., "last 7 days" = days: 7).
Return only valid JSON, no explanation.

Examples:
- "What are my profits?" -> {"action": "report_summary"}
- "Show me products with low stock" -> {"action": "low_stock_list"}
- "Find products containing laptop" -> {"action": "product_search", "query": "laptop"}
- "Top sellers last week" -> {"action": "top_products", "days": 7}
- "Profit from Nov 1 to Nov 10" -> {"action": "profit_by_period", "from": "2025-11-01", "to": "2025-11-10"}`,
      },
      {
        role: 'user',
        content: query,
      },
    ];

    const response = await this.chat(messages);
    
    try {
      return JSON.parse(response);
    } catch {
      // Fallback for general inquiries
      return { action: 'general_inquiry', query };
    }
  }

  // Generate reorder suggestions for low stock items
  async generateReorderSuggestion(product: any, salesVelocity: number): Promise<string> {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful inventory assistant. Explain reorder recommendations in simple, friendly language that any store owner can understand.',
      },
      {
        role: 'user',
        content: `Product: ${product.name}
Current Stock: ${product.currentStock}
Reorder Threshold: ${product.reorderThreshold}
Average Daily Sales: ${salesVelocity.toFixed(2)}
Lead Time: 4 days
Safety Stock: 3 days

Help me figure out how much to reorder for the next 30 days. Explain it simply and tell me why this amount makes sense.`,
      },
    ];

    return this.chat(messages);
  }

  // Classify expense category from note
  async classifyExpense(note: string): Promise<string> {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: `Classify expenses into one of these categories: 
rent, salary, electricity, supplies, marketing, maintenance, other.
Return only the category name, nothing else.`,
      },
      {
        role: 'user',
        content: note,
      },
    ];

    return this.chat(messages);
  }

  // Generate conversational response for business queries
  async answerBusinessQuery(query: string, data: any): Promise<string> {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: `You are a friendly, knowledgeable business assistant for a retail store owner. Think of yourself as a helpful neighbor who understands business and explains things in simple, everyday language.

BUSINESS CONTEXT YOU HAVE ACCESS TO:
- Money matters: How much you're making, spending, and keeping as profit
- Your products: What's selling well, what's running low, what you have in stock
- Recent sales: Who's buying what and when
- Purchases: What you've bought from suppliers recently
- Expenses: Where your money is going each month
- Important alerts: Things that need your immediate attention

HOW TO RESPOND:
1. Always use real numbers from the data when possible
2. Explain things like you're talking to a friend over coffee
3. Avoid business jargon - use everyday words
4. Point out urgent things that need attention right away
5. Give practical advice that's easy to follow
6. Use bullet points when listing multiple things
7. Mention time periods to give context

EXAMPLE FRIENDLY RESPONSES:
- "Great news! You made $X profit this month, which is Y% more than last month. That means you're keeping about $Z for every $100 in sales."
- "I noticed you have X items that are running really low. You'll want to reorder these soon: [list items]. Running out could mean missing sales!"
- "Your top sellers are bringing in good money: [products] made you $X this month. Maybe stock up on these since people love them!"

Always be encouraging, helpful, and speak in plain English. Make business data feel less intimidating and more actionable.`,
      },
      {
        role: 'user',
        content: `Question: ${query}

Here's all the information about your business:
${JSON.stringify(data, null, 2)}

Please help me understand this in simple terms and give me practical advice based on what you see in the data.`,
      },
    ];

    return this.chat(messages);
  }
}

export const groqService = new GroqService();
