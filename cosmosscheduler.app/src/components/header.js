import React from 'react';
import '../styles/header.css';
import '../styles/app.css';


class Header extends React.Component {
    render() {
        return (
            <header className="app-header">
              <ul className="header-ul">
                <li>
                  <div className='app-logo' />
                </li>
                <li>
                  <div>CosmosDB Scheduler</div>
                </li>
              </ul>
            </header>
        );
    }
}

export default Header