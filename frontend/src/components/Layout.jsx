// frontend/src/components/Layout.jsx
import { Outlet } from "react-router-dom";
import Header from "./Header/Header"; // ✅ Chemin vers Header/Header.jsx
import Footer from "./Footer/Footer"; // ✅ Chemin vers Footer/Footer.jsx

export default function Layout() {
  return (
    <>
      <Header />
      <main>
        <Outlet /> {/* Contenu des pages */}
      </main>
      <Footer />
    </>
  );
}
