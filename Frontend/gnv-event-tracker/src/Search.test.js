const React = require('react');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');

jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn()
}));

jest.mock('react-router-dom', () => ({
  Link: ({ to, state, children }) => (
    <a href={to} data-state={JSON.stringify(state)}>{children}</a>
  )
}), { virtual: true });

const axios = require('axios');

const AllEvents = require('./AllEvents').default;

describe('AllEvents Search Functionality Tests', () => {
  const mockEvents = [
    { id: '1', name: 'Music Festival', date: '2023-08-15', location: 'Downtown Gainesville', description: 'A vibrant music festival' },
    { id: '2', name: 'Tech Conference', date: '2023-09-20', location: 'UF Campus', description: 'Annual technology conference' },
    { id: '3', name: 'Food Fair', date: '2023-07-10', location: 'City Park', description: 'Local food vendors showcase' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: mockEvents });
  });

  // Test 1: Search input renders correctly
  test('search input field renders correctly', async () => {
    render(<AllEvents />);
    
    await waitFor(() => expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3));
    
    const searchInput = screen.getByPlaceholderText('Search events by name or description...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput.tagName.toLowerCase()).toBe('input');
    expect(searchInput).toHaveAttribute('type', 'text');
    expect(searchInput).toHaveClass('search-input');
  });

  // Test 2: Search by event name
  test('filters events correctly when searching by name', async () => {
    render(<AllEvents />);
    
    await waitFor(() => expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3));
    
    const searchInput = screen.getByPlaceholderText('Search events by name or description...');
    fireEvent.change(searchInput, { target: { value: 'tech' } });
    
    expect(screen.getByText('Tech Conference')).toBeInTheDocument();
    expect(screen.queryByText('Music Festival')).not.toBeInTheDocument();
    expect(screen.queryByText('Food Fair')).not.toBeInTheDocument();
  });

  // Test 3: Search by event description
  test('filters events correctly when searching by description', async () => {
    render(<AllEvents />);
    
    await waitFor(() => expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3));
    
    const searchInput = screen.getByPlaceholderText('Search events by name or description...');
    fireEvent.change(searchInput, { target: { value: 'vibrant' } });
    
    expect(screen.getByText('Music Festival')).toBeInTheDocument();
    expect(screen.queryByText('Tech Conference')).not.toBeInTheDocument();
    expect(screen.queryByText('Food Fair')).not.toBeInTheDocument();
  });

  // Test 4: Case insensitivity of search
  test('search is case-insensitive', async () => {
    render(<AllEvents />);
    
    await waitFor(() => expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3));
    
    const searchInput = screen.getByPlaceholderText('Search events by name or description...');
    fireEvent.change(searchInput, { target: { value: 'MUSIC' } });
    
    expect(screen.getByText('Music Festival')).toBeInTheDocument();
    expect(screen.queryByText('Tech Conference')).not.toBeInTheDocument();
    expect(screen.queryByText('Food Fair')).not.toBeInTheDocument();
  });

  // Test 5: No results found message
  test('displays "No events found" message when search has no matches', async () => {
    render(<AllEvents />);
    
    await waitFor(() => expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3));
    
    const searchInput = screen.getByPlaceholderText('Search events by name or description...');
    fireEvent.change(searchInput, { target: { value: 'nonexistentterm' } });
    
    expect(screen.getByText('No events found matching your search.')).toBeInTheDocument();
    expect(screen.queryByText('Music Festival')).not.toBeInTheDocument();
    expect(screen.queryByText('Tech Conference')).not.toBeInTheDocument();
    expect(screen.queryByText('Food Fair')).not.toBeInTheDocument();
  });

  // Test 6: Clearing search term shows all events again
  test('restores all events when search term is cleared', async () => {
    render(<AllEvents />);
    
    await waitFor(() => expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3));
    
    const searchInput = screen.getByPlaceholderText('Search events by name or description...');
    
    // First filter
    fireEvent.change(searchInput, { target: { value: 'tech' } });
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1);
    
    // Then clear
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
  });

  // Test 7: Filter events with partial match
  test('filters events correctly with partial text match', async () => {
    render(<AllEvents />);
    
    await waitFor(() => expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3));
    
    const searchInput = screen.getByPlaceholderText('Search events by name or description...');
    fireEvent.change(searchInput, { target: { value: 'fest' } });
    
    // Should match "Music Festival" and "Festival" in description
    expect(screen.getByText('Music Festival')).toBeInTheDocument();
    expect(screen.queryByText('Tech Conference')).not.toBeInTheDocument();
    expect(screen.queryByText('Food Fair')).not.toBeInTheDocument();
  });

  // Test 8: Search state updates correctly
  test('search term state updates correctly', async () => {
    render(<AllEvents />);
    
    await waitFor(() => expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3));
    
    const searchInput = screen.getByPlaceholderText('Search events by name or description...');
    
    fireEvent.change(searchInput, { target: { value: 'tech' } });
    expect(searchInput.value).toBe('tech');
    
    fireEvent.change(searchInput, { target: { value: 'food' } });
    expect(searchInput.value).toBe('food');
  });

  // Test 9: Handles events with missing description field
  test('handles events with missing description field', async () => {
    const eventsWithMissingFields = [
      ...mockEvents,
      { id: '4', name: 'Art Exhibition', date: '2023-10-05', location: 'City Gallery' } // No description
    ];
    
    axios.get.mockResolvedValue({ data: eventsWithMissingFields });
    
    render(<AllEvents />);
    
    await waitFor(() => expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4));
    
    const searchInput = screen.getByPlaceholderText('Search events by name or description...');
    fireEvent.change(searchInput, { target: { value: 'art' } });
    
    expect(screen.getByText('Art Exhibition')).toBeInTheDocument();
  });
});