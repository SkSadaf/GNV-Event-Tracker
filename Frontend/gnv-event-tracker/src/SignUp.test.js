const React = require('react');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');

window.alert = jest.fn();

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}), { virtual: true });

global.fetch = jest.fn();

const SignUp = require('./SignUp').default;

describe('SignUp Component Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // Unit test 1: Test basic rendering of component elements
  test('renders signup form elements correctly', () => {
    render(<SignUp />);
    
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Sign Up');
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  // Unit test 2: Test input handlers work correctly
  test('handles input changes correctly', () => {
    render(<SignUp />);
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    expect(nameInput.value).toBe('John Doe');
    
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    expect(emailInput.value).toBe('john@example.com');
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(passwordInput.value).toBe('password123');
  });

  // Unit test 3: Test API call is made with correct data
  test('makes API call with correct data on form submission', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'User registered successfully' })
    });
    
    render(<SignUp />);
    
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/register',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
          }),
        })
      );
    });
  });

  // Unit test 4: Test successful registration handling
  test('handles successful registration correctly', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'User registered successfully' })
    });
    
    render(<SignUp />);
    
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    await waitFor(() => {
      expect(screen.getByText('You have successfully signed up!')).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText(/name/i).value).toBe('');
    expect(screen.getByLabelText(/email/i).value).toBe('');
    expect(screen.getByLabelText(/password/i).value).toBe('');
    
    jest.advanceTimersByTime(2000);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  // Unit test 5: Test error handling with API error
  test('handles API error response correctly', async () => {
    const errorMessage = 'User with this email already exists. Try another email';
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage })
    });
    
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<SignUp />);
    
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(consoleErrorMock).toHaveBeenCalled();
    });
    
    consoleErrorMock.mockRestore();
  });

  // Unit test 6: Test error handling with network error
  test('handles network error correctly', async () => {
    const networkError = new Error('Network error');
    global.fetch.mockRejectedValueOnce(networkError);
    
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<SignUp />);
    
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(consoleErrorMock).toHaveBeenCalledWith('Signup error:', networkError);
    });
    
    consoleErrorMock.mockRestore();
  });

  // Unit test 7: Test message state clearing on form submission
  test('clears error and message states on form submission', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Error message' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' })
      });

    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<SignUp />);
    
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    await waitFor(() => {
      expect(screen.queryByText('Error message')).not.toBeInTheDocument();
      expect(screen.getByText('You have successfully signed up!')).toBeInTheDocument();
    });
    
    consoleErrorMock.mockRestore();
  });
});
