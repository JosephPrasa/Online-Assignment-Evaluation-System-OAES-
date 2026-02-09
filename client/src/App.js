import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MainLayout from './components/MainLayout';
import AppRoutes from './routes/routes';

function App() {
  return (
    <Router>
      <div className="App">
        <MainLayout>
          <AppRoutes />
        </MainLayout>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          limit={1}
        />
      </div>
    </Router>
  );
}

export default App;
