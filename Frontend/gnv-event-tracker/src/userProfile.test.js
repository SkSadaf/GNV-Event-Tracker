import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import UserProfile from './UserProfile';
import '@testing-library/jest-dom';

jest.setTimeout(10000);

global.fetch = jest.fn();
window.alert = jest.fn();
window.confirm = jest.fn();

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useParams: () => ({ userId: '123' }),
  useLocation: () => ({
    state: null
  }),
  useNavigate: () => mockNavigate
}), { virtual: true });

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('UserProfile Unit Tests', () => {
  const mockUserData = {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockImplementation((url, options) => {
      if (url.includes('/user/123')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUserData)
        });
      }
      if (url.includes('/editUser/123') && options && options.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ...mockUserData, ...JSON.parse(options.body) })
        });
      }
      if (url.includes('/users/123') && options && options.method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({})
        });
      }
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "API endpoint not mocked" })
      });
    });
   
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'userId') return '123';
      return null;
    });
  });

  // Unit test 1: Test basic rendering of component elements
  test('renders user profile elements correctly', async () => {
    render(<UserProfile />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    expect(screen.getByText('User Details')).toBeInTheDocument();
    expect(screen.getByText('Name:')).toBeInTheDocument();
    expect(screen.getByText('Email:')).toBeInTheDocument();
    expect(screen.getByText('Password:')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByText('Delete Profile')).toBeInTheDocument();
  });

  // Unit test 2: Test password visibility toggle
  test('toggles password visibility correctly', async () => {
    render(<UserProfile />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    const passwordField = screen.getByText('Password:').closest('.profile-field');
    const passwordDisplay = passwordField.querySelector('.password-display');
    const passwordSpan = passwordDisplay.querySelector('span:first-child');

    expect(passwordSpan.textContent.startsWith('•')).toBe(true);

    const eyeButton = passwordDisplay.querySelector('.eye-icon');

    fireEvent.click(eyeButton);
    
    expect(screen.getByText('password123')).toBeInTheDocument();
    fireEvent.click(eyeButton);
    expect(passwordSpan.textContent.startsWith('•')).toBe(true);
  });

  // Unit test 3: Test edit mode toggle
  test('toggles edit mode correctly', async () => {
    render(<UserProfile />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    
    const editButton = screen.getByText('Edit Profile');
    fireEvent.click(editButton);

    const nameInput = screen.getByDisplayValue('Test User');
    const emailInput = screen.getByDisplayValue('test@example.com');
    
    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  // Unit test 4: Test form input handling
  test('handles form input changes correctly', async () => {
    render(<UserProfile />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    fireEvent.click(screen.getByText('Edit Profile'));
    
    const nameInput = screen.getByDisplayValue('Test User');
    const emailInput = screen.getByDisplayValue('test@example.com');
    const passwordInput = screen.getByDisplayValue('password123');
    
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    fireEvent.change(emailInput, { target: { value: 'updated@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'newpassword' } });
    
    expect(nameInput.value).toBe('Updated Name');
    expect(emailInput.value).toBe('updated@example.com');
    expect(passwordInput.value).toBe('newpassword');
  });

  // Unit test 5: Test successful profile update
  test('handles successful profile update correctly', async () => {
    render(<UserProfile />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    fireEvent.click(screen.getByText('Edit Profile'));
    
    const nameInput = screen.getByDisplayValue('Test User');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    
    fireEvent.click(screen.getByText('Save'));
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:8080/editUser/123', expect.objectContaining({
        method: 'PUT',
        body: expect.stringContaining('Updated Name')
      }));
    });
    
    expect(window.alert).toHaveBeenCalledWith('Profile updated successfully!');
  });

  // Unit test 6: Test profile update error handling
  test('handles profile update errors correctly', async () => {
    fetch.mockImplementation((url, options) => {
      if (url.includes('/user/123')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUserData)
        });
      }
      if (url.includes('/editUser/123') && options.method === 'PUT') {
        return Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: 'Update failed' })
        });
      }
      return Promise.reject(new Error('not found'));
    });
    
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<UserProfile />);
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    fireEvent.click(screen.getByText('Edit Profile'));
    fireEvent.click(screen.getByText('Save'));
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Failed to update profile'));
    });
    
    consoleErrorSpy.mockRestore();
  });

  // Unit test 7: Test profile deletion flow
  test('handles profile deletion correctly', async () => {
    window.confirm.mockReturnValue(true);
    
    render(<UserProfile />);
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    fireEvent.click(screen.getByText('Delete Profile'));

    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('Are you sure you want to delete your profile?'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:8080/users/123', {
        method: 'DELETE',
      });
    });
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('userId');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(window.alert).toHaveBeenCalledWith('Profile deleted successfully');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  // Unit test 8: Test canceling profile deletion
  test('respects user cancellation of profile deletion', async () => {
    window.confirm.mockReturnValue(false);
    
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    fireEvent.click(screen.getByText('Delete Profile'));
    expect(window.confirm).toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalledWith('http://localhost:8080/users/123', {
      method: 'DELETE',
    });
    
    expect(localStorageMock.removeItem).not.toHaveBeenCalled();
  });

  // Unit test 9: Test loading state handling
  test('shows loading state when data is being fetched', async () => {
    fetch.mockImplementationOnce((url) => {
      if (url.includes('/user/123')) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve(mockUserData)
            });
          }, 50);
        });
      }
      return Promise.reject(new Error('not found'));
    });
    
    render(<UserProfile />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
        
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByText('User Details')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});