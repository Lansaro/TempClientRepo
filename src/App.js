import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PreviewTable from './components/PreviewTable';
import Dashboard from './components/Dashboard';
import Header from './components/Header';

function App() {
  return (
    <BrowserRouter>
      <div className='App'>
        <Header />
        <div className='App-body'>
          <Routes>
            <Route path='/' element={<Dashboard />} />
            <Route path='/JSON/:id' element={<PreviewTable />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;