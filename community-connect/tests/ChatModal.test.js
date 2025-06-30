import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import ChatModal from '../components/Modal/ChatModal';
import { ObjectId } from 'mongodb'; // Import ObjectId

// Mock axios
jest.mock('axios');

// Mock child components
jest.mock('../components/Modal/Modal', () => ({ isOpen, onClose, title, children }) => (
  isOpen ? <div data-testid="modal">
    <h2>{title}</h2>
    <button onClick={onClose}>Close</button>
    {children}
  </div> : null
));
jest.mock('../components/ui/Button', () => ({ children, ...props }) => <button {...props}>{children}</button>);
jest.mock('../components/ui/Textarea', () => (props) => <textarea {...props} />);
jest.mock('../components/ui/Icon', () => (props) => <svg {...props} />);

// Mock scrollToBottom
const mockScrollToBottom = jest.fn();
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useRef: () => ({
    current: {
      scrollIntoView: mockScrollToBottom,
    },
  }),
}));


describe('ChatModal Component', () => {
  const mockOpportunity = {
    _id: new ObjectId().toString(), // Use ObjectId for ID consistency
    title: 'Test Opportunity',
    companyName: 'Test Co',
  };
  const mockUser = {
    _id: new ObjectId().toString(), // Use ObjectId
    name: 'Test User',
  };

  beforeEach(() => {
    axios.get.mockResolvedValue({ data: [] });
    axios.post.mockResolvedValue({ data: {} });
    jest.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(
      <ChatModal
        isOpen={true}
        onClose={jest.fn()}
        opportunity={mockOpportunity}
        currentUser={mockUser}
        isCompany={false}
      />
    );
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText(`Chat for ${mockOpportunity.title}`)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <ChatModal
        isOpen={false}
        onClose={jest.fn()}
        opportunity={mockOpportunity}
        currentUser={mockUser}
        isCompany={false}
      />
    );
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('fetches messages when opened with a valid opportunity ID', async () => {
    const messages = [
      { _id: new ObjectId().toString(), senderId: mockUser._id, senderType: 'user', message: 'Hello', timestamp: new Date().toISOString() },
    ];
    axios.get.mockResolvedValueOnce({ data: messages });

    render(
      <ChatModal
        isOpen={true}
        onClose={jest.fn()}
        opportunity={mockOpportunity}
        currentUser={mockUser}
        isCompany={false}
      />
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`/api/chat/messages?opportunityId=${mockOpportunity._id}`);
    });
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('displays "No messages yet" when no messages are fetched', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    render(
      <ChatModal
        isOpen={true}
        onClose={jest.fn()}
        opportunity={mockOpportunity}
        currentUser={mockUser}
        isCompany={false}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('No messages yet.')).toBeInTheDocument();
    });
  });

  it('allows typing a new message', () => {
    render(
      <ChatModal
        isOpen={true}
        onClose={jest.fn()}
        opportunity={mockOpportunity}
        currentUser={mockUser}
        isCompany={false}
      />
    );
    const textarea = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(textarea, { target: { value: 'New test message' } });
    expect(textarea.value).toBe('New test message');
  });

  it('sends a message when send button is clicked', async () => {
    const newMessageText = 'New test message';
    const sentMessage = {
        _id: new ObjectId().toString(),
        opportunityId: mockOpportunity._id,
        senderId: mockUser._id,
        senderType: 'user',
        message: newMessageText,
        timestamp: new Date().toISOString()
    };
    axios.post.mockResolvedValueOnce({ data: sentMessage });

    render(
      <ChatModal
        isOpen={true}
        onClose={jest.fn()}
        opportunity={mockOpportunity}
        currentUser={mockUser}
        isCompany={false}
      />
    );

    const textarea = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(textarea, { target: { value: newMessageText } });

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/chat/messages', {
        opportunityId: mockOpportunity._id,
        senderId: mockUser._id,
        senderType: 'user',
        message: newMessageText,
      });
    });
    // Check if the message appears in the chat
    expect(screen.getByText(newMessageText)).toBeInTheDocument();
    // Textarea should be cleared
    expect(textarea.value).toBe('');
  });

  it('sends a message when Enter key is pressed (without Shift)', async () => {
    const newMessageText = 'Message with Enter';
     const sentMessage = {
        _id: new ObjectId().toString(),
        opportunityId: mockOpportunity._id,
        senderId: mockUser._id,
        senderType: 'user',
        message: newMessageText,
        timestamp: new Date().toISOString()
    };
    axios.post.mockResolvedValueOnce({ data: sentMessage });

    render(
      <ChatModal
        isOpen={true}
        onClose={jest.fn()}
        opportunity={mockOpportunity}
        currentUser={mockUser}
        isCompany={false}
      />
    );

    const textarea = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(textarea, { target: { value: newMessageText } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: false });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/chat/messages', {
        opportunityId: mockOpportunity._id,
        senderId: mockUser._id,
        senderType: 'user',
        message: newMessageText,
      });
    });
    expect(screen.getByText(newMessageText)).toBeInTheDocument();
    expect(textarea.value).toBe('');
  });

  it('does not send message with Enter if Shift key is pressed', () => {
    render(
      <ChatModal
        isOpen={true}
        onClose={jest.fn()}
        opportunity={mockOpportunity}
        currentUser={mockUser}
        isCompany={false}
      />
    );
    const textarea = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(textarea, { target: { value: 'Test' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: true });
    expect(axios.post).not.toHaveBeenCalled();
  });


  it('displays messages from user and organization correctly', async () => {
    const companySenderId = new ObjectId().toString();
    const messages = [
      { _id: new ObjectId().toString(), senderId: mockUser._id, senderType: 'user', message: 'User message', timestamp: new Date().toISOString() },
      { _id: new ObjectId().toString(), senderId: companySenderId, senderType: 'organization', message: 'Org message', timestamp: new Date().toISOString() },
    ];
    axios.get.mockResolvedValueOnce({ data: messages });

    render(
      <ChatModal
        isOpen={true}
        onClose={jest.fn()}
        opportunity={mockOpportunity}
        currentUser={mockUser} // Current user is the 'user'
        isCompany={false} // Viewing as a normal user
      />
    );

    await waitFor(() => {
      expect(screen.getByText('User message')).toBeInTheDocument();
    });
    expect(screen.getByText('Org message')).toBeInTheDocument();

    // Check sender names (approximated, actual display might vary based on logic)
    // 'You' for the current user's messages
    const userMessages = screen.getAllByText((content, element) => {
        const hasText = (node) => node.textContent === "You";
        const elementHasText = hasText(element);
        const childrenDontHaveText = Array.from(element.children).every(
          (child) => !hasText(child)
        );
        return elementHasText && childrenDontHaveText;
      });
    expect(userMessages.length).toBeGreaterThanOrEqual(1); // At least one "You"

    // Company name for organization messages
    expect(screen.getByText(mockOpportunity.companyName)).toBeInTheDocument();
  });

  it('displays error message if fetching messages fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch'));
    render(
      <ChatModal
        isOpen={true}
        onClose={jest.fn()}
        opportunity={mockOpportunity}
        currentUser={mockUser}
        isCompany={false}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Failed to load messages. Please try again.')).toBeInTheDocument();
    });
  });

  it('displays error message if sending message fails', async () => {
    axios.post.mockRejectedValueOnce(new Error('Failed to send'));
    render(
      <ChatModal
        isOpen={true}
        onClose={jest.fn()}
        opportunity={mockOpportunity}
        currentUser={mockUser}
        isCompany={false}
      />
    );
    const textarea = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(textarea, { target: { value: 'Test message' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to send message. Please try again.')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    render(
      <ChatModal
        isOpen={true}
        onClose={mockOnClose}
        opportunity={mockOpportunity}
        currentUser={mockUser}
        isCompany={false}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('scrolls to bottom when new messages are added', async () => {
     const initialMessages = [
      { _id: new ObjectId().toString(), senderId: 'otherUser', senderType: 'user', message: 'Old message', timestamp: new Date().toISOString() },
    ];
    axios.get.mockResolvedValueOnce({ data: initialMessages });

    const newMessageText = 'Latest message';
    const sentMessage = {
        _id: new ObjectId().toString(),
        opportunityId: mockOpportunity._id,
        senderId: mockUser._id,
        senderType: 'user',
        message: newMessageText,
        timestamp: new Date().toISOString()
    };
    axios.post.mockResolvedValueOnce({ data: sentMessage });


    render(
      <ChatModal
        isOpen={true}
        onClose={jest.fn()}
        opportunity={mockOpportunity}
        currentUser={mockUser}
        isCompany={false}
      />
    );

    // Wait for initial messages to load
    await waitFor(() => expect(screen.getByText('Old message')).toBeInTheDocument());
    mockScrollToBottom.mockClear(); // Clear calls from initial load

    // Send a new message
    const textarea = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(textarea, { target: { value: newMessageText } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => expect(screen.getByText(newMessageText)).toBeInTheDocument());
    expect(mockScrollToBottom).toHaveBeenCalled();
  });

});
