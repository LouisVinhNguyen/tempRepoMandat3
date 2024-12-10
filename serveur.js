const express = require('express');
const bodyParser = require('body-parser');
const db = require('./knex');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use('/utilisateur', express.static(path.join(__dirname, 'public/utilisateur')));
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/utilisateur', 'userMain.html'));
});

// Produit

/*
 * Route GET /api/produit
 * 
 */
app.get('/api/produit', async (req, res) => {
  try {
    // Obtenir les paramètres de la requête
    const queryParams = req.query;

    // Liste des champs valides pour la table "inscription"
    const validFields = ['produitID', 'fournisseurID', 'nom', 'description', 'prix', 'stock'];

    // Vérification : assurez-vous que tous les champs spécifiés ne sont pas vides
    for (const [key, value] of Object.entries(queryParams)) {
      if (validFields.includes(key) && (!value || value.trim() === '')) {
        return res.status(400).json({ message: `Le champ '${key}' ne peut pas être vide.` });
      }
    }

    // Construire la requête filtrée
    const filters = {};
    validFields.forEach((field) => {
      if (queryParams[field]) {
        filters[field] = queryParams[field];
      }
    });

    // Exécuter la requête filtrée
    const produits = await db('Produit').where(filters).select('*');

    // Retourner les inscriptions trouvées
    res.json(produits);
  } catch (error) {
    // Gérer les erreurs
    res.status(500).json({ message: 'Erreur lors de la récupération des inscriptions.', error: error.message });
  }
});


/*
 * Route POST /api/produit
 * 
 */

app.post('/api/produit', async (req, res) => {
    const { nom, description, prix, quantite: stock } = req.body;
    const fournisseurNom = "NULL"

    if (!nom || !description || !prix || !stock) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }

    if (!validePrix(prix)) {
        return res.status(400).json({ message: 'Le prix saisi doit respecter le format suivant: 10 , 3.99 , 129.19' });
    }

    if (!valideQuantite(stock)) {
        return res.status(400).json({ message: 'La quantité saisi doit être un entier.' });
    }
  
    try {
        const produit = await db.raw(`
            EXEC formulaireInscriptionProduit
                @fournisseurNom = ?, 
                @nom = ?, 
                @description = ?, 
                @prix = ?, 
                @stock = ?
        `, [fournisseurNom, nom, description, prix, stock]);

        res.json(produit);
    } catch (error) {
  
      console.error('Database Error:', error);
      res.status(500).json({ message: 'Erreur lors de l’ajout de l’inscription.' });
    }
});

app.delete('/api/produit/:produitID', async (req, res) => {
  // Récupère l'ID de l'inscription à supprimer depuis les paramètres de la requête
  const { produitID } = req.params;

  try {
    console.log('Attempting to delete product with ID:', produitID);
    // Supprime l'inscription correspondant à l'ID donné
    const deleted = await db('Produit').where({ produitID }).del();

    // Si aucune inscription n'est trouvée avec cet ID, retourne une erreur 404
    if (!deleted) {
      return res.status(404).json({ message: 'Inscription non trouvée.' });
    }

    // Si la suppression a réussi, retourne une réponse vide avec un code 204 (No Content)
    res.status(204).send();
  } catch (error) {
    // En cas d'erreur, retourne une réponse avec un message d'erreur et un code 500
    res.status(500).json({ message: 'Erreur lors de la suppression de l’inscription.', error: error.message });
  }
});

app.put('/api/produit/:produitID', async (req, res) => {
  // Récupère l'ID de l'inscription depuis les paramètres de la requête (req.params)
  const { id } = req.params;

  // Extraction des champs modifiés depuis le corps de la requête (req.body)
  const { nom, description, prix, quantite } = req.body;

  if (!nom || !description || !prix || !quantite ) {
    return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
  }

  try {
    // Met à jour l'inscription correspondant à l'ID donné
    const updated = await db('produit').where({ id }).update({ nom, description, prix, quantite });

    // Si aucune inscription n'est trouvée avec cet ID, retourne une erreur 404 (Not Found)
    if (!updated) {
      return res.status(404).json({ message: 'Inscription non trouvée.' });
    }

    // Récupère et renvoie l'inscription mise à jour
    const produit = await db('produit').where({ id }).first();
    if (produit) {
        res.json(produit); // Send the updated product object
    } else {
        res.status(404).json({ message: 'Produit non trouvé.' });
    }    
  } catch (error) {
    // En cas d'erreur, retourne une réponse avec un message d'erreur et un code 500
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l’inscription.', error: error.message });
  }
});

/*
* Route GET /api/userProduit
* Cette route ajoute des produits a la table "userTableProduit"
*/
app.get('/api/utilisateur', async (req, res) => {
  try {
    // Obtenir les paramètres de la requête
    const queryParams = req.query;

    // Liste des champs valides pour la table "inscription"
    const validFields = ['userID', 'adresseID', 'prenom', 'nom', 'email', 'numTelephone', 'motDePasse', 'accepteComptant', 'accepteInteract', 'estMajeur'];

    // Vérification : assurez-vous que tous les champs spécifiés ne sont pas vides
    for (const [key, value] of Object.entries(queryParams)) {
      if (validFields.includes(key) && (!value || value.trim() === '')) {
        return res.status(400).json({ message: `Le champ '${key}' ne peut pas être vide.` });
      }
    }

    // Construire la requête filtrée
    const filters = {};
    validFields.forEach((field) => {
      if (queryParams[field]) {
        filters[field] = queryParams[field];
      }
    });

    // Exécuter la requête filtrée
    const utilisateurs = await db('Utilisateur').where(filters).select('*');

    // Retourner les inscriptions trouvées
    res.json(utilisateurs);
  } catch (error) {
    // Gérer les erreurs
    res.status(500).json({ message: 'Erreur lors de la récupération des inscriptions.', error: error.message });
  }
});

/*
* Route GET /api/commandeEnCours
* Cette route ajoute des utilisateur a la table "tableCommandeEnCours"
*/
app.get('/api/commandeEnCours', async (req, res) => {
  try {
    // Obtenir les paramètres de la requête
    const queryParams = req.query;

    // Liste des champs valides pour la table "inscription"
    const validFields = ['commandeID', 'userID', 'dateCommande', 'dateLivraison', 'estLivre'];

    // Vérification : assurez-vous que tous les champs spécifiés ne sont pas vides
    for (const [key, value] of Object.entries(queryParams)) {
      if (validFields.includes(key) && (!value || value.trim() === '')) {
        return res.status(400).json({ message: `Le champ '${key}' ne peut pas être vide.` });
      }
    }

    // Construire la requête filtrée
    const filters = {};
    validFields.forEach((field) => {
      if (queryParams[field]) {
        filters[field] = queryParams[field];
      }
    });

    // Exécuter la requête filtrée
    const commandes = await db('Commande').where(filters).select('*');

    // Retourner les inscriptions trouvées
    res.json(commandes);
  } catch (error) {
    // Gérer les erreurs
    res.status(500).json({ message: 'Erreur lors de la récupération des commandes.', error: error.message });
  }
});


// Coté user

/*
* Route GET /api/userProduit
* Cette route ajoute des produits a la table "userTableProduit"
*/
app.get('/api/userProduit', async (req, res) => {
  try {
    // Obtenir les paramètres de la requête
    const queryParams = req.query;

    // Liste des champs valides pour la table "inscription"
    const validFields = ['produitID', 'fournisseurID', 'nom', 'description', 'prix', 'stock'];

    // Vérification : assurez-vous que tous les champs spécifiés ne sont pas vides
    for (const [key, value] of Object.entries(queryParams)) {
      if (validFields.includes(key) && (!value || value.trim() === '')) {
        return res.status(400).json({ message: `Le champ '${key}' ne peut pas être vide.` });
      }
    }

    // Construire la requête filtrée
    const filters = {};
    validFields.forEach((field) => {
      if (queryParams[field]) {
        filters[field] = queryParams[field];
      }
    });

    // Exécuter la requête filtrée
    const produits = await db('Produit').where(filters).select('*');

    // Retourner les inscriptions trouvées
    res.json(produits);
  } catch (error) {
    // Gérer les erreurs
    res.status(500).json({ message: 'Erreur lors de la récupération des inscriptions.', error: error.message });
  }
});



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 1. Authentification:

/*
 * Route GET /api/users
 * 
 */
app.get('/api/users', async (req, res) => {
  try {
    // Get query parameters
    const queryParams = req.query;

    // List of valid fields for filtering users
    const validFields = ['username', 'email', 'role', 'id'];

    // Check if any fields are invalid or empty
    for (const [key, value] of Object.entries(queryParams)) {
      if (validFields.includes(key) && (!value || value.trim() === '')) {
        return res.status(400).json({ message: `The field '${key}' cannot be empty.` });
      }
    }

    // Build filtered query
    const filters = {};
    validFields.forEach((field) => {
      if (queryParams[field]) {
        filters[field] = queryParams[field];
      }
    });

    // Execute the filtered query
    const users = await db('users').where(filters).select('*');

    // Send the fetched users as JSON
    res.json(users);
  } catch (error) {
    // Handle errors gracefully
    res.status(500).json({ message: 'Error fetching users.', error: error.message });
  }
});


/*
* Route POST /api/register
* Cette route ajoute des utilisateurs a la table "users"
*/
app.post('/api/register', async (req, res) => {
    const { username, email, password, repeatPassword } = req.body;
    const defaultRole = "admin";

    if (!username || !email || !password || !repeatPassword) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }
  
    if (!valideUsername(username)) {
      return res.status(400).json({ message: "Votre username ne peut contenir que les caractères suivant: a-z 0-9 _" });
    }
  
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "L'adresse email est invalide." });
    }
  
    if (!(password == repeatPassword)) {
      return res.status(400).json({ message: "Les mots de passe doivent correspondre."});
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const [id] = await db('users').insert({ username, email, password: hashedPassword, role: defaultRole });
      const inscription = await db('users').where({ id }).first();
      res.status(201).json(inscription);
    } catch (error) {
  
      console.error('Database Error:', error); // Log the exact error for debugging
      
      if (error.code === 'SQLITE_CONSTRAINT') {
        if (error.message.includes('username')) {
          return res.status(409).json({ message: "Le nom d'utilisateur est déjà utilisé." });
        }
        if (error.message.includes('email')) {
          return res.status(409).json({ message: "L'adresse email est déjà utilisée." });
        }
        return res.status(409).json({ message: "Un des champs uniques est déjà utilisé." });
      }
  
      res.status(500).json({ message: 'Erreur lors de l’ajout de l’inscription.' });
    }
});


/**
 * Route POST : Login par email
 * Cette route permet de confirmer que l'utilisateur existe dans la base de données et le connecte
 */

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
  }

  try {
      const user = await db('users').where({ email }).first();
      if (!user) {
          return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
          return res.status(401).json({ message: 'Mot de passe incorrect.' });
      }   

      res.json({ message: 'Connexion réussie' });
  } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la connexion.', error: error.message });
  }
});


/*
 * Route POST : Logout
 * Cette route permet deconnecte l'utilisateur
 */
app.post('/api/logout', (req, res) => {
  res.json({ message: 'Déconnexion réussie.' });
});

/*
 * Route PUT : 
 * Cette route permet de modifier les informations des users
 */
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role } = req.body;

  console.log('Received data:', req.body);

  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Check if the user exists
    const userExists = await db('users').where({ id }).first();
    if (!userExists) {
      return res.status(404).json({ message: 'User not found.' });
    }

    console.log('Attempting to update user with ID:', id);
    console.log('Updated data:', { username, email, password, role });

    // Perform the update
    const updated = await db('users')
      .where({ id })
      .update({ username, email, password, role })
      .debug(); // Log the query being executed

    console.log('Rows updated:', updated);

    if (!updated) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Fetch and return the updated user
    const user = await db('users').where({ id }).first();
    console.log('Updated user:', user);
    res.json(user);
  } catch (error) {
    console.log('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user.', error: error.message });
  }
});


/*
 * Route DELETE : 
 * Cette route permet de supprimer les users
 */
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Delete the user corresponding to the given ID
    const deleted = await db('users').where({ id }).del();

    // If no user is found with this ID, return a 404 error
    if (!deleted) {
      return res.status(404).json({ message: "User not found." });
    }

    // If the deletion is successful, return a 204 No Content status
    res.status(204).send();
  } catch (error) {
    // In case of an error, return an error message and status 500
    res.status(500).json({ message: 'Error deleting user.', error: error.message });
  }
});


// 2. Gestion des Articles:

/*
 * Route GET :
 * Cette route permet de charger les articles sur la page index.html
 */
app.get('/api/articlesUsers', async (req, res) => {
  try {
    const { search } = req.query
    let articles;

    if(search) {
      articles = await db('articles')
      .join('users', 'articles.admin_id', '=', 'users.id')
      .select('articles.*', 'users.username', 'users.email')
      .where('title', 'like', `%${search}%`)
      .debug();  // This will log the SQL query being executed
    } else {
      articles = await db('articles')
      .join('users', 'articles.admin_id', '=', 'users.id')
      .select('articles.*', 'users.username', 'users.email')
      .debug();  // This will log the SQL query being executed
    }


    // Send the fetched articles as JSON
    res.json(articles);
  } catch (error) {
    // Handle errors gracefully
    res.status(500).json({ message: 'Error fetching articles.', error: error.message });
  }
});



/*
 * Route GET :
 * Cette route permet de charger les articles sur la page admin.html
 */

// Route to fetch articles
app.get('/api/articles', async (req, res) => {
  try {
    // Get query parameters
    const queryParams = req.query;

    // List of valid fields for filtering articles
    const validFields = ['title', 'author', 'date', 'content', 'id'];

    // Check if any fields are invalid or empty
    for (const [key, value] of Object.entries(queryParams)) {
      if (validFields.includes(key) && (!value || value.trim() === '')) {
        return res.status(400).json({ message: `The field '${key}' cannot be empty.` });
      }
    }

    // Build filtered query
    const filters = {};
    validFields.forEach((field) => {
      if (queryParams[field]) {
        filters[field] = queryParams[field];
      }
    });

    // Execute the filtered query
    const articles = await db('articles').where(filters).select('*');

    // Send the fetched articles as JSON
    res.json(articles);
  } catch (error) {
    // Handle errors gracefully
    res.status(500).json({ message: 'Error fetching articles.', error: error.message });
  }
});

/*
 * Route POST /api/articles :
 * Cette route permet de creer des articles
 */

app.post('/api/articles', async (req, res) => {
  const { admin_id, title, content, image_url } = req.body;

  if (!title || !content) {
      return res.status(400).json({ message: 'Veuillez remplir tous les champs requis.' });
  };

  try {
      const [id] = await db('articles').insert({
          title,
          content,
          image_url: image_url || null, // Use null if no image URL is provided
          views: 0,
          admin_id
      });
      const article = await db('articles').where({ id }).first();
      res.status(201).json(article);
  } catch (error) {
      console.error('Error creating article:', error);
      res.status(500).json({ message: 'Error creating article', error: error.message });
  }
});

/*
 * Route PUT /api/articles/:id
 * Cette route permet de modifier les infos de l'articles
 */

app.put('/api/articles/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, image_url, views, adminId } = req.body;

  console.log('Received data:', req.body);

  // Ensure views and adminId are integers
  const numericViews = parseInt(views, 10);
  const numericAdminId = parseInt(adminId, 10);

  // Check if values are valid
  if (isNaN(numericViews) || isNaN(numericAdminId)) {
    return res.status(400).json({ message: 'Views and Admin ID must be valid numbers.' });
  }

  console.log('Attempting to update article with ID:', id);

  // Check if the article exists
  const articleExists = await db('articles').where({ id }).first();
  if (!articleExists) {
    return res.status(404).json({ message: 'Article non trouvé.' });
  }

  console.log('Updated data:', { title, content, image_url, views: numericViews, admin_id: numericAdminId });

  try {
    // Perform the update
    const updated = await db('articles')
  .where({ id })
  .update({
    title,
    content,
    image_url,  // This is fine as is
    views: numericViews,
    admin_id: numericAdminId  // Corrected to match the database column name
  })
  .debug(); // Log the query being executed


    console.log('Rows updated:', updated);

    if (!updated) {
      return res.status(404).json({ message: 'Article non trouvé.' });
    }

    // Fetch and return the updated article
    const article = await db('articles').where({ id }).first();
    console.log('Updated article:', article);
    res.json(article);
  } catch (error) {
    console.log('Error updating article:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l’article.', error: error.message });
  }
});



/*
 * Route DELETE /api/articles :
 * Cette route permet de creer des articles
 */

app.delete('/api/articles/:id', async (req, res) => {
  // Récupère l'ID de l'article à supprimer depuis les paramètres de la requête
  const { id } = req.params;

  try {
    // Supprime l'article correspondant à l'ID donné
    const deleted = await db('articles').where({ id }).del();

    // Si aucun article n'est trouvé avec cet ID, retourne une erreur 404
    if (!deleted) {
      return res.status(404).json({ message: "L'article que vous essayez de supprimer n'existe pas." });
    }

    // Si la suppression a réussi, retourne une réponse vide avec un code 204 (No Content)
    res.status(204).send();
  } catch (error) {
    // En cas d'erreur, retourne une réponse avec un message d'erreur et un code 500
    res.status(500).json({ message: "Erreur lors de la suppression de l'article.", error: error.message });
  }
});


// Contact

/**
 * Route POST : Ajouter un nouveau message de contact
 * Cette route permet de recevoir un message via une requête POST.
 */
app.post('/api/contact', async (req, res) => {
  const { nomC,  courriel, messages } = req.body;
  console.log("Request received:", req.body);

  if (!nomC || !courriel || !messages) {
    return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
  }

  if (!validateEmail(courriel)) {
    return res.status(400).json({ message: "L'adresse email est invalide." });
  }

  try {
    const [numMes] = await db('contact').insert({ nomC, courriel , messages });
    const contact = await db('contact').where({ numMes }).first();
    res.status(201).json(contact);
  } catch (error) {
    console.error("Erreur lors de l'ajout :", error.message);
    res.status(500).json({ message: 'Erreur lors de l’envoi du message.', error: error.message });
}
});


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
// Extras

function validePrix(prix) {
    if (Number.isInteger(prix)) {
        return true;
    }

    const regex = /^\d+(\.\d{2})?$/;
    if (regex.test(prix)) {
        return true;
    }

    return false;
}

function valideQuantite(quantite) {
  quantite = Number(quantite);

  if (Number.isInteger(quantite)) {
      return true;
  }

  return false;
}

app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
