const db = require('./mssql');
const knex = require('knex')({
   client: 'sqlite3',
   connection: {
       filename: './DonneesTest.sql'   
   },
   usenullasdefault: true
})

function somme(a, b) {
  return a + b;
}
module.exports = somme;

async function getInscriptionsKnex() {
    try {

      const inscriptions = await db('Utilisateur').select('*');
      console.log(inscriptions);

    }catch(error) {
      console.log('Erreur lors de la recuperation des inscriptions: ', error)
    }
     
}

getInscriptionsKnex();

async function listerProduit(idProduit) {
  try {
    const produit = await db('Produit').where('produitID', idProduit).select('*');
    
    console.log(produit);
  } 
  catch (error) {
      console.log('Erreur lors de la récupération du produit: ', error);
    }
}

listerProduit(1);

async function ajouterProduit(produit) {
  try {
    const result = await db('Produit')
      .insert({
        fournisseurID: produit.fournisseurID,
        nom: produit.nom,
        description: produit.description,
        prix: produit.prix,
        stock: produit.stock
      })
      .returning('produitID');
     
    const produitId = result[0].produitID;
     
    console.log('Produit ajouté avec succès, ID:', produitId);
    return produitId;
  } catch (error) {
    console.error('Erreur lors de l\'insertion du produit:', error);
    throw error;
  }
}
 
const newProduit = {
  fournisseurID: 1,
  nom: 'Produit Exemple',
  description: 'Un produit très intéressant',
  prix: 99.99,
  stock: 50
};
 
ajouterProduit(newProduit)
  .then(produitId => {
    console.log('ID du produit inséré:', produitId);
  })
  .catch(error => {
    console.log('Erreur:', error);
  });
