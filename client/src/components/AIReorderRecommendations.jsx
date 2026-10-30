import React from 'react';

const AIReorderRecommendations = ({ recommendations, onReorder }) => {
  return (
    <div className="widget-card">
      <h3 className="widget-title">AI Reorder Recommendations</h3>
      <div className="reorder-list">
        {recommendations.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#64748b' }}>All stock levels are optimal.</p>
        ) : (
          recommendations.map((item) => (
            <div key={item.id} className="reorder-item">
              <div className="reorder-left">
                <img
                  src={item.image_url || '/products/coconut-oil.svg'}
                  alt={item.name}
                  className="reorder-thumb"
                  onError={(e) => {
                    e.target.src = '/products/coconut-oil.svg';
                  }}
                />
                <div className="reorder-details">
                  <span className="reorder-name">{item.name}</span>
                  <span className="reorder-units-left">{item.available_stock} units left</span>
                  <span className="reorder-suggest">Reorder {item.reorder_quantity || 50} units</span>
                </div>
              </div>
              <button
                className="btn-reorder"
                onClick={() => onReorder(item)}
              >
                Reorder
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AIReorderRecommendations;
