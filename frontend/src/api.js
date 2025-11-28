// Exemple minimal pour Login.jsx
export const login = async (credentials) => {
  console.log("Appel à login avec :", credentials);
  return { success: true, user: { name: "Utilisateur test" } };
};

// Si tu as aussi besoin de getAdminDashboard pour Dashboard.jsx
export const getAdminDashboard = async () => {
  console.log("Appel à getAdminDashboard");
  return { data: { users: 0, movies: 0 } };
};
