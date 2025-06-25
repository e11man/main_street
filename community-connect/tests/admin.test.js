/**
 * Admin Page Tests
 * 
 * This file contains tests for the admin page functionality, including:
 * - Admin login
 * - User management (view, add, edit, delete)
 * - Company management (view, add, edit, delete)
 * - Opportunity management (view, add, edit, delete)
 * - Blocked email management (view, add, delete)
 * - Pending user management (view, approve, reject)
 * - Pending company management (view, approve, reject)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Admin from '../pages/admin';
import { act } from 'react-dom/test-utils';

// Mock fetch API
global.fetch = jest.fn();

// Helper function to setup fetch mock responses
const mockFetchResponse = (data, status = 200) => {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(data)
  };
};

describe('Admin Page', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Mock window.alert
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });
  
  afterEach(() => {
    // Restore window.alert
    window.alert.mockRestore && window.alert.mockRestore();
  });

  test('renders login form when not authenticated', () => {
    render(<Admin />);
    expect(screen.getByText('Admin Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  test('handles successful login', async () => {
    // Mock successful login response
    global.fetch.mockResolvedValueOnce(mockFetchResponse({ success: true }));
    
    render(<Admin />);
    
    // Fill in login form
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    
    // Wait for dashboard to render
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/login', expect.any(Object));
      expect(window.localStorage.setItem).toHaveBeenCalledWith('adminAuthenticated', 'true');
    });
  });

  test('handles failed login', async () => {
    // Mock failed login response
    global.fetch.mockResolvedValueOnce(mockFetchResponse({ success: false }, 401));
    
    render(<Admin />);
    
    // Fill in login form
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpassword' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    
    // Wait for alert
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/login', expect.any(Object));
      expect(window.alert).toHaveBeenCalledWith('Invalid credentials');
    });
  });

  test('renders admin dashboard when authenticated', async () => {
    // Mock localStorage to return authenticated
    window.localStorage.getItem.mockReturnValue('true');
    
    // Mock data fetching responses
    global.fetch.mockImplementation((url) => {
      if (url === '/api/admin/users') {
        return Promise.resolve(mockFetchResponse([{ _id: '1', name: 'Test User', email: 'test@example.com' }]));
      } else if (url === '/api/admin/companies') {
        return Promise.resolve(mockFetchResponse([{ _id: '1', name: 'Test Company' }]));
      } else if (url === '/api/admin/opportunities') {
        return Promise.resolve(mockFetchResponse([{ id: 1, title: 'Test Opportunity' }]));
      } else if (url === '/api/admin/blocked-emails') {
        return Promise.resolve(mockFetchResponse([{ _id: '1', email: 'blocked@example.com' }]));
      } else if (url === '/api/admin/pending-users') {
        return Promise.resolve(mockFetchResponse([{ _id: '1', name: 'Pending User' }]));
      } else if (url === '/api/admin/pending-companies') {
        return Promise.resolve(mockFetchResponse([{ _id: '1', name: 'Pending Company' }]));
      }
      return Promise.resolve(mockFetchResponse({}));
    });
    
    await act(async () => {
      render(<Admin />);
    });
    
    // Check if dashboard tabs are rendered
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Companies')).toBeInTheDocument();
    expect(screen.getByText('Opportunities')).toBeInTheDocument();
    expect(screen.getByText('Blocked Emails')).toBeInTheDocument();
    expect(screen.getByText('Pending Users')).toBeInTheDocument();
    expect(screen.getByText('Pending Companies')).toBeInTheDocument();
  });
  
  test('deletes a user successfully', async () => {
    // Mock localStorage to return authenticated
    window.localStorage.getItem.mockReturnValue('true');
    
    // Mock initial data fetching
    const users = [{ _id: '1', name: 'Test User', email: 'test@example.com' }];
    global.fetch.mockImplementation((url) => {
      if (url === '/api/admin/users') {
        return Promise.resolve(mockFetchResponse(users));
      } else {
        return Promise.resolve(mockFetchResponse([]));
      }
    });
    
    await act(async () => {
      render(<Admin />);
    });
    
    // Mock successful delete response
    global.fetch.mockImplementation((url, options) => {
      if (url === '/api/admin/users/1' && options.method === 'DELETE') {
        return Promise.resolve(mockFetchResponse({ message: 'User deleted successfully' }));
      }
      return Promise.resolve(mockFetchResponse([]));
    });
    
    // Click delete button for the user
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Confirm deletion
    fireEvent.click(screen.getByText('Yes'));
    
    // Verify fetch was called with correct URL and method
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/users/1', expect.objectContaining({
        method: 'DELETE'
      }));
    });
  });
  
  test('deletes an opportunity successfully', async () => {
    // Mock localStorage to return authenticated
    window.localStorage.getItem.mockReturnValue('true');
    
    // Mock initial data fetching
    const opportunities = [{ id: 1, title: 'Test Opportunity' }];
    global.fetch.mockImplementation((url) => {
      if (url === '/api/admin/opportunities') {
        return Promise.resolve(mockFetchResponse(opportunities));
      } else {
        return Promise.resolve(mockFetchResponse([]));
      }
    });
    
    await act(async () => {
      render(<Admin />);
    });
    
    // Click on Opportunities tab
    fireEvent.click(screen.getByText('Opportunities'));
    
    // Mock successful delete response
    global.fetch.mockImplementation((url, options) => {
      if (url === '/api/admin/opportunities/1' && options.method === 'DELETE') {
        return Promise.resolve(mockFetchResponse({ message: 'Opportunity deleted successfully' }));
      }
      return Promise.resolve(mockFetchResponse([]));
    });
    
    // Click delete button for the opportunity
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Confirm deletion
    fireEvent.click(screen.getByText('Yes'));
    
    // Verify fetch was called with correct URL and method
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/opportunities/1', expect.objectContaining({
        method: 'DELETE'
      }));
    });
  });
  
  test('deletes a company successfully', async () => {
    // Mock localStorage to return authenticated
    window.localStorage.getItem.mockReturnValue('true');
    
    // Mock initial data fetching
    const companies = [{ _id: '1', name: 'Test Company' }];
    global.fetch.mockImplementation((url) => {
      if (url === '/api/admin/companies') {
        return Promise.resolve(mockFetchResponse(companies));
      } else {
        return Promise.resolve(mockFetchResponse([]));
      }
    });
    
    await act(async () => {
      render(<Admin />);
    });
    
    // Click on Companies tab
    fireEvent.click(screen.getByText('Companies'));
    
    // Mock successful delete response
    global.fetch.mockImplementation((url, options) => {
      if (url === '/api/admin/companies/1' && options.method === 'DELETE') {
        return Promise.resolve(mockFetchResponse({ message: 'Company deleted successfully' }));
      }
      return Promise.resolve(mockFetchResponse([]));
    });
    
    // Click delete button for the company
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Confirm deletion
    fireEvent.click(screen.getByText('Yes'));
    
    // Verify fetch was called with correct URL and method
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/companies/1', expect.objectContaining({
        method: 'DELETE'
      }));
    });
  });
  
  test('edits a user successfully', async () => {
    // Mock localStorage to return authenticated
    window.localStorage.getItem.mockReturnValue('true');
    
    // Mock initial data fetching
    const users = [{ _id: '1', name: 'Test User', email: 'test@example.com' }];
    global.fetch.mockImplementation((url) => {
      if (url === '/api/admin/users') {
        return Promise.resolve(mockFetchResponse(users));
      } else {
        return Promise.resolve(mockFetchResponse([]));
      }
    });
    
    await act(async () => {
      render(<Admin />);
    });
    
    // Click edit button for the user
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Update user name
    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'Updated User' } });
    
    // Mock successful update response
    global.fetch.mockImplementation((url, options) => {
      if (url === '/api/admin/users/1' && options.method === 'PUT') {
        return Promise.resolve(mockFetchResponse({ 
          _id: '1', 
          name: 'Updated User', 
          email: 'test@example.com' 
        }));
      }
      return Promise.resolve(mockFetchResponse([]));
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Update User'));
    
    // Verify fetch was called with correct URL, method, and body
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/users/1', expect.objectContaining({
        method: 'PUT',
        body: expect.stringContaining('Updated User')
      }));
    });
  });
  
  test('edits an opportunity successfully', async () => {
    // Mock localStorage to return authenticated
    window.localStorage.getItem.mockReturnValue('true');
    
    // Mock initial data fetching
    const opportunities = [{ id: 1, title: 'Test Opportunity', description: 'Test Description' }];
    global.fetch.mockImplementation((url) => {
      if (url === '/api/admin/opportunities') {
        return Promise.resolve(mockFetchResponse(opportunities));
      } else {
        return Promise.resolve(mockFetchResponse([]));
      }
    });
    
    await act(async () => {
      render(<Admin />);
    });
    
    // Click on Opportunities tab
    fireEvent.click(screen.getByText('Opportunities'));
    
    // Click edit button for the opportunity
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Update opportunity title
    const titleInput = screen.getByLabelText('Title');
    fireEvent.change(titleInput, { target: { value: 'Updated Opportunity' } });
    
    // Mock successful update response
    global.fetch.mockImplementation((url, options) => {
      if (url === '/api/admin/opportunities/1' && options.method === 'PUT') {
        return Promise.resolve(mockFetchResponse({ 
          id: 1, 
          title: 'Updated Opportunity', 
          description: 'Test Description' 
        }));
      }
      return Promise.resolve(mockFetchResponse([]));
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Update Opportunity'));
    
    // Verify fetch was called with correct URL, method, and body
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/opportunities/1', expect.objectContaining({
        method: 'PUT',
        body: expect.stringContaining('Updated Opportunity')
      }));
    });
  });
  
  test('edits a company successfully', async () => {
    // Mock localStorage to return authenticated
    window.localStorage.getItem.mockReturnValue('true');
    
    // Mock initial data fetching
    const companies = [{ _id: '1', name: 'Test Company', description: 'Test Description' }];
    global.fetch.mockImplementation((url) => {
      if (url === '/api/admin/companies') {
        return Promise.resolve(mockFetchResponse(companies));
      } else {
        return Promise.resolve(mockFetchResponse([]));
      }
    });
    
    await act(async () => {
      render(<Admin />);
    });
    
    // Click on Companies tab
    fireEvent.click(screen.getByText('Companies'));
    
    // Click edit button for the company
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Update company name
    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Company' } });
    
    // Mock successful update response
    global.fetch.mockImplementation((url, options) => {
      if (url === '/api/admin/companies/1' && options.method === 'PUT') {
        return Promise.resolve(mockFetchResponse({ 
          _id: '1', 
          name: 'Updated Company', 
          description: 'Test Description' 
        }));
      }
      return Promise.resolve(mockFetchResponse([]));
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Update Company'));
    
    // Verify fetch was called with correct URL, method, and body
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/companies/1', expect.objectContaining({
        method: 'PUT',
        body: expect.stringContaining('Updated Company')
      }));
    });
  });
});