import { useState, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { Bot, User, Send, Trash2, MessageSquare, Lightbulb } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  message: string;
  data?: any;
  timestamp: Date;
}

export default function AIAssistantPage() {
  const [nlQuery, setNlQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const suggestedQuestions = [
    "What are my top-selling products this month?",
    "Show me products with low stock levels",
    "What is my current profit margin and financial health?",
    "Which expenses are highest and how can I reduce costs?",
    "What should I focus on to improve sales and profitability?",
    "How much inventory should I reorder for my low stock items?",
    "What are my recent sales trends compared to expenses?",
  ];

  const handleNaturalLanguageQuery = async (e: FormEvent) => {
    e.preventDefault();
    if (!nlQuery.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: nlQuery,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsQueryLoading(true);
    const currentQuery = nlQuery;
    setNlQuery('');

    try {
      const response = await api.naturalLanguageQuery(currentQuery);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        message: response.data.response || 'No response generated',
        data: response.data.data,
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, assistantMessage]);
      toast.success('Response generated');
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        message: `Error: ${error.response?.data?.error || 'Failed to process your query. Please try again.'}`,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to execute query');
    } finally {
      setIsQueryLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setNlQuery(question);
  };

  const clearChatHistory = () => {
    setChatMessages([]);
    toast.success('Chat history cleared');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-3 rounded-xl">
            <Bot className="h-8 w-8 text-white" />
          </div>
          AI Business Assistant
        </h1>
        <p className="text-gray-600">
          Ask questions about your business data in natural language. I can help with sales analysis, 
          inventory management, financial reports, and business insights.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Suggested Questions Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-700">
              <Lightbulb className="h-5 w-5" />
              Suggested Questions
            </h3>
            <div className="space-y-2">
              {suggestedQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="w-full text-left p-3 text-sm bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200 hover:border-purple-300 text-black"
                  disabled={isQueryLoading}
                >
                  {question}
                </button>
              ))}
            </div>
            
            {chatMessages.length > 0 && (
              <button
                onClick={clearChatHistory}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors border border-red-200"
                disabled={isQueryLoading}
              >
                <Trash2 className="h-4 w-4" />
                Clear History
              </button>
            )}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <div className="card h-[700px] flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-black">
                <MessageSquare className="h-6 w-6 text-purple-600" />
                Chat with AI Assistant
              </h2>
              <span className="text-sm text-gray-500">
                {chatMessages.length} message{chatMessages.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 bg-gray-50 rounded-lg p-4">
              {chatMessages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="bg-gradient-to-br from-purple-100 to-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="h-12 w-12 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Welcome to your AI Business Assistant!</h3>
                  <p className="mb-4">Ask me anything about your business data and I'll provide insights based on your real-time store information including sales, inventory, expenses, and financial performance.</p>
                  <div className="text-sm text-gray-500">
                    <p>Example questions:</p>
                    <ul className="mt-2 space-y-1 ">
                      <li>"What's my current financial performance?"</li>
                      <li>"Which products need restocking urgently?"</li>
                      <li>"How can I improve my profit margins?"</li>
                      <li>"What are my highest expenses this month?"</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <>
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.type === 'assistant' && (
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                            <Bot className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      )}
                      
                      <div className={`flex-1 max-w-2xl ${msg.type === 'user' ? 'text-right' : ''}`}>
                        <div
                          className={`inline-block px-4 py-3 rounded-lg ${
                            msg.type === 'user'
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                              : 'bg-white border border-gray-200 shadow-sm text-black'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                          
                          {msg.data && (
                            <div className="mt-3 pt-3 border-t border-gray-300">
                              <details className="text-xs">
                                <summary className="cursor-pointer font-semibold text-gray-600 hover:text-gray-800 mb-2">
                                  📊 View detailed data
                                </summary>
                                <pre className="mt-2 p-3 bg-gray-100 rounded-lg overflow-x-auto text-left text-gray-700 border">
                                  {JSON.stringify(msg.data, null, 2)}
                                </pre>
                              </details>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 px-2">
                          {msg.timestamp.toLocaleTimeString()}
                        </div>
                      </div>

                      {msg.type === 'user' && (
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {isQueryLoading && (
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                        <Bot className="h-6 w-6 text-white" />
                      </div>
                      <div className="bg-white border border-gray-200 shadow-sm px-4 py-3 rounded-lg">
                        <div className="flex gap-1 items-center">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
                          <span className="ml-2 text-sm text-gray-600">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleNaturalLanguageQuery} className="flex gap-3">
              <input
                type="text"
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                placeholder="Ask me about sales, products, inventory, expenses, or business insights..."
                className="input-field flex-1 text-sm"
                disabled={isQueryLoading}
                autoFocus
              />
              <button
                type="submit"
                className="btn-primary px-6 py-2 flex items-center gap-2 min-w-[100px] btn"
                disabled={isQueryLoading || !nlQuery.trim()}
              >
                <Send className="h-4 w-4" />
                {isQueryLoading ? 'Thinking...' : 'Send'}
              </button>
            </form>
            
            <div className="mt-2 text-xs text-gray-500 text-center">
              💡 Tip: Be specific with your questions for better results
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}