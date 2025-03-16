import { Link } from "react-router-dom";
import "./Footer.css"; // Import du CSS

function Footer() {
  return (
    <footer className="footer">
      <nav>
        <ul>
          <li>
            <Link to="/contact">Nous contacter</Link>
          </li>
          <li>
            <Link to="/plan-du-site">Plan du site</Link>
          </li>
          <li>
            <Link to="/mentions-legales">Mentions légales</Link>
          </li>
        </ul>
      </nav>
    </footer>
  );
}

export default Footer;
