import React from 'react';
import './OrderStatus.css';

const OrderStatus = ({ currentStatus, onStatusUpdate, isAdmin }) => {
  const statusSteps = [
    'Order Placed',
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered'
  ];

  const getCurrentStepIndex = () => {
    return statusSteps.indexOf(currentStatus);
  };

  return (
    <div className="admin-order-status">
      <div className="status-controls">
        <strong>Current Status:</strong>
        {isAdmin ? (
          <select
            value={currentStatus}
            onChange={(e) => onStatusUpdate(e.target.value)}
            className="status-select"
          >
            {statusSteps.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        ) : (
          <span className="current-status">{currentStatus}</span>
        )}
      </div>
      
      <div className="status-bar">
        {statusSteps.map((step, index) => {
          const currentIndex = getCurrentStepIndex();
          const isCompleted = index <= currentIndex;
          const isActive = index === currentIndex;

          return (
            <React.Fragment key={step}>
              <div 
                className={`status-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
              >
                <div className="step-dot"></div>
                <span className="step-label">{step}</span>
              </div>
              {index < statusSteps.length - 1 && (
                <div className={`status-line ${isCompleted ? 'completed' : ''}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatus;
