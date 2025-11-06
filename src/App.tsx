import { Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Layout from "./components/layouts";
import styles from "./App.module.css";
import Employees from "./pages/employees";

function App() {
  return (
    <div className={styles.app}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="employees" element={<Employees />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
