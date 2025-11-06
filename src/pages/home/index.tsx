import { Link } from "react-router-dom";
import styles from "./index.module.css";

function Home() {
  return (
    <div className={styles.home}>
      <h1 className={styles.title}>Employees Dashboard</h1>
      <div className={styles.links}>
        <Link to="/wizard?role=admin" className={styles.link}>
          Admin Wizard
        </Link>
        <Link to="/wizard?role=ops" className={styles.link}>
          Ops Wizard
        </Link>
        <Link to="/employees" className={styles.link}>
          View Employees
        </Link>
      </div>
    </div>
  );
}

export default Home;
