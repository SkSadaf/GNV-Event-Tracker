const React = require('react');
const { render, screen, fireEvent, waitFor, act } = require('@testing-library/react');

window.alert = jest.fn();

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}), { virtual: true });

jest.mock('axios', () => ({
  post: jest.fn()
}));

const axios = require('axios');

const Login = require('./Login').default;

describe('Login Component Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    window.alert.mockClear();
  });

  // Unit test 1: Test basic rendering of component elements
  test('renders login form elements correctly', () => {
    render(<Login />);
    
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Login');
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  // Unit test 2: Test input handlers work correctly
  test('handles input changes correctly', () => {
    render(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(passwordInput.value).toBe('password123');
  });

  // Unit test 3: Test loading state during submission
  test('shows loading state during form submission', async () => {
    axios.post.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({ 
          data: { name: 'John Doe', user_id: '123' } 
        }), 100)
      )
    );
    
    render(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    await act(async () => {
      fireEvent.click(submitButton);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByText('Logging in...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
  });

  // Unit test 4: Test successful API call handling
  test('handles successful API response correctly', async () => {
    const mockResponse = { 
      data: { 
        name: 'John Doe', 
        user_id: '123' 
      } 
    };
    axios.post.mockResolvedValue(mockResponse);  
    const localStorageMock = jest.spyOn(Storage.prototype, 'setItem');

    render(<Login />);
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/LoginUser',
        { email: 'test@example.com', password: 'password123' },
        { headers: { 'Content-Type': 'application/json' } }
      );
    });
    
    expect(localStorageMock).toHaveBeenCalledWith('userId', '123');    
    expect(window.alert).toHaveBeenCalledWith('Welcome John Doe!');    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');    
    localStorageMock.mockRestore();
  });

  // Unit test 5: Test error handling with API error response
  test('handles API error response correctly', async () => {
    const errorMessage = 'Invalid credentials';
    axios.post.mockRejectedValue({
      response: {
        data: {
          error: errorMessage
        }
      }
    });
    
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<Login />);
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => {     
      expect(consoleErrorMock).toHaveBeenCalled();    
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByRole('button')).not.toBeDisabled();
      expect(screen.getByRole('button')).toHaveTextContent('Login');
    });
    
    consoleErrorMock.mockRestore();
  });

  // Unit test 6: Test error handling with network error
  test('handles network error correctly', async () => {
    axios.post.mockRejectedValue({ message: 'Network Error' });
    
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<Login />);
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(consoleErrorMock).toHaveBeenCalled();
      expect(screen.getByText('An error occurred while logging in. Please try again later.')).toBeInTheDocument();
    });
    
    consoleErrorMock.mockRestore();
  });

  // Unit test 7: Test button state management
  test('manages button state correctly during submission flow', async () => {
    axios.post.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({ 
          data: { name: 'John Doe', user_id: '123' } 
        }), 100)
      )
    );
    
    render(<Login />);
    
    const submitButton = screen.getByRole('button');

    expect(submitButton).not.toBeDisabled();
    expect(submitButton).toHaveTextContent('Login');
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByRole('button')).toHaveTextContent('Logging in...');
    });
    
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
  });
});
