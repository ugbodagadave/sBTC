// EventTester.js
import React, { useState } from 'react';

const EventTester = ({ merchantId }) => {
  const [webhooks, setWebhooks] = useState([]);
  const [selectedWebhook, setSelectedWebhook] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Fetch webhooks when component mounts
  React.useEffect(() => {
    if (merchantId) {
      fetchWebhooks();
    }
  }, [merchantId]);

  const fetchWebhooks = async () => {
    try {
      const response = await fetch(`/api/v1/webhooks/merchant/${merchantId}`);
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data);
      }
    } catch (err) {
      console.error('Failed to fetch webhooks:', err);
    }
  };

  const handleTestEvent = async () => {
    if (!selectedWebhook) {
      setError('Please select a webhook');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/v1/webhooks/${selectedWebhook}/test`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        throw new Error('Failed to send test event');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-tester">
      <h2>Webhook Event Tester</h2>
      
      {error && (
        <div className="alert alert-danger">
          Error: {error}
        </div>
      )}

      <div className="form-group">
        <label>Select Webhook</label>
        <select
          className="form-control"
          value={selectedWebhook}
          onChange={(e) => setSelectedWebhook(e.target.value)}
        >
          <option value="">Choose a webhook</option>
          {webhooks.map(webhook => (
            <option key={webhook.id} value={webhook.id}>
              {webhook.url}
            </option>
          ))}
        </select>
      </div>

      <button
        className="btn btn-primary"
        onClick={handleTestEvent}
        disabled={loading || !selectedWebhook}
      >
        {loading ? 'Sending Test Event...' : 'Send Test Event'}
      </button>

      {result && (
        <div className="test-result">
          <h3>Test Result</h3>
          <div className="result-details">
            <p><strong>Success:</strong> {result.success ? 'Yes' : 'No']}</p>
            {result.responseStatus && (
              <p><strong>Status:</strong> {result.responseStatus}</p>
            )}
            {result.responseBody && (
              <div>
                <strong>Response:</strong>
                <pre>{result.responseBody}</pre>
              </div>
            )}
            {result.error && (
              <p className="text-danger"><strong>Error:</strong> {result.error}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventTester;