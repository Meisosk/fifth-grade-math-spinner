import { BrowserRouter, Routes, Route } from "react-router-dom";
import SpinnerPage from "./pages/SpinnerPage";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SpinnerPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
