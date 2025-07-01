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

  // Determine the role of the current user viewing the chat
  // 'viewerIs' can be 'user', 'company', or 'admin'
  const viewerIs = isCompany ? 'company' : (currentUser?.isAdmin ? 'admin' : 'user');

  // senderTypeForNewMessages: what senderType to use when this viewer sends a message
  let senderTypeForNewMessages;
  // senderIdForNewMessages: what senderId to use when this viewer sends a message
  let senderIdForNewMessages;
  // companyIdForContext: The ID of the company hosting the opportunity, used when admin sends as host.
  const companyIdForContext = opportunity?.companyId || opportunity?.company?._id;


  if (viewerIs === 'user') {
    senderTypeForNewMessages = 'user';
    senderIdForNewMessages = currentUser?._id;
  } else if (viewerIs === 'company') {
    senderTypeForNewMessages = 'organization';
    senderIdForNewMessages = currentUser?._id; // Company's own ID
  } else { // viewerIs === 'admin'
    // Admin sends as the organization hosting the opportunity
    senderTypeForNewMessages = 'organization'; // Or 'admin_as_host' if API handles it distinctly
    senderIdForNewMessages = companyIdForContext; // Admin sends on behalf of the company
  }

  const currentViewerIdToCompare = viewerIs === 'admin' ? companyIdForContext : currentUser?._id;

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
    if (!newMessage.trim() || !opportunity?._id || !senderIdForNewMessages) {
      setError('Cannot send message: missing critical information.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = {
        opportunityId: opportunity._id,
        senderId: senderIdForNewMessages, // ID of user, or company (even if admin is sending)
        senderType: senderTypeForNewMessages, // 'user' or 'organization'
        message: newMessage.trim(),
      };
      // If an admin is sending, their actual ID might be useful for logging/API
      if (viewerIs === 'admin' && currentUser?._id) {
        payload.actualSenderId = currentUser._id; // Admin's own ID
      }

      const response = await axios.post('/api/chat/messages', payload);
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
            // Determine if the message is from the current viewer
            // currentViewerIdToCompare is the ID of the user/company the viewer is acting as
            const isFromCurrentViewer = msg.senderId === currentViewerIdToCompare;

            let senderDisplayName;
            if (viewerIs === 'user') {
              if (msg.senderType === 'user' && isFromCurrentViewer) {
                senderDisplayName = 'You';
              } else if (msg.senderType === 'organization') {
                // Distinguish between admin and organization
                if (msg.actualSenderId && msg.actualSenderId !== msg.senderId) {
                  // Sent by admin as organization
                  senderDisplayName = 'Main Street Admin';
                } else {
                  senderDisplayName = opportunity?.companyName || 'Organization';
                }
              } else { // Other users, though not typical in this setup yet
                senderDisplayName = 'Volunteer';
              }
            } else if (viewerIs === 'company') {
              if (msg.senderType === 'organization' && isFromCurrentViewer) {
                senderDisplayName = 'You';
              } else if (msg.senderType === 'user') {
                senderDisplayName = 'Volunteer';
              } else { // Other orgs?
                senderDisplayName = msg.senderType;
              }
            } else { // viewerIs === 'admin'
              if (msg.senderType === 'organization' && isFromCurrentViewer) {
                // Admin sent this message acting as the host company
                senderDisplayName = 'Main Street Admin';
              } else if (msg.senderType === 'organization') {
                // Message from another organization (not the admin acting as host)
                senderDisplayName = opportunity?.companyName || 'Organization';
              } else if (msg.senderType === 'user') {
                senderDisplayName = 'Volunteer';
              } else {
                senderDisplayName = msg.senderType; // Fallback
              }
            }

            return (
              <div
                key={msg._id || index}
                className={`flex flex-col ${isFromCurrentViewer ? 'items-end' : 'items-start'} mb-1`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl shadow-md ${
                    isFromCurrentViewer
                      ? 'bg-accent1 text-white rounded-br-lg'
                      : 'bg-white text-text-primary border border-gray-200 rounded-bl-lg'
                  } ${isFromCurrentViewer ? 'ml-auto' : 'mr-auto'}`}
                  style={isFromCurrentViewer ? {borderBottomRightRadius: '4px'} : {borderBottomLeftRadius: '4px'}}
                >
                  <p className="font-montserrat text-xs font-semibold mb-1 opacity-90">
                    {senderDisplayName}
                  </p>
                  <p className="text-sm whitespace-pre-wrap leading-snug">{msg.message}</p>
                  <p className="text-xs opacity-60 mt-1.5 text-right">
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
              className="rounded-lg h-full px-4 py-2.5 self-end min-w-[80px] flex items-center justify-center" // Better mobile touch target and alignment
              disabled={loading || !newMessage.trim()}
            >
              <Icon path="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" className="w-4 h-4 flex-shrink-0" />
              <span className="ml-2 font-medium text-sm">Send</span>
            </Button>
          </div>
          {error && !messages.length && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
      </div>
    </Modal>
  );
};

export default ChatModal;
