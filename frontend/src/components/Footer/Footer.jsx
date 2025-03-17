import "./Footer.css";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <Link to="/contact">Nous contacter</Link>
      <Link to="/sitemap">Plan du site</Link>
      <Link to="/legal-mentions">Mentions légales</Link>
    </footer>
  );
}

export default Footer;
