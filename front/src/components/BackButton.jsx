import React from 'react';
import '@material/web/button/text-button.js';
import '@material/web/icon/icon.js';

/**
 * Simple back button with an arrow icon.
 * @param {{onClick: function, className?: string}} props
 */
export default function BackButton({ onClick, className = '' }) {
  return (
    <md-text-button onClick={onClick} className={className}>
      <md-icon slot='icon'>arrow_back</md-icon>
      Regresar
    </md-text-button>
  );
}