import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Leads } from '@/pages/Leads';
import { Analysis } from '@/pages/Analysis';
import { Settings } from '@/pages/Settings';
import { LeadsProvider } from '@/context/LeadsContext';

function App() {
  return (
    <LeadsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="analysis" element={<Analysis />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LeadsProvider>
  );
}

export default App;
