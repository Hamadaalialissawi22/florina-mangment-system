import React, { useEffect, useState } from 'react';

interface DatabaseStatusProps {
  checkStatus: () => Promise<boolean>;
}

const DatabaseStatus: React.FC<DatabaseStatusProps> = ({ checkStatus }) => {
  const [status, setStatus] = useState<'loading' | 'online' | 'offline'>('loading');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const isOnline = await checkStatus();
        setStatus(isOnline ? 'online' : 'offline');
      } catch {
        setStatus('offline');
      }
    };

    fetchStatus();
  }, [checkStatus]);

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'green';
      case 'offline':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '8px', display: 'inline-block' }}>
      <strong>Database Status: </strong>
      <span style={{ color: getStatusColor() }}>
        {status === 'loading' ? 'Checking...' : status.toUpperCase()}
      </span>
    </div>
  );
};

export default DatabaseStatus;
