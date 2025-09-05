'use client';
import { useState, useRef, ChangeEvent, FormEvent } from 'react';

type FormData = {
  supportType: string;
  subject: string;
  description: string;
  salesOrder: string;
  deviceType: string;
  files: File[];
  acceptTerms: boolean;
};

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
};

const MAX_TEXT_LENGTH = 500;
const MAX_INPUT_LENGTH = 50;


function PatientPortal () {
  const [activeTab, setActiveTab] = useState<'form' | 'chat'>('form');
  const [formData, setFormData] = useState<FormData>({
    supportType: '',
    subject: '',
    description: '',
    salesOrder: '',
    deviceType: '',
    files: [],
    acceptTerms: false,
  });
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can we assist you today?',
      sender: 'support',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: '2',
      text: 'I need help with my prosthetic device settings.',
      sender: 'user',
      timestamp: new Date(Date.now() - 1800000),
    },
    {
      id: '3',
      text: 'We can help with that. Could you please specify which device you have?',
      sender: 'support',
      timestamp: new Date(Date.now() - 900000),
    },
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;
    
    if (type === 'file') {
      const files = target.files ? Array.from(target.files) : [];
      setFormData(prev => ({ ...prev, files }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      if (value.length <= (name === 'description' ? MAX_TEXT_LENGTH : MAX_INPUT_LENGTH)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    // console.log('Form submitted:', formData);
    // Show success message and optionally switch to chat tab
    setActiveTab('chat');
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Simulate response after 1-2 seconds
      setTimeout(() => {
        const response: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Thank you for your message. Our support team will get back to you shortly.',
          sender: 'support',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, response]);
      }, 1000 + Math.random() * 1000);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
      <div className="w-full">
        <div className="bg-white">
          <nav className="flex border-b">
            <button
              onClick={() => setActiveTab('form')} 
              className={`px-4 py-3 text-sm font-medium flex-1 ${
                activeTab === 'form' 
                  ? 'text-primary/100 border-b-2 border-primary/90' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Support Request
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-3 text-sm font-medium flex-1 ${
                activeTab === 'chat' 
                  ? 'text-primary/100 border-b-2 border-primary/90' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Messages
            </button>
          </nav>
        </div>

        {activeTab === 'form' && (
          <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">

            <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Support Type</label>
  <select
    name="supportType"
    value={formData.supportType}
    onChange={handleChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/100 text-sm text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-colors"
    required
  >
    <option value="" className="text-gray-400">Select support type</option>
    <option value="technical" className="text-gray-700 hover:bg-gray-100">Technical Support</option>
    <option value="billing" className="text-gray-700 hover:bg-gray-100">Form Inquiry</option>
    <option value="device" className="text-gray-700 hover:bg-gray-100">Device Questions</option>
    <option value="other" className="text-gray-700 hover:bg-gray-100">Other</option>
  </select>
</div>

              <div className=''>
                <label className="mt-2 block text-sm font-medium text-gray-700 mb-0">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/100 text-sm"
                  maxLength={MAX_INPUT_LENGTH}
                  required
                  placeholder="Brief description of your issue"
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {formData.subject.length}/{MAX_INPUT_LENGTH}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/100 text-sm"
                  rows={4}
                  maxLength={MAX_TEXT_LENGTH}
                  required
                  placeholder="Please describe your issue in detail"
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {formData.description.length}/{MAX_TEXT_LENGTH}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sales Order #</label>
                  <input
                    type="text"
                    name="salesOrder"
                    value={formData.salesOrder}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/100 text-sm"
                    maxLength={MAX_INPUT_LENGTH}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
                  <input
                    type="text"
                    name="deviceType"
                    value={formData.deviceType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/100 text-sm"
                    maxLength={MAX_INPUT_LENGTH}
                    placeholder="Optional"
                  />
                </div>
              </div>
               
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attachments (optional)</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleChange}
                  className="hidden"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="w-full px-4 py-2 border border-dashed border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Upload files</span>
                  {formData.files.length > 0 && (
                    <span className="text-gray-500 text-xs">({formData.files.length} selected)</span>
                  )}
                </button>
                {formData.files.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    Files: {formData.files.map(f => f.name).join(', ')}
                  </div>
                )}
              </div> */}
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="focus:ring-primary/90 h-4 w-4 text-primary/100 border-gray-300 rounded"
                    required
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="acceptTerms" className="text-gray-700">
                    I agree to the <a href="#" className="text-primary/100 hover:underline">terms of service</a>
                  </label>
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-primary/100 text-white rounded-md hover:bg-primary/100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium transition-colors"
                  disabled={!formData.acceptTerms}
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        )}
        
        {activeTab === 'chat' && (
          <div className="flex flex-col h-96">
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div className="space-y-4">
                {messages.map((message, idx) => {
                  const showDate = idx === 0 || 
                    formatDate(message.timestamp) !== formatDate(messages[idx - 1].timestamp);
                  
                  return (
                    <div key={message.id} className="space-y-1">
                      {showDate && (
                        <div className="text-center text-xs text-gray-500 my-2">
                          {formatDate(message.timestamp)}
                        </div>
                      )}
                      <div className={`mt-2 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                          message.sender === 'user' 
                            ? 'bg-primary/10 rounded-tr-none' 
                            : 'bg-white rounded-tl-none shadow'
                        }`}>
                          <p>{message.text}</p>
                          <p className="text-xs text-gray-500 mt-1 text-right">
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="border-t p-3 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/100 text-sm"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-primary/100 text-white rounded-md hover:bg-primary/100 focus:outline-none focus:ring-2 focus:ring-primary/100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default PatientPortal;