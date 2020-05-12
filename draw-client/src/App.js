import React from 'react';
import './App.css';

import Layout from './Layout/Layout';
import GameManager from './Containers/GameManager'

function App() {
  return (
    <div className="App">
      <Layout>
        <GameManager />
      </Layout>
    </div>
  );
}

export default App;
