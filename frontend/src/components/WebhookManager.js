// WebhookManager.js
import React, { useState, useEffect } from 'react';

const WebhookManager = ({ merchantId }) => {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    events: ['payment.created', 'payment.succeeded', 'payment.failed']
  });

  // Fetch webhooks for merchant
  useEffect(() => {
    if (merchantId) {
      fetchWebhooks();
    }
  }, [merchantId]);

  const fetchWebhooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/webhooks/merchant/${merchantId}`);
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data);
      } else {
        throw new Error('Failed to fetch webhooks');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWebhook = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/webhooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantId,
          url: formData.url,
          events: formData.events,
        }),
      });
      
      if (response.ok) {
        setFormData({
          url: '',
          events: ['payment.created', 'payment.succeeded', 'payment.failed']
        });
        setShowForm(false);
        fetchWebhooks(); // Refresh the list
      } else {
        throw new Error('Failed to create webhook');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebhook = async (webhookId) => {
    if (!window.confirm('Are you sure you want to delete this webhook?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/webhooks/${webhookId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchWebhooks(); // Refresh the list
      } else {
        throw new Error('Failed to delete webhook');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestWebhook = async (webhookId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/webhooks/${webhookId}/test`, {
        method: 'POST',
      });
      
      if (response.ok) {
        alert('Test event sent successfully!');
      } else {
        throw new Error('Failed to send test event');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleEvent = (event) => {
    setFormData(prev => {
      const events = prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event];
      return { ...prev, events };
    });
  };

  const availableEvents = [
    'payment.created',
    'payment.succeeded',
    'payment.failed',
    'payment.refunded'
  ];

  return (
    <div className="webhook-manager">
      <div className="webhook-header">
        <h2>Webhook Management</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Webhook'}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          Error: {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreateWebhook} className="webhook-form">
          <div className="form-group">
            <label>Webhook URL</label>
            <input
              type="url"
              className="form-control"
              value={formData.url}
              onChange={(e) => setFormData({...formData, url: e.target.value})}
              placeholder="https://your-site.com/webhook"
              required
            />
          </div>

          <div className="form-group">
            <label>Events</label>
            <div className="event-checkboxes">
              {availableEvents.map(event => (
                <div key={event} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={event}
                    checked={formData.events.includes(event)}
                    onChange={() => toggleEvent(event)}
                  />
                  <label htmlFor={event}>{event}</label>
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-success"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Webhook'}
          </button>
        </form>
      )}

      <div className="webhook-list">
        <h3>Configured Webhooks</h3>
        {loading && webhooks.length === 0 ? (
          <p>Loading webhooks...</p>
        ) : webhooks.length === 0 ? (
          <p>No webhooks configured yet.</p>
        ) : (
          <div className="webhook-items">
            {webhooks.map(webhook => (
              <div key={webhook.id} className="webhook-item">
                <div className="webhook-info">
                  <div className="webhook-url">{webhook.url}</div>
                  <div className="webhook-events">
                    {webhook.events.join(', ')}
                  </div>
                  <div className="webhook-created">
                    Created: {new Date(webhook.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="webhook-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleTestWebhook(webhook.id)}
                    disabled={loading}
                  >
                    Test
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDeleteWebhook(webhook.id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WebhookManager;