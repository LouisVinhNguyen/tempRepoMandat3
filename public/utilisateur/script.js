/*
* Route GET /api/userProduit
* Cette route ajoute des produits a la table "userTableProduit"
*/

function userAjouterProduit(produit) {
    let table = document.getElementById("userTableProduit");
    let newRow = table.insertRow();
    newRow.id = `row-${produit.produitID}`;

    newRow.insertCell(0).textContent = produit.nom;
    newRow.insertCell(1).textContent = produit.description;
    newRow.insertCell(2).textContent = produit.prix;
    newRow.insertCell(3).textContent = produit.stock;
}

function userChargerProduit(){
    fetch('/api/userProduit')
    .then(response => response.json())
    .then(produits => {
        console.log(produits); // Check what is returned by the server
        if (Array.isArray(produits)) {
            produits.forEach(produit => {
                userAjouterProduit(produit);
            });
        } else {
            console.error("La réponse n'est pas un tableau :", produits);
        }
    })
    .catch(error => {
        if (error.message === 'Failed to fetch') {
            console.error('Erreur : Impossible de se connecter au serveur.');
            alert('Le serveur est inaccessible. Vérifiez votre connexion ou réessayez plus tard.');
        } 
        else {
            // Gérer d'autres types d'erreurs
            console.log('Erreur lors de la récupération des inscriptions :', error)
            alert(`Une erreur s'est produite : ${error.message}`);
        }
    });
}

userTableProduit = document.getElementById("userTableProduit");

if(userTableProduit) {
    userChargerProduit();
} else {
    console.log("Aucune table avec ID 'userTableProduit'")
}


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