

## Mise a jour des metadonnees du Wird Tidjane dans books.ts

### Contexte

La table des matieres du lecteur est generee automatiquement a partir des champs `chapter` et `heading` dans `wirdTidjaneSections` (wird-tidjane.ts). Elle affiche deja correctement les 15 sections regroupees en 5 chapitres : Conditions, Le Lazim, La Wazifa, Le Dhikr du vendredi, Devoirs, et Reparation.

La seule mise a jour necessaire concerne les metadonnees du livre dans `books.ts`.

### Modifications

**Fichier : `src/data/books.ts`** (entree id "11")

1. **Nombre de pages** : passer de `pages: 10` a `pages: 15` pour correspondre aux 15 sections actuelles du contenu.

2. **Description enrichie** : mettre a jour la description pour mieux refleter les sous-sections cles ajoutees (Al-Fatiha, Istighfar, Salatul-Fatihi, Jawharatul-Kamal, Zikru Juma) :

```
"Le Wird Tidjane -- Les 23 conditions de la voie, le Lazim (Al-Fatiha, Istighfar, Salatul-Fatihi, Tahlil), la Wazifa (Jawharatul-Kamal), le Dhikr du vendredi (Zikru Juma), les devoirs collectifs et les regles de reparation (Niya Jabr). Un guide complet pour la pratique quotidienne de la Tariqa Tijaniyya."
```

3. **Tags** : ajouter "Jawharatul-Kamal" et "Salatul-Fatihi" pour ameliorer la recherche :

```
tags: ["Wird", "Dhikr", "Pratique", "Tarbiyya", "Jawharatul-Kamal", "Salatul-Fatihi"]
```

### Impact

- La fiche du livre dans la bibliotheque affichera une description plus precise
- Le nombre de pages refletera le contenu reel
- Les tags supplementaires amelioreront la decouverte du livre via la recherche

