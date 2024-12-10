ajoutProduitForm = document.getElementById("ajoutProduitForm")

if(ajoutProduitForm) {
    ajoutProduitForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const produit = {
            nom: document.getElementById("nom").value,
            description: document.getElementById("description").value,
            prix: document.getElementById("prix").value,
            stock: document.getElementById("stock").value
        }

        if (!produit.nom || !produit.description || !produit.prix || !produit.stock) {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        if (!validePrix(produit.prix)) {
            alert("Le prix saisi doit respecter le format suivant: 10 , 3.99 , 129.19");
        }

        if (!valideQuantite(produit.stock)) {
            alert("La quantité saisi doit être un entier.");
        }

        console.log("Tentative d'enregistrement du produit: ", produit)
        enregistrerProduit(produit);
    });
} else {
    console.log("Aucun formulaire avec ID 'ajoutProduitForm' sur cette page.");
}

function enregistrerProduit(produit) {
    fetch('/api/produit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produit)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.message || 'Une erreur est survenue.');
            });
        }
        return response.json();
    })
    .then(produits => {
        console.log(produits); // Check what is returned by the server
        if (Array.isArray(produits)) {
            produits.forEach(produit => {
                ajouterProduit(produit);
                document.getElementById("ajoutProduitForm").reset();
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
            console.error('Erreur lors de l\'ajout du produit.:', error);
            alert(`Une erreur s'est produite : ${error.message}`);
        }
    });
}

function ajouterProduit(produit) {
    let table = document.getElementById("tableProduit");
    let newRow = table.insertRow();
    newRow.id = `row-${produit.produitID}`;

    newRow.insertCell(0).textContent = produit.nom;
    newRow.insertCell(1).textContent = produit.description;
    newRow.insertCell(2).textContent = produit.prix;
    newRow.insertCell(3).textContent = produit.stock;

    let actionsCell = newRow.insertCell(4);

    // Bouton "Modifier"
    let editButton = document.createElement("button");
    editButton.className = "button is-warning is-small";
    editButton.textContent = "Modifier";

    // Bouton "Supprimer"
    let deleteButton = document.createElement("button");
    deleteButton.className = "button is-danger is-small";
    deleteButton.textContent = "Supprimer";

    deleteButton.onclick = function() {
        supprimerProduit(produit.produitID, newRow);
    };

    editButton.onclick = function() {
        activerModeEdition(produit.produitID, newRow);
    };

    actionsCell.appendChild(editButton);
    actionsCell.appendChild(deleteButton);

    document.getElementById("ajoutProduitForm").reset();
}

function chargerProduit(){
    fetch('/api/produit')
    .then(response => response.json())
    .then(produits => {
        console.log(produits); // Check what is returned by the server
        if (Array.isArray(produits)) {
            produits.forEach(produit => {
                ajouterProduit(produit);
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

tableProduit = document.getElementById("tableProduit");

if(tableProduit) {
    chargerProduit();
} else {
    console.log("Aucune table avec ID 'tableProduit'")
}

function supprimerProduit(produitID, row) {
    fetch(`/api/produit/${produitID}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (response.status === 404) {
            alert("Le que vous essayez de supprimer n'existe pas.");
        } else if (response.ok) {
            row.remove();
        }
    })
    .catch(error => {
        if (error.message === 'Failed to fetch') {
            console.error('Erreur : Impossible de se connecter au serveur.');
            alert('Le serveur est inaccessible. Vérifiez votre connexion ou réessayez plus tard.');
        } 
        else {
            // Gérer d'autres types d'erreurs
            console.error('Erreur lors de la suppression :', error);   
            alert(`Une erreur s'est produite : ${error.message}`);
        }
    });  
}

/*
// Fonction pour activer le mode édition sur une ligne de tableau
function activerModeEdition(row, id) {
    // Récupérer les valeurs actuelles
    const nom = row.cells[0].textContent;
    const description = row.cells[1].textContent;
    const prix = row.cells[2].textContent;
    const quantite = row.cells[3].textContent;

    // Transformer chaque cellule en champ de saisie
    row.cells[0].innerHTML = `<input type="text" value="${nom}" class="input is-small">`;
    row.cells[1].innerHTML = `<input type="text" value="${description}" class="input is-small">`;
    row.cells[2].innerHTML = `<input type="email" value="${prix}" class="input is-small">`;
    row.cells[3].innerHTML = `<input type="text" value="${quantite}" class="input is-small">`;

    // Remplacer les boutons d'action par un bouton "Enregistrer"
    const actionsCell = row.cells[4];
    actionsCell.innerHTML = "";  // Efface le contenu actuel

    let saveButton = document.createElement("button");
    saveButton.className = "button is-primary is-small";
    saveButton.textContent = "Enregistrer";

    saveButton.onclick = function() {
        enregistrerModification(row, id);
    };

    actionsCell.appendChild(saveButton);
}

// Fonction pour enregistrer les modifications et quitter le mode édition
function enregistrerModification(row, id) {
    // Récupérer les valeurs des champs de saisie
    const nom = row.cells[0].querySelector("input").value;
    const description = row.cells[1].querySelector("input").value;
    const prix = row.cells[2].querySelector("input").value;
    const quantite = row.cells[3].querySelector("input").value;

    if (!nom) {
        alert("Assurez-vous d'indiquer un nom.");
        return;
    }

    if (!description) {
        alert("Assurez-vous d'indiquer un prénom.");
        return;
    }

    if (!prix) {
        alert("Assurez-vous d'indiquer une adresse mail.");
        return;
    }

    if (!quantite) {
        alert("Assurez-vous d'indiquer un numéro de téléphone.");
        return;
    }

    if (!validePrix(prix)) {
        alert("Le prix saisi doit respecter le format suivant: 10 , 3.99 , 129.19");
    }

    if (!valideQuantite(quantite)) {
        alert("La quantité saisi doit être un entier.");
    }

    // Mettre à jour l'affichage des cellules avec les nouvelles valeurs
    row.cells[0].textContent = nom;
    row.cells[1].textContent = description;
    row.cells[2].textContent = prix;
    row.cells[3].textContent = quantite;

    // Remettre les boutons "Modifier" et "Supprimer" dans la cellule des actions
    const actionsCell = row.cells[4];
    actionsCell.innerHTML = "";

    let editButton = document.createElement("button");
    editButton.className = "button is-warning is-small";
    editButton.textContent = "Modifier";
    editButton.onclick = function() {
        activerModeEdition(row, id);
    };

    let deleteButton = document.createElement("button");
    deleteButton.className = "button is-danger is-small";
    deleteButton.textContent = "Supprimer";
    deleteButton.onclick = function() {
        supprimerProduit(id, row);
    };

    actionsCell.appendChild(editButton);
    actionsCell.appendChild(deleteButton);

    // Envoyer les modifications au serveur
    updateInscription(id, { nom, description, prix, quantite });
}

// Fonction pour envoyer la requête PUT au serveur et mettre à jour l'inscription
function updateProduit(produitID, produit) {
    fetch(`/api/inscriptions/${produitID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produit)
    })
    .then(response => {
        if (!response.ok) {
            console.log('Erreur lors de la mise à jour de l\'inscription :', response.statusText);
        }
    })
    .then(produit => {
        // assuming 'produit' is an object, not an array
        console.log(produit);
        if (produit && produit.nom) {
            // Perform actions on the returned product
            console.log('Produit mis à jour:', produit);
        } else {
            console.error("Le produit n'a pas été mis à jour.");
        }
    })    
    .catch(error => {
        if (error.message === 'Failed to fetch') {
            console.error('Erreur : Impossible de se connecter au serveur.');
            alert('Le serveur est inaccessible. Vérifiez votre connexion ou réessayez plus tard.');
        } 
        else {
            // Gérer d'autres types d'erreurs
            console.log('Erreur lors de la requête de mise à jour :', error);
            alert(`Une erreur s'est produite : ${error.message}`);
        }
    }); 
}


*/

// Liste des users

/*
* Route GET /api/utilisateur
* Cette route ajoute des utilisateur a la table "tableUtilisateur"
*/

function ajouterUser(user) {
    let table = document.getElementById("tableUtilisateur");
    let newRow = table.insertRow();
    newRow.id = `row-${user.userID}`;

    newRow.insertCell(0).textContent = user.adresseID;
    newRow.insertCell(1).textContent = user.prenom;
    newRow.insertCell(2).textContent = user.nom;
    newRow.insertCell(3).textContent = user.email;
    newRow.insertCell(4).textContent = user.numTelephone;
    newRow.insertCell(5).textContent = user.motDePasse;
    newRow.insertCell(6).textContent = user.accepteComptant;
    newRow.insertCell(7).textContent = user.accepteInteract;
    newRow.insertCell(8).textContent = user.estMajeur;
}

function chargerUser(){
    fetch('/api/utilisateur')
    .then(response => response.json())
    .then(utilisateurs => {
        console.log(utilisateurs); // Check what is returned by the server
        if (Array.isArray(utilisateurs)) {
            utilisateurs.forEach(utilisateur => {
                ajouterUser(utilisateur);
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

tableUtilisateur = document.getElementById("tableUtilisateur");

if(tableUtilisateur) {
    chargerUser();
} else {
    console.log("Aucune table avec ID 'tableUtilisateur'")
}

// Listes des commandes

/*
* Route GET /api/commandeLivre
* Cette route ajoute des commandes a la table "tableCommandeLivre" 
*/


/*
* Route GET /api/commandeEnCours
* Cette route ajoute des utilisateur a la table "tableCommandeEnCours"
*/
function ajouterCommandeEnCours(commande) {
    let table = document.getElementById("tableCommandeEnCours");
    let newRow = table.insertRow();
    newRow.id = `row-${commande.commandeID}`;

    newRow.insertCell(0).textContent = commande.commandeID;
    newRow.insertCell(1).textContent = commande.userID;
    newRow.insertCell(2).textContent = commande.dateCommande;
    newRow.insertCell(3).textContent = commande.dateLivraison;
    newRow.insertCell(4).textContent = commande.estLivre;
}

function chargerCommandeEnCours(){
    fetch('/api/commandeEnCours')
    .then(response => response.json())
    .then(commandes => {
        console.log(commandes); // Check what is returned by the server
        if (Array.isArray(commandes)) {
            commandes.forEach(commande => {
                ajouterCommandeEnCours(commande);
            });
        } else {
            console.error("La réponse n'est pas un tableau :", commandes);
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

tableCommandeEnCours = document.getElementById("tableCommandeEnCours");

if(tableCommandeEnCours) {
    chargerCommandeEnCours();
} else {
    console.log("Aucune table avec ID 'tableCommandeEnCours'")
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