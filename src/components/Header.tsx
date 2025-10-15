import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Trophy, Home, Send, Users, Github } from 'lucide-react';
import './Header.css';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Submit Router', href: '/submit', icon: Send },
    { name: 'GitHub', href: 'https://github.com/RouteWorks', icon: Github, isExternal: true },
    { name: 'Contact', href: '#contact', icon: Users, isScroll: true },
  ];

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <Trophy className="logo-icon" />
          <span className="logo-text">RouterArena</span>
        </Link>

        <nav className="nav">
          <div className="nav-desktop">
            {navigation.map((item) => {
              const Icon = item.icon;
              if (item.isScroll) {
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      if (location.pathname !== '/') {
                        window.location.href = '/#contact';
                      } else {
                        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="nav-link nav-button"
                  >
                    <Icon className="nav-icon" />
                    {item.name}
                  </button>
                );
              }
              if (item.isExternal) {
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link"
                  >
                    <Icon className="nav-icon" />
                    {item.name}
                  </a>
                );
              }
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link ${location.pathname === item.href ? 'active' : ''}`}
                >
                  <Icon className="nav-icon" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <button
            className="menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {isMenuOpen && (
          <div className="nav-mobile">
            {navigation.map((item) => {
              const Icon = item.icon;
              if (item.isScroll) {
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (location.pathname !== '/') {
                        window.location.href = '/#contact';
                      } else {
                        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="nav-link nav-button"
                  >
                    <Icon className="nav-icon" />
                    {item.name}
                  </button>
                );
              }
              if (item.isExternal) {
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="nav-icon" />
                    {item.name}
                  </a>
                );
              }
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link ${location.pathname === item.href ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="nav-icon" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
