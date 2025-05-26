import { useState, useRef, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Send, X, ChevronRight, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  options?: QuickOption[];
  isAI?: boolean;
  isLoading?: boolean;
};

type QuickOption = {
  id: string;
  text: string;
  query: string;
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAIMode, setIsAIMode] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! I'm your pharmacovigilance assistant. I can help with basic guidance or provide advanced AI-powered analysis.",
      sender: "bot",
      timestamp: new Date(),
      options: [
        { id: "ai_mode", text: "🤖 Enable AI Assistant", query: "enable_ai" },
        { id: "deadlines", text: "Show upcoming deadlines", query: "upcoming deadlines" },
        { id: "adr", text: "What is an ADR?", query: "what is adr" },
        { id: "reporting", text: "ADR reporting guidance", query: "adr reporting guidance" },
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Auto-scroll to the bottom of the messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus on input when chat is opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      let response, data;
      
      if (isAIMode) {
        // Use AI-powered chat
        response = await apiRequest("POST", "/api/ai-chat", {
          message: userMessage.text,
          conversationHistory: conversationHistory,
        });
        data = await response.json();
        
        // Update conversation history
        setConversationHistory(prev => [
          ...prev,
          { role: "user", content: userMessage.text },
          { role: "assistant", content: data.response }
        ]);
        
        // Add AI response
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            text: data.response,
            sender: "bot",
            timestamp: new Date(),
            isAI: true,
          },
        ]);
      } else {
        // Use basic chat responses
        response = await apiRequest("POST", "/api/chat", {
          message: userMessage.text,
        });
        data = await response.json();
        
        // Add bot response with any quick reply options
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            text: data.message,
            sender: "bot",
            timestamp: new Date(),
            options: data.options || [],
          },
        ]);
      }
    } catch (error) {
      // Fallback response when API fails
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          text: "Thank you for your query. Our team will respond shortly. For immediate assistance, please call our helpline at 1800 180 3024.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);

      toast({
        title: "Connection Error",
        description: "Could not connect to chat service. Using fallback responses.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };
  
  const handleQuickOptionClick = (query: string) => {
    if (query === "enable_ai") {
      setIsAIMode(true);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-enabled-${Date.now()}`,
          text: "🤖 AI Assistant activated! I can now provide advanced pharmacovigilance analysis, drug interaction insights, and detailed regulatory guidance. Ask me complex questions about adverse drug reactions, safety monitoring, or regulatory requirements.",
          sender: "bot",
          timestamp: new Date(),
          isAI: true,
          options: [
            { id: "drug_interactions", text: "Drug interaction analysis", query: "How do I assess drug interactions for safety?" },
            { id: "signal_detection", text: "Signal detection methods", query: "What are the best practices for pharmacovigilance signal detection?" },
            { id: "regulatory_requirements", text: "Regulatory requirements", query: "What are the key regulatory requirements for ADR reporting?" },
          ],
        },
      ]);
      return;
    }
    
    setInputValue(query);
    setTimeout(() => {
      handleSubmit();
    }, 300);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-lg w-80 md:w-96 overflow-hidden transition-all duration-300 max-h-[500px] flex flex-col">
          <div className="bg-primary text-white p-3 flex justify-between items-center">
            <h3 className="font-medium">PvPI Help Assistant</h3>
            <Button variant="ghost" size="icon" onClick={handleToggleChat} className="text-white hover:text-neutral-200 h-auto p-1">
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 p-3 overflow-y-auto h-80 bg-neutral-100">
            {messages.map((message) => (
              <div key={message.id} className="mb-4">
                <div 
                  className={`flex ${message.sender === "user" ? "justify-end" : ""}`}
                >
                  <div 
                    className={`p-2 rounded-lg max-w-[80%] ${
                      message.sender === "user"
                        ? "bg-neutral-200 rounded-tr-none"
                        : "bg-primary text-white rounded-tl-none"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
                
                {/* Quick reply options for bot messages */}
                {message.sender === "bot" && message.options && message.options.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.options.map(option => (
                      <button
                        key={option.id}
                        onClick={() => handleQuickOptionClick(option.query)}
                        className="flex items-center gap-1 px-3 py-1 bg-white border border-primary/30 rounded-full text-xs text-primary hover:bg-primary/10 transition-colors"
                      >
                        <span>{option.text}</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="p-3 border-t">
            <div className="flex">
              <Input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your query here..."
                disabled={isLoading}
                className="flex-1 p-2 border border-neutral-300 rounded-l focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="bg-primary text-white px-3 rounded-r hover:bg-primary-dark transition-colors"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <Button 
          onClick={handleToggleChat} 
          className="bg-primary hover:bg-primary-dark text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
