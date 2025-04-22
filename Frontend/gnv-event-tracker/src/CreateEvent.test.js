const React = require('react');
const { render, screen, fireEvent, waitFor, act } = require('@testing-library/react');

window.alert = jest.fn();

jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn()
}));

const axios = require('axios');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}), { virtual: true });

jest.mock('./UserContext', () => ({
  useUser: () => ({ userId: '123' })
}));

const CreateEvent = require('./CreateEvent').default;

describe('CreateEvent Component Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert.mockClear();
  });

  // Unit test 1: Test basic rendering of component elements
  test('renders create event form with all input fields', () => {
    render(<CreateEvent />);
       
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Create New Event');
    expect(screen.getByLabelText(/event name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/google maps link/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/maximum participants/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cost/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/website/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create event/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add tag/i })).toBeInTheDocument();
  });

  // Unit test 2: Test form input change handlers
  test('handles form input changes correctly', () => {
    render(<CreateEvent />);
    
    const nameInput = screen.getByLabelText(/event name/i);
    fireEvent.change(nameInput, { target: { value: 'Tech Conference' } });
    expect(nameInput.value).toBe('Tech Conference');
    
    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: 'A conference about technology' } });
    expect(descriptionInput.value).toBe('A conference about technology');
    
    const dateInput = screen.getByLabelText(/date/i);
    fireEvent.change(dateInput, { target: { value: '2025-12-25' } });
    expect(dateInput.value).toBe('2025-12-25');
    
    const timeInput = screen.getByLabelText(/time/i);
    fireEvent.change(timeInput, { target: { value: '14:30' } });
    expect(timeInput.value).toBe('14:30');
    
    const locationInput = screen.getByLabelText(/location/i);
    fireEvent.change(locationInput, { target: { value: 'Convention Center' } });
    expect(locationInput.value).toBe('Convention Center');
    
    const participantsInput = screen.getByLabelText(/maximum participants/i);
    fireEvent.change(participantsInput, { target: { value: '100' } });
    expect(participantsInput.value).toBe('100');
    
    const costInput = screen.getByLabelText(/cost/i);
    fireEvent.change(costInput, { target: { value: '49.99' } });
    expect(costInput.value).toBe('49.99');
    
    const categoryInput = screen.getByLabelText(/category/i);
    fireEvent.change(categoryInput, { target: { value: 'education' } });
    expect(categoryInput.value).toBe('education');
  });

  // Unit test 3: Test tag addition functionality
  test('handles adding tags correctly', () => {
    render(<CreateEvent />);
    
    const tagInput = screen.getByLabelText(/tags/i);
    const addTagButton = screen.getByRole('button', { name: /add tag/i });
    
    fireEvent.change(tagInput, { target: { value: 'technology' } });
    fireEvent.click(addTagButton);
    
    expect(screen.getByText('technology')).toBeInTheDocument();
    expect(tagInput.value).toBe('');
    
    fireEvent.change(tagInput, { target: { value: 'conference' } });
    fireEvent.click(addTagButton);
    
    expect(screen.getByText('technology')).toBeInTheDocument();
    expect(screen.getByText('conference')).toBeInTheDocument();
  });

  // Unit test 4: Test tag removal functionality
  test('handles removing tags correctly', () => {
    render(<CreateEvent />);
    
    const tagInput = screen.getByLabelText(/tags/i);
    const addTagButton = screen.getByRole('button', { name: /add tag/i });
    
    fireEvent.change(tagInput, { target: { value: 'technology' } });
    fireEvent.click(addTagButton);
    
    fireEvent.change(tagInput, { target: { value: 'conference' } });
    fireEvent.click(addTagButton);
 
    expect(screen.getByText('technology')).toBeInTheDocument();
    expect(screen.getByText('conference')).toBeInTheDocument();
    
    const removeButtons = screen.getAllByRole('button', { name: '×' });
    fireEvent.click(removeButtons[0]);
    
    expect(screen.queryByText('technology')).not.toBeInTheDocument();
    expect(screen.getByText('conference')).toBeInTheDocument();
  });

  // Unit test 5: Test duplicate tag prevention
  test('prevents adding duplicate tags', () => {
    render(<CreateEvent />);
    
    const tagInput = screen.getByLabelText(/tags/i);
    const addTagButton = screen.getByRole('button', { name: /add tag/i });
    
    fireEvent.change(tagInput, { target: { value: 'technology' } });
    fireEvent.click(addTagButton);
    
    fireEvent.change(tagInput, { target: { value: 'technology' } });
    fireEvent.click(addTagButton);
    
    const tagElements = screen.getAllByText('technology');
    expect(tagElements.length).toBe(1);
  });

  // Unit test 6: Test form cancellation
  test('navigates to dashboard when cancel button is clicked', () => {
    render(<CreateEvent />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  // Unit test 7: Test successful event creation
  test('handles successful event creation correctly', async () => {
    axios.post.mockResolvedValueOnce({ data: { id: 1 } });
    
    render(<CreateEvent />);
    
    fireEvent.change(screen.getByLabelText(/event name/i), { target: { value: 'Tech Conference' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Description' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2025-12-25' } });
    fireEvent.change(screen.getByLabelText(/time/i), { target: { value: '14:30' } });
    fireEvent.change(screen.getByLabelText(/location/i), { target: { value: 'Convention Center' } });
    fireEvent.change(screen.getByLabelText(/google maps link/i), { target: { value: 'https://maps.google.com/123' } });
    fireEvent.change(screen.getByLabelText(/maximum participants/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/cost/i), { target: { value: '49.99' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'education' } });
    fireEvent.change(screen.getByLabelText(/tags/i), { target: { value: 'technology' } });
    fireEvent.click(screen.getByRole('button', { name: /add tag/i }));
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /create event/i }));
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:8080/CreateEvent',
      expect.objectContaining({
        name: 'Tech Conference',
        description: 'Description',
        date: '2025-12-25',
        time: '14:30',
        location: 'Convention Center',
        google_maps_link: 'https://maps.google.com/123',
        max_participants: 100,
        cost: 49.99,
        category: 'education',
        tags: 'technology',
        organizer_id: 123
      }),
      expect.any(Object)
    );
    
    expect(window.alert).toHaveBeenCalledWith('Event created successfully!');
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  // Unit test 8: Test loading state during submission
  test('shows loading state during form submission', async () => {
    axios.post.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: { id: 1 } }), 100))
    );
    
    render(<CreateEvent />);
    
    fireEvent.change(screen.getByLabelText(/event name/i), { target: { value: 'Event' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Description' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2025-12-25' } });
    fireEvent.change(screen.getByLabelText(/time/i), { target: { value: '14:30' } });
    fireEvent.change(screen.getByLabelText(/location/i), { target: { value: 'Location' } });
    fireEvent.change(screen.getByLabelText(/google maps link/i), { target: { value: 'https://maps.google.com/123' } });
    fireEvent.change(screen.getByLabelText(/maximum participants/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'sports' } });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /create event/i }));
    });
    
    expect(screen.getByRole('button', { name: /creating/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
  });

  // Unit test 9: Test error handling
  test('handles API errors correctly', async () => {
    axios.post.mockRejectedValueOnce(new Error('API Error'));
    
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(<CreateEvent />);
    
    fireEvent.change(screen.getByLabelText(/event name/i), { target: { value: 'Event' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Description' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2025-12-25' } });
    fireEvent.change(screen.getByLabelText(/time/i), { target: { value: '14:30' } });
    fireEvent.change(screen.getByLabelText(/location/i), { target: { value: 'Location' } });
    fireEvent.change(screen.getByLabelText(/google maps link/i), { target: { value: 'https://maps.google.com/123' } });
    fireEvent.change(screen.getByLabelText(/maximum participants/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'sports' } });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /create event/i }));
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating event:', expect.any(Error));
    expect(screen.getByText('Failed to create event. Please try again.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create event/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create event/i })).not.toBeDisabled();
    
    consoleErrorSpy.mockRestore();
  });

  // Unit test 10: Test form submission with empty fields
  test('makes API call with empty fields and handles validation on server side', async () => {
    render(<CreateEvent />);
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /create event/i }));
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:8080/CreateEvent',
      expect.objectContaining({
        name: '',
        description: '',
        date: '',
        time: '',
        location: '',
        max_participants: 0,
        organizer_id: 123,
        category: '',
      }),
      expect.any(Object)
    );
  });

  // Unit test 11: Test data transformation for API
  test('transforms form data correctly for API submission', async () => {
    axios.post.mockResolvedValueOnce({ data: { id: 1 } });
    
    render(<CreateEvent />);

    fireEvent.change(screen.getByLabelText(/event name/i), { target: { value: 'Event' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Description' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2025-12-25' } });
    fireEvent.change(screen.getByLabelText(/time/i), { target: { value: '14:30' } });
    fireEvent.change(screen.getByLabelText(/location/i), { target: { value: 'Location' } });
    fireEvent.change(screen.getByLabelText(/google maps link/i), { target: { value: 'https://maps.google.com/123' } });
    fireEvent.change(screen.getByLabelText(/maximum participants/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'sports' } });
    
    const tagInput = screen.getByLabelText(/tags/i);
    const addTagButton = screen.getByRole('button', { name: /add tag/i });
    
    fireEvent.change(tagInput, { target: { value: 'tag1' } });
    fireEvent.click(addTagButton);
    
    fireEvent.change(tagInput, { target: { value: 'tag2' } });
    fireEvent.click(addTagButton);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /create event/i }));
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        tags: 'tag1, tag2'
      }),
      expect.any(Object)
    );
  });
});