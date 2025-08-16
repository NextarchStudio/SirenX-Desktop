import React from 'react';
import './Logo.css';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
  isBackground?: boolean;
}

export function Logo({ size = 'large', showText = true, className = '', isBackground = false }: LogoProps) {
  if (isBackground) {
    return (
      <div className={`sirenx-logo background ${size} ${className}`}>
        {/* Background Logo Image */}
        <img 
          src="/SirenXDesktop.png" 
          alt="SirenX Desktop Logo" 
          className="logo-background-image"
        />
      </div>
    );
  }

  return (
    <div className={`sirenx-logo ${size} ${className}`}>
      {/* Logo Image */}
      <img 
        src="/SirenXDesktop.png" 
        alt="SirenX Desktop Logo" 
        className="logo-image"
      />
      
      {/* Optional Text Overlay */}
      {showText && (
        <div className="logo-text">
          <div className="sirenx-text">
            <span className="siren">Siren</span>
            <span className="x">X</span>
          </div>
          <div className="desktop-text">Desktop</div>
        </div>
      )}
    </div>
  );
}
