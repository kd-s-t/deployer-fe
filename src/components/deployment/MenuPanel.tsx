import React from 'react';
import { MenuCard } from './types';
import { menuCards, componentFrameworks } from './constants';

interface MenuPanelProps {
  selectedNode: string | null;
  onDragStart: (e: React.DragEvent, card: MenuCard) => void;
  onCardClick: () => void;
  usedOptionalTools: Set<string>;
}

export const MenuPanel: React.FC<MenuPanelProps> = ({
  selectedNode,
  onDragStart,
  onCardClick,
  usedOptionalTools,
}) => {
  return (
    <div style={{
      width: '250px',
      backgroundColor: 'white',
      borderRadius: '0',
      boxShadow: 'none',
      padding: '1.5rem',
      height: 'fit-content'
    }}>
      <h3 style={{ color: '#333', marginBottom: '1rem', fontSize: '1rem' }}>Components</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {menuCards.map(card => (
          <div
            key={card.id}
            draggable
            onDragStart={(e) => onDragStart(e, card)}
            onClick={onCardClick}
            style={{
              padding: '0.75rem',
              backgroundColor: card.color,
              color: 'white',
              borderRadius: '4px',
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: '500',
              transition: 'transform 0.2s ease',
              userSelect: 'none',
              border: '2px solid transparent'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span style={{ fontSize: '1rem' }}>{card.icon}</span>
            {card.label}
          </div>
        ))}
      </div>

      {/* Optional Tools Divider - Only show when a node is selected */}
      {selectedNode && (
        <>
          <div style={{ margin: '1rem 0 0.5rem 0' }}>
            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '0 0 0.5rem 0' }} />
            <h4 style={{ 
              color: '#6b7280', 
              fontSize: '0.8rem', 
              fontWeight: '500',
              textAlign: 'center',
              margin: '0'
            }}>
              Optional Tools
            </h4>
          </div>

          {/* Optional Tools */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {componentFrameworks.optional
              .filter(tool => !usedOptionalTools.has(tool.value))
              .map(tool => {
                const optionalCard: MenuCard = {
                  id: `optional-${tool.value}`,
                  type: 'optional',
                  label: tool.label,
                  icon: '🔧',
                  color: '#6c757d',
                  toolType: tool.value
                };
                
                return (
                  <div
                    key={tool.value}
                    draggable
                    onDragStart={(e) => onDragStart(e, optionalCard)}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: '#f9fafb',
                      color: '#374151',
                      borderRadius: '3px',
                      fontSize: '0.75rem',
                      fontWeight: '400',
                      border: '1px solid #e5e7eb',
                      cursor: 'grab',
                      userSelect: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = 'scale(0.95)';
                      e.currentTarget.style.backgroundColor = '#e5e7eb';
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                  >
                    🔧 {tool.label}
                  </div>
                );
              })}
          </div>

          {/* Coming Soon Tools */}
          {componentFrameworks.comingSoon && componentFrameworks.comingSoon.length > 0 && (
            <>
              <div style={{ margin: '1rem 0 0.5rem 0' }}>
                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '0 0 0.5rem 0' }} />
                <h4 style={{ 
                  color: '#9ca3af', 
                  fontSize: '0.8rem', 
                  fontWeight: '500',
                  textAlign: 'center',
                  margin: '0'
                }}>
                  Coming Soon
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {componentFrameworks.comingSoon.map(tool => (
                  <div
                    key={tool.value}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: '#f3f4f6',
                      color: '#9ca3af',
                      borderRadius: '3px',
                      fontSize: '0.75rem',
                      fontWeight: '400',
                      border: '1px solid #d1d5db',
                      cursor: 'not-allowed',
                      userSelect: 'none',
                      opacity: 0.6,
                      position: 'relative'
                    }}
                  >
                    🔧 {tool.label}
                    <span style={{
                      position: 'absolute',
                      top: '2px',
                      right: '4px',
                      fontSize: '0.6rem',
                      color: '#6b7280',
                      fontWeight: '600'
                    }}>
                      SOON
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
      
      <p style={{ 
        marginTop: '1rem', 
        fontSize: '0.75rem', 
        color: '#6b7280',
        textAlign: 'center'
      }}>
        Drag components to the canvas to build your deployment flow
      </p>
    </div>
  );
};
