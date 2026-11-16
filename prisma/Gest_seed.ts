



je veux que tu ajouet seed  dans le tableau Guest avec la même structure que les objets déjà présents (firstName et lastName). 

sur le nom tu ajoute Mme, ou Mr et Me, Mlle si le prefixe est sur la liste, sinon n'ajoute aucun prefixe


lorsque tu as Mr/Mme sur un même nom, tu dois 
créer deux objets dans le tableau Guest, un pour Mr et un pour Mme.


ne seed pas les data dans la bd. ajoute juste au seed. 

1 M/Mme TOUMI
2 Mme LIENOU Sandrine 
3 Mme TOUMI Ange
4 M. TCHUENTE Gilbert 
5 M/Mme WAMBO
6 M/Mme TOUSSE 
7 M/Mme TCHATO 
8 M/Mme NKWAIN
9 TCHUENTE MADELEINE
10 Colonel Durand CASTRO
11 Mme Georgette 
12 M/Mme MOCTO
13 M/Mme JAVELOT
14 Mme CHRONE Véronique 
15 PETROLEUM ENGINEER 1
16 PETROLEUM ENGINEER 2
17 Père Émile
18 M/Mme Tankeu
19 M JEFF
20 M/Mme Kanmogne 
21 M/Mme Bogne Gaelle 
22 M Ella Paul

1 NTSAGUIM Robert
2 NTSAGUIM Fernande 
3 Ntsaguim Sophy 
4 Ntsaguim Martine
5 NTSAGUIM Teddy
6 NTSAGUIM Stephy 
7 Me TSAMO et Mme 
8 Mr/Mme ASSOMO Amédée 
9 Tonnang Sophine
10 Fouelefack martine 
11 Maître Kengne Fabien et Mme
12 Mr/Mme DONGMO innocent 
13 Mr/Mme Tsamo Emile
14 Mr/Mme Kamdem Jean Paul 
15 Mr/Mme Nguimezap Paul 
16 Dr Tankoua et Mme 


model Guest {
  id        String   @id @default(cuid())
  weddingId String
  firstName String
  lastName  String
  phone     String?
  email     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  wedding    Wedding     @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  invitation Invitation?

  @@index([weddingId])
  @@index([lastName, firstName])
  @@map("guests")
}



je ne veux aucune analyse des model dans le schema prisma ni aucune autre analyse. ajout les data conferment