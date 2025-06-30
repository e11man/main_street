import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Icon from '../ui/Icon';
import axios from 'axios';

const ChatModal = ({ isOpen, onClose, opportunity, currentUser, isCompany }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatMessagesEndRef = useRef(null);

  const senderType = isCompany ? 'organization' : 'user';
  // Ensure currentUser and _id are available, default to a generic ID if not (should not happen in practice)
  const senderId = currentUser?._id || 'anonymous';
  const companyName = opportunity?.companyName || 'Organization';
  const userName = currentUser?.name || 'User';

  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && opportunity?._id) {
      fetchMessages();
    }
    // Clear messages when modal is closed
    return () => {
      setMessages([]);
      setNewMessage('');
      setError('');
    }
  }, [isOpen, opportunity?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!opportunity?._id) return;
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/chat/messages?opportunityId=${opportunity._id}`);
      setMessages(response.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !opportunity?._id || !senderId) return;

    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/chat/messages', {
        opportunityId: opportunity._id,
        senderId: senderId,
        senderType: senderType,
        message: newMessage.trim(),
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Chat for ${opportunity?.title || 'Opportunity'}`}>
      <div className="p-6 bg-gradient-to-br from-surface to-surface-dark rounded-lg shadow-xl max-h-[70vh] flex flex-col">
        <div className="overflow-y-auto flex-grow mb-4 pr-2 space-y-4 scrollbar-thin scrollbar-thumb-accent1/50 scrollbar-track-surface-light rounded-lg">
          {loading && messages.length === 0 && (
            <div className="flex justify-center items-center h-full">
              <p className="text-text-secondary">Loading messages...</p>
            </div>
          )}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {!loading && !error && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Icon path="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" className="w-16 h-16 text-accent1/30 mb-4" />
              <h3 className="font-montserrat text-lg font-semibold text-primary mb-1">No messages yet.</h3>
              <p className="text-text-secondary text-sm">Be the first to start the conversation!</p>
            </div>
          )}
          {messages.map((msg, index) => {
            const isCurrentUserMessage = msg.senderId === senderId && msg.senderType === senderType;
            const messageSenderName = msg.senderType === 'organization' ? companyName : (isCurrentUserMessage ? userName : 'Volunteer');

            return (
              <div
                key={msg._id || index} // Use msg._id if available, otherwise index as fallback
                className={`flex ${isCurrentUserMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl shadow ${
                    isCurrentUserMessage
                      ? 'bg-accent1 text-white rounded-br-none'
                      : 'bg-white text-text-primary border border-border rounded-bl-none'
                  }`}
                >
                  <p className="font-montserrat text-xs font-semibold mb-1">
                    {isCurrentUserMessage ? 'You' : messageSenderName}
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={chatMessagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="mt-auto pt-4 border-t border-border">
          <div className="flex items-start space-x-3">
            <Textarea
              id="newMessage"
              name="newMessage"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow resize-none scrollbar-thin scrollbar-thumb-accent1/50 scrollbar-track-surface-light"
              rows="2"
              required
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <Button
              type="submit"
              variant="primary"
              className="rounded-lg h-full px-5 py-2.5 self-end" // Adjusted padding for better alignment with textarea
              disabled={loading || !newMessage.trim()}
            >
              <Icon path="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" className="w-5 h-5" />
              <span className="ml-2 hidden sm:inline">Send</span>
            </Button>
          </div>
          {error && !messages.length && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
      </div>
    </Modal>
  );
};

export default ChatModal;
