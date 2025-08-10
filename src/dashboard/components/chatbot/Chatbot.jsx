import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { gsap } from 'gsap';
import {
  ChatbotContainer,
  ChatbotButton,
  ChatWindow,
  ChatHeader,
  ChatAvatar,
  ChatHeaderInfo,
  ChatTitle,
  ChatStatus,
  ChatCloseButton,
  ChatMessages,
  Message,
  MessageAvatar,
  MessageBubble,
  MessageText,
  MessageTime,
  TypingIndicator,
  TypingDots,
  ChatInputArea,
  ChatInput,
  SendButton,
  QuickActions,
  QuickActionButton,
  NotificationBadge
} from './Chatbot.styles';

// AI Assistant responses
const getAIResponse = (message) => {
  const responses = {
    greeting: [
      "Hello! I'm your AI assistant. How can I help you today?",
      "Hi there! Welcome to DDS Admin. What would you like to know?",
      "Greetings! I'm here to assist you with any questions you might have."
    ],
    help: [
      "I can help you with:\n• Navigation and dashboard features\n• Employee management\n• Team information\n• Technical support\n• General questions",
      "Here are some things I can assist with:\n• Understanding dashboard features\n• Finding specific information\n• Troubleshooting issues\n• Providing guidance"
    ],
    dashboard: [
      "The dashboard provides an overview of all your key metrics including employee stats, project progress, and team performance. Would you like me to explain any specific section?",
      "Your dashboard shows real-time data about employees, projects, and team activities. Is there a particular feature you'd like to explore?"
    ],
    employees: [
      "The Employee Management system allows you to view detailed profiles, contact information, hourly rates, and performance ratings. You can also manage team assignments and track productivity.",
      "In the Employees section, you can access comprehensive staff information including skills, experience, and team memberships. Would you like to know about specific features?"
    ],
    teams: [
      "The Teams section showcases all your digital agency teams including Development, Marketing, Design, and more. Each team has detailed member profiles and project statistics.",
      "You can explore 12 different teams across various departments. Click on any team member to view their detailed profile with skills and experience."
    ],
    attendance: [
      "The Attendance system tracks employee check-ins, work hours, and provides detailed analytics. You can monitor real-time activity and generate reports.",
      "Attendance tracking includes daily logs, time analytics, and performance metrics. Is there something specific you'd like to know about attendance features?"
    ],
    default: [
      "I understand you're asking about that. Let me help you find the information you need. Could you be more specific?",
      "That's an interesting question! I'm here to help. Could you provide a bit more context?",
      "I'd be happy to assist you with that. Can you tell me more about what you're looking for?"
    ]
  };

  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
  } else if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
    return responses.help[Math.floor(Math.random() * responses.help.length)];
  } else if (lowerMessage.includes('dashboard') || lowerMessage.includes('overview')) {
    return responses.dashboard[Math.floor(Math.random() * responses.dashboard.length)];
  } else if (lowerMessage.includes('employee') || lowerMessage.includes('staff')) {
    return responses.employees[Math.floor(Math.random() * responses.employees.length)];
  } else if (lowerMessage.includes('team') || lowerMessage.includes('group')) {
    return responses.teams[Math.floor(Math.random() * responses.teams.length)];
  } else if (lowerMessage.includes('attendance') || lowerMessage.includes('tracking')) {
    return responses.attendance[Math.floor(Math.random() * responses.attendance.length)];
  } else {
    return responses.default[Math.floor(Math.random() * responses.default.length)];
  }
};

const Chatbot = () => {
  const themeContext = useTheme();
  const { isDarkMode = false } = themeContext || {};
  
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNotification, setHasNotification] = useState(true);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatbotRef = useRef(null);

  // Scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 3D entrance animation
  useEffect(() => {
    if (chatbotRef.current) {
      gsap.fromTo(chatbotRef.current, 
        {
          scale: 0,
          rotation: 180,
          opacity: 0
        },
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 1.2,
          ease: "back.out(1.7)",
          delay: 2
        }
      );
    }
  }, []);

  const handleToggleChat = () => {
    if (isOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 600);
    } else {
      setIsOpen(true);
      setHasNotification(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 700);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: getAIResponse(inputValue),
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleQuickAction = (action) => {
    const quickMessages = {
      'Dashboard Help': "Can you explain the dashboard features?",
      'Employee Info': "How do I manage employee information?",
      'Team Details': "Tell me about the teams section",
      'Contact Support': "I need technical support"
    };

    setInputValue(quickMessages[action] || action);
    setTimeout(() => handleSendMessage(), 100);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <ChatbotContainer ref={chatbotRef}>
      {/* Chat Window */}
      {isOpen && (
        <ChatWindow isDarkMode={isDarkMode} isClosing={isClosing}>
          {/* Header */}
          <ChatHeader isDarkMode={isDarkMode}>
            <ChatAvatar>🤖</ChatAvatar>
            <ChatHeaderInfo>
              <ChatTitle isDarkMode={isDarkMode}>AI Assistant</ChatTitle>
              <ChatStatus>Online & Ready to Help</ChatStatus>
            </ChatHeaderInfo>
            <ChatCloseButton isDarkMode={isDarkMode} onClick={handleToggleChat}>
              ✕
            </ChatCloseButton>
          </ChatHeader>

          {/* Messages */}
          <ChatMessages isDarkMode={isDarkMode}>
            {messages.map((message, index) => (
              <Message key={message.id} isUser={message.isUser} delay={index * 100}>
                <MessageAvatar isUser={message.isUser}>
                  {message.isUser ? '👤' : '🤖'}
                </MessageAvatar>
                <MessageBubble isUser={message.isUser} isDarkMode={isDarkMode}>
                  <MessageText>{message.text}</MessageText>
                  <MessageTime isDarkMode={isDarkMode}>
                    {formatTime(message.timestamp)}
                  </MessageTime>
                </MessageBubble>
              </Message>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <TypingIndicator>
                <MessageAvatar isUser={false}>🤖</MessageAvatar>
                <TypingDots>
                  <span></span>
                  <span></span>
                  <span></span>
                </TypingDots>
              </TypingIndicator>
            )}
            <div ref={messagesEndRef} />
          </ChatMessages>

          {/* Quick Actions */}
          <QuickActions>
            {['Dashboard Help', 'Employee Info', 'Team Details', 'Contact Support'].map((action, index) => (
              <QuickActionButton
                key={index}
                isDarkMode={isDarkMode}
                onClick={() => handleQuickAction(action)}
              >
                {action}
              </QuickActionButton>
            ))}
          </QuickActions>

          {/* Input Area */}
          <ChatInputArea>
            <ChatInput
              ref={inputRef}
              type="text"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              isDarkMode={isDarkMode}
            />
            <SendButton 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
            >
              ➤
            </SendButton>
          </ChatInputArea>
        </ChatWindow>
      )}

      {/* Chatbot Button */}
      <ChatbotButton isDarkMode={isDarkMode} isOpen={isOpen} onClick={handleToggleChat}>
        {hasNotification && !isOpen && <NotificationBadge>1</NotificationBadge>}
        {isOpen ? '✕' : '🤖'}
      </ChatbotButton>
    </ChatbotContainer>
  );
};

export default Chatbot;
