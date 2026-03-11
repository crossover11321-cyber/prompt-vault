import { HashRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PromptEditor from './pages/PromptEditor';
import PromptDetail from './pages/PromptDetail';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new" element={<PromptEditor />} />
        <Route path="/edit/:id" element={<PromptEditor />} />
        <Route path="/prompt/:id" element={<PromptDetail />} />
      </Routes>
    </HashRouter>
  );
}
