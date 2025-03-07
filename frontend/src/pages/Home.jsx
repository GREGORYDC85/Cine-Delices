import React from 'react';
import '../styles/global.css'; // Lier le fichier CSS spécifique à cette page

const Home = () => {
  return (
    <div className="home">
      <h1>Bienvenue sur Ciné Délices</h1>
      <p>Découvrez les meilleures recettes inspirées des films et séries !</p>
      <button>Voir les recettes</button>
    </div>
  );
};

export default Home;
