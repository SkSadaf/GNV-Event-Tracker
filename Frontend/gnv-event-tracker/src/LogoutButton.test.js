const React = require('react');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');

jest.mock('axios', () => ({
  post: jest.fn()
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}), { virtual: true });

jest.mock('./AuthContext', () => ({
  useAuth: () => ({
    logout: mockLogout
  })
}), { virtual: true });

// Set up mocks
const axios = require('axios');
const mockNavigate = jest.fn();
const mockLogout = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    length: 0,
    key: jest.fn()
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock alert
window.alert = jest.fn();

const LogoutButton = require('./LogoutButton').default;

describe('LogoutButton Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('123'); // Mock userId in localStorage
  });

  // Test 1: Test button renders correctly
  test('renders logout button correctly', () => {
    render(<LogoutButton />);
    
    const logoutButton = screen.getByRole('button', { name: /log out/i });
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveClass('logout-button');
  });

  // Test 2: Test successful logout flow
  test('handles successful logout correctly', async () => {
    const mockResponse = {
      data: {
        message: 'logged out successfully',
        name: 'John Doe'
      }
    };
    axios.post.mockResolvedValue(mockResponse);
    
    render(<LogoutButton />);
    
    const logoutButton = screen.getByRole('button', { name: /log out/i });
    fireEvent.click(logoutButton);
    

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/logout/123',
        {},
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_id');

      expect(mockLogout).toHaveBeenCalled();
      
      expect(window.alert).toHaveBeenCalledWith('John Doe logged out successfully');
      

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('handles errors during logout correctly', async () => {
    const errorMsg = 'Network Error';
    axios.post.mockRejectedValue(new Error(errorMsg));
    
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<LogoutButton />);
    
    const logoutButton = screen.getByRole('button', { name: /log out/i });
    fireEvent.click(logoutButton);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy.mock.calls[0][0]).toBe('Error logging out:');
      
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(window.alert).not.toHaveBeenCalled();
    });
    
    consoleErrorSpy.mockRestore();
  });

  // Test 4: Test behavior when userId is not in localStorage
  test('handles missing userId correctly', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<LogoutButton />);
    
    const logoutButton = screen.getByRole('button', { name: /log out/i });
    fireEvent.click(logoutButton);
    

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('User ID not found in localStorage');
      
      expect(axios.post).not.toHaveBeenCalled();
      
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(window.alert).not.toHaveBeenCalled();
    });
    
    consoleErrorSpy.mockRestore();
  });

  // Test 5: Test that the exact data structure from API is handled correctly
  test('processes API response correctly', async () => {
    const mockResponse = {
      data: {
        message: 'logged out successfully',
        name: 'John Doe'
      }
    };
    axios.post.mockResolvedValue(mockResponse);
    
    render(<LogoutButton />);
    const logoutButton = screen.getByRole('button', { name: /log out/i });
    fireEvent.click(logoutButton);
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('John Doe logged out successfully');
    });
  });

  // Test 6: Test that button click triggers the logout function
  test('clicking button triggers the handleLogout function', () => {
    render(<LogoutButton />);
    
    const logoutButton = screen.getByRole('button', { name: /log out/i });
    

    expect(logoutButton).not.toBeDisabled();
    
    fireEvent.click(logoutButton);
    
    expect(axios.post).toHaveBeenCalled();
  });
});