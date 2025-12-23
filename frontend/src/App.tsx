import { Route } from 'react-router';
import { Routes } from 'react-router';
import { BrowserRouter } from 'react-router';
import Home from './pages/Home';
import Layout from './components/Layout';
import Add from './pages/Add';
import Arp from './pages/Arp';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="add" element={<Add />} />
          <Route path="arp" element={<Arp />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
