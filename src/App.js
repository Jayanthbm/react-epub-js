import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Reader from './Components/Reader';
function App() {
  return (
    <Router>
      <Switch>
        <Route path='/'>
          <Reader />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
