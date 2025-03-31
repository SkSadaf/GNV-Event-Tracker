import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import './styles/CreateEvent.css';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { userId } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
    organizer_id: parseInt(userId), 
    max_participants: 0,
    category: '',
    tags: [],
    tagInput: '',
    cost: 0.0,
    google_maps_link: '',
    website: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = 'http://localhost:8080';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'max_participants' ? parseInt(value) 
              : name === 'cost' ? parseFloat(value)
              : value,
    });
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (formData.tagInput.trim() !== '' && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.tagInput.trim()],
        tagInput: ''
      });
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const tagsString = formData.tags.join(', ');
      const eventData = {
        name: formData.name,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        organizer_id: formData.organizer_id,
        max_participants: formData.max_participants,
        category: formData.category,
        tags: tagsString,
        cost: formData.cost,
        google_maps_link: formData.google_maps_link,
        website: formData.website || null,
      };

      const response = await axios.post(
        `${API_URL}/CreateEvent`,
        eventData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      alert('Event created successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-page">
      <h2>Create New Event</h2>
      <form onSubmit={handleSubmit} className="create-event-form">
        <div className="form-group">
          <label htmlFor="name">Event Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Date:</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="time">Time:</label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        {}
        <div className="form-group">
          <label htmlFor="google_maps_link">Google Maps Link:</label>
          <input
            type="text"
            id="google_maps_link"
            name="google_maps_link"
            value={formData.google_maps_link}
            onChange={handleChange}
            placeholder="https://maps.google.com/..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="max_participants">Maximum Participants:</label>
          <input
            type="number"
            id="max_participants"
            name="max_participants"
            value={formData.max_participants}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        {}
        <div className="form-group">
          <label htmlFor="cost">Cost ($):</label>
          <input
            type="number"
            step="0.01"
            id="cost"
            name="cost"
            value={formData.cost}
            onChange={handleChange}
            min="0"
            required
          />
        </div>

        {}
        <div className="form-group">
          <label htmlFor="website">Website (Optional):</label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            <option value="sports">Sports</option>
            <option value="music">Music</option>
            <option value="education">Education</option>
            <option value="networking">Networking</option>
            <option value="other">Other</option>
          </select>
        </div>

        {}
        <div className="form-group">
          <label htmlFor="tagInput">Tags:</label>
          <div className="tag-input-container">
            <input
              type="text"
              id="tagInput"
              name="tagInput"
              value={formData.tagInput}
              onChange={handleChange}
              placeholder="Add tags and press Enter"
            />
            <button type="button" onClick={handleAddTag} className="add-tag-btn">
              Add Tag
            </button>
          </div>
          <div className="tags-container">
            {formData.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
                <button 
                  type="button" 
                  onClick={() => handleRemoveTag(tag)} 
                  className="remove-tag-btn"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          {formData.tags.length > 0 && (
            <div className="tags-preview">
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Event'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard')}>
            Cancel
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default CreateEvent;