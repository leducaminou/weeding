import { Gender, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seed en cours...");

  // ─── Admin ───
  const passwordHash = await bcrypt.hash("Azerty@123!", 12);
  const admin = await prisma.admin.upsert({
    where: { email: "admin@loica-franck.com" },
    update: {},
    create: {
      email: "admin@loica-franck.com",
      passwordHash,
      name: "Administrateur",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin :", admin.email);

  // ─── Wedding ───
  const wedding = await prisma.wedding.upsert({
    where: { slug: "loica-franck" },
    update: {
      heroImage: "/img1.webp",
    },
    create: {
      slug: "loica-franck",
      brideName: "Loïca",
      groomName: "Franck",
      weddingDate: new Date("2026-12-27T10:00:00Z"),
      tagline: "Ont la joie de vous inviter à célébrer leur union",
      heroImage: "/img1.webp",
      active: true,
    },
  });
  console.log("✅ Wedding :", wedding.slug);

  await prisma.guest.createMany({
    data: [
      {
        weddingId: wedding.id,
        gender: Gender.Mr,
        firstName: "TOUMI",
      },
      {
        weddingId: wedding.id,
        gender: Gender.Mme,
        firstName: "LIENOU",
        lastName: "Sandrine",
      },
      {
        weddingId: wedding.id,
        gender: Gender.Mme,
        firstName: "TOUMI",
        lastName: "Ange",
      },
      {
        weddingId: wedding.id,
        gender: Gender.Mr,
        firstName: "TCHUENTE",
        lastName: "Gilbert",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Mr,
        firstName: "WAMBO",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Mme,
        firstName: "WAMBO",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Mr,
        firstName: "TOUSSE",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Mme,
        firstName: "TOUSSE",
      },
      {
        weddingId: wedding.id,
        gender: Gender.Mr,
        firstName: "TCHATO",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Mme,
        firstName: "TCHATO",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Mr,
        firstName: "NKWAIN",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Mme,
        firstName: "NKWAIN",
      },
      {
        weddingId: wedding.id,
        firstName: "TCHUENTE",
        lastName: "MADELEINE",
      },

      {
        weddingId: wedding.id,
        firstName: "Colonel Durand",
        lastName: "CASTRO",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Mme,
        firstName: "Georgette",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Mme,
        firstName: "MOCTO",
      },
      {
        weddingId: wedding.id,
        gender: Gender.Mr,
        firstName: "MOCTO",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Mme,
        firstName: "JAVELOT",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Mme,
        firstName: "JAVELOT",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Mme,
        firstName: "CHRONE",
        lastName: "Véronique",
      },
      {
        weddingId: wedding.id,
        firstName: "PETROLEUM",
        lastName: "ENGINEER 1",
      },

      {
        weddingId: wedding.id,
        firstName: "PETROLEUM",
        lastName: "ENGINEER 2",
      },

      {
        weddingId: wedding.id,
        firstName: "Père Émile",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Mr,
        firstName: "Tankeu",
      },
      {
        weddingId: wedding.id,
        gender: Gender.Mme,
        firstName: "Tankeu",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Mr,
        firstName: "Kanmogne",
      },
      {
        weddingId: wedding.id,
        gender: Gender.Mme,
        firstName: "Kanmogne",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Mme,
        firstName: "Bogne",
        lastName: "Gaelle",
      },
      {
        weddingId: wedding.id,
        gender: Gender.Mr,
        firstName: "Bogne",
      },

      {
        weddingId: wedding.id,
        firstName: "Ella",
        lastName: "Paul",
      },
      {
        weddingId: wedding.id,
        firstName: "NTSAGUIM",
        lastName: "Robert",
      },

      {
        weddingId: wedding.id,
        firstName: "NTSAGUIM",
        lastName: "Fernande",
      },

      {
        weddingId: wedding.id,
        firstName: "NTSAGUIM",
        lastName: "Sophy",
      },

      {
        weddingId: wedding.id,
        firstName: "NTSAGUIM",
        lastName: "Martine",
      },
      {
        weddingId: wedding.id,
        firstName: "NTSAGUIM",
        lastName: "Teddy",
      },

      {
        weddingId: wedding.id,
        firstName: "NTSAGUIM",
        lastName: "Stephy",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Maitre,
        firstName: " TSAMO",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Mme,
        firstName: "TSAMO",
      },
      {
        weddingId: wedding.id,
        gender: Gender.Mr,
        firstName: "ASSOMO Amédée",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Mme,
        firstName: "ASSOMO",
        lastName: "Amédée",
      },

      {
        weddingId: wedding.id,
        firstName: "Tonnang",
        lastName: "Sophine",
      },

      {
        weddingId: wedding.id,
        firstName: "Fouelefack",
        lastName: "martine",
      },
      {
        weddingId: wedding.id,
        gender: Gender.Maitre,
        firstName: " Kengne",
        lastName: "Fabien",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Mme,
        firstName: "Kengne",
        lastName: "Fabien",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Mr,
        firstName: "DONGMO",
        lastName: "innocent",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Mme,
        firstName: "DONGMO",
        lastName: "innocent",
      },
      {
        weddingId: wedding.id,
        gender: Gender.Mr,
        firstName: "Tsamo",
        lastName: "Emile",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Mme,
        firstName: "Tsamo",
        lastName: "Emile",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Mr,
        firstName: "Kamdem",
        lastName: "Jean Paul",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Mme,
        firstName: "Kamdem",
        lastName: "Jean Paul",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Mr,
        firstName: "Nguimezap",
        lastName: "Paul",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Mme,
        firstName: "Nguimezap",
        lastName: "Paul",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Dr,
        firstName: "Tankoua",
      },

      {
        weddingId: wedding.id,
        gender: Gender.Mme,
        firstName: "Tankoua",
      },
    ],
  });

  await prisma.wishlistItem.createMany({
   
 data: [
      {
        weddingId: wedding.id,
        title: "Un congélateur",
        url: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6Cz3SRKVPcPZ37Ukxm6puywbOMI5v4FdX1laAq",
        image: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6Cz3SRKVPcPZ37Ukxm6puywbOMI5v4FdX1laAq",
      },
      {
        weddingId: wedding.id,
        title: "Une salle à manger de 6 places",
        url: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6C0X4fjR64MSkzibLZaT9vNPrCBAI5je1FdKH3",
        image: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6C0X4fjR64MSkzibLZaT9vNPrCBAI5je1FdKH3",
      },
      {
        weddingId: wedding.id,
        title: "Des couverts de services",
        url: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6C4b8Fu579KqcF7wkdHmh135MYUasnLfEe6Qvg",
        image: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6C4b8Fu579KqcF7wkdHmh135MYUasnLfEe6Qvg",
      },
      {
        weddingId: wedding.id,
        title: "Un téléviseur",
        url: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6CUxaekBQDlS3c4U5VTMtavrqBhxbO2y6mG1Y9",
        image: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6CUxaekBQDlS3c4U5VTMtavrqBhxbO2y6mG1Y9",
      },
      {
        weddingId: wedding.id,
        title: "Un Micro-onde",
        url: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6Cm47kHgTJlq3ihfM8S6KZAsvND9URw42CeW7g",
        image: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6Cm47kHgTJlq3ihfM8S6KZAsvND9URw42CeW7g",
      },
    
      {
        weddingId: wedding.id,
        title: "Une machine à Jus de fruits",
        url: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6CUMrXgyQDlS3c4U5VTMtavrqBhxbO2y6mG1Y9",
        image: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6CUMrXgyQDlS3c4U5VTMtavrqBhxbO2y6mG1Y9",
      },
      {
        weddingId: wedding.id,
        title: "Un frigo",
        url: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6ChD2th2iIANBMyJdxXKcrSDzOV752RP8UT4jm",
        image: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6ChD2th2iIANBMyJdxXKcrSDzOV752RP8UT4jm",
      },
      {
        weddingId: wedding.id,
        title: "Un salon avec table centrale",
        url: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6CTYw2YjDSKTjxc04fRCyDovr6LE15kANMmlaH",
        image: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6CTYw2YjDSKTjxc04fRCyDovr6LE15kANMmlaH",
      },
      {
        weddingId: wedding.id,
        title: "Des services de verres",
        url: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6CydKkFZVYXs03tj41mhck9oS6FClqWeG8zrxL",
        image: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6CydKkFZVYXs03tj41mhck9oS6FClqWeG8zrxL",
      },
      {
        weddingId: wedding.id,
        title: "Un kit de machine à écraser",
        url: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6CkgrAS8qJjgxYV0dn4SAwQEUvMLlPemtNoh71",
        image: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6CkgrAS8qJjgxYV0dn4SAwQEUvMLlPemtNoh71",
      },
      {
        weddingId: wedding.id,
        title: "Une table et chaise de bureau",
        url: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6CHX5iCIuol9rFoWKT4v3dDkBjZqc65zQSsguU",
        image: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6CHX5iCIuol9rFoWKT4v3dDkBjZqc65zQSsguU",
      },
      {
        weddingId: wedding.id,
        title: "Des marmites et poêles",
        url: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6ClZGkRyeYj65uB2GfxwdzALmg3hIqaroJ0eP1",
        image: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6ClZGkRyeYj65uB2GfxwdzALmg3hIqaroJ0eP1",
      },
      {
        weddingId: wedding.id,
        title: "Un disque dur externe 2 To",
        url: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6CKEg7wddH4f8MEWjCPd5za7BtlLZ3OnJgrAI0",
        image: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6CKEg7wddH4f8MEWjCPd5za7BtlLZ3OnJgrAI0",
      },
      {
        weddingId: wedding.id,
        title: "Une machine à laver",
        url: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6CSfqfD3mQp8AeNsgJm4kDZu0rjYFTKRVtBvXf",
        image: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6CSfqfD3mQp8AeNsgJm4kDZu0rjYFTKRVtBvXf",
      },
      {
        weddingId: wedding.id,
        title: "Un regulateur de tension 2000 VA",
        url: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6CpTHdLzlRj8euWoQD0btCLEYPhKpOfVM6B59y",
        image: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6CpTHdLzlRj8euWoQD0btCLEYPhKpOfVM6B59y",
      },
      {
        weddingId: wedding.id,
        title: "Un kit pour hygiène domestique",
        url: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6CCDqoaXS8SsEq0kvi5zfG6eINdgoPuWLFUOwK",
        image: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6CCDqoaXS8SsEq0kvi5zfG6eINdgoPuWLFUOwK",
      },
      {
        weddingId: wedding.id,
        title: "3 climatiseurs",
        url: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6C7lgrzQUGNzg6Ek9x54IeioFCPvmKqfc2ZUlA",
        image: "https://gmdsoqjovj.ufs.sh/f/vTlVBzpXla6C7lgrzQUGNzg6Ek9x54IeioFCPvmKqfc2ZUlA",
      },
    ]

  })
console.log("✅ WishList 666666666");
  // ─── Events ───
  await prisma.event.deleteMany({ where: { weddingId: wedding.id } });
  await prisma.event.createMany({
    data: [
      {
        weddingId: wedding.id,
        title: "Mariage traditionnel",
        description:
          "Célébration traditionnelle où les deux familles s'unissent pour sceller l'union.",
        date: new Date("2026-12-27T10:00:00Z"),
        time: "10h00",
        endTime: "18h00",
        location: "Dschang — Bafou",
        address: "Dschang, Bafou, Cameroun",
        mapsUrl: "https://maps.app.goo.gl/LVmNCmad44nbQJUj6",
        position: 0,
        dressCode: "Bleu & Blanc",
        dressCodeNote:
          "Nous vous invitons à porter des tenues élégantes dans ces tons, pour une harmonie parfaite sur les photos de cette journée traditionnelle.",
      },
      {
        weddingId: wedding.id,
        title: "Mariage Civil",
        description:
          "Célébration officielle de l'union devant l'officier d'état civil.",
        date: new Date("2026-12-29T10:00:00Z"),
        time: "10h00",
        location: "Bangou — Le Tagidor",
        address: "Rte Bangou, Bangou, Région de l'Ouest, Cameroun",
        mapsUrl:
          "https://maps.google.com/?q=Le+Tagidor+Garden+Resort+%26+Spa+Bangou",
        position: 1,
        photoSession: "1h de séance photo",
      },
      {
        weddingId: wedding.id,
        title: "Mariage Religieux",
        description: "Cérémonie religieuse célébrant l'union devant Dieu.",
        date: new Date("2026-12-29T14:00:00Z"),
        time: "14h00",
        location: "Paroisse catholique Saint Gilbert de Bangou- Situé 500m du Tagidor (15min en voiture) ",
        address: "Rte Bangou, Bangou, Région de l'Ouest, Cameroun",
        mapsUrl:
          "https://maps.google.com/?q=Paroisse+catholique+Saint+Gilbert+de+Bangou",
        position: 2,
        photoSession: "1h de séance photo",
      },
      {
        weddingId: wedding.id,
        title: "Vin d'honneur",
        description: "Cocktail de célébration en l'honneur des mariés.",
        date: new Date("2026-12-29T17:00:00Z"),
        time: "17h00",
        location: "Bangou — Le Tagidor",
        address: "Rte Bangou, Bangou, Région de l'Ouest, Cameroun",
        mapsUrl:
          "https://maps.google.com/?q=Le+Tagidor+Garden+Resort+%26+Spa+Bangou",
        position: 3,
      },
    ],
  });
  console.log("✅ 4 événements");

  // ─── Accommodations ───
  await prisma.accommodation.deleteMany({ where: { weddingId: wedding.id } });
  await prisma.accommodation.createMany({
    data: [
      {
        weddingId: wedding.id,
        name: "Le Tagidor",
        address: "Rte Bangou, Bangou, Région de l'Ouest, Cameroun",
        phones: ["+237 6 93 33 33 07", "+237 6 58 08 93 73"],
        position: 0,
      },
      {
        weddingId: wedding.id,
        name: "Hôtel de la Paix — Bangou",
        address: "En bordure de la route principale, axe Bangou–Bafang",
        phones: ["+237 6 98 71 21 00", "+237 6 79 26 85 67"],
        position: 1,
      },
      {
        weddingId: wedding.id,
        name: "Centre d'accueil de Bangou",
        address: "Route principale de Bangou",
        phones: ["+237 6 77 69 90 37"],
        position: 2,
      },
      {
        weddingId: wedding.id,
        name: "Centre Touristique Tockem",
        address: "Chefferie Ntsingbeu, Bafou",
        phones: ["+237 6 90 61 64 73"],
        position: 3,
      },
      {
        weddingId: wedding.id,
        name: "Hôtel de Malte — Dschang",
        address: "Quartier Administratif, Dschang, Cameroun",
        phones: ["+237 6 99 04 01 37"],
        position: 4,
      },
      {
        weddingId: wedding.id,
        name: "Constellation Hotel — Dschang",
        address: "Centre-ville, en face de la Commercial Bank, Dschang",
        phones: ["+237 6 57 61 90 91"],
        position: 5,
      },
    ],
  });
  console.log("✅ 6 hébergements");

  // ─── Gallery (avec les 4 images du couple) ───
  await prisma.galleryItem.deleteMany({ where: { weddingId: wedding.id } });
  await prisma.galleryItem.createMany({
    data: [
      {
        weddingId: wedding.id,
        url: "/img1.webp",
        alt: "Loïca & Franck — portrait principal",
        position: 0,
        active: true,
      },
      {
        weddingId: wedding.id,
        url: "/img2.webp",
        alt: "Loïca & Franck",
        position: 1,
        active: true,
      },
      {
        weddingId: wedding.id,
        url: "/img3.webp",
        alt: "Loïca & Franck",
        position: 2,
        active: true,
      },
      {
        weddingId: wedding.id,
        url: "/img4.webp",
        alt: "Loïca & Franck",
        position: 3,
        active: true,
      },
    ],
  });
  console.log("✅ 4 images galerie");

  // ─── Site Settings ───
  const settings = [
    { key: "final_message_title", value: "AVEC TOUTE NOTRE AFFECTION" },
    {
      key: "final_message_body",
      value:
        "Loïca & Franck\n\nseront heureux de partager avec vous\nces précieux moments qui marqueront\nle début de leur nouvelle vie à deux.\n\nVotre présence sera leur plus beau cadeau.",
    },
    {
      key: "whatsapp_guest_template",
      value:
        "Bonjour {prenom},\n\nVotre présence au mariage de Loïca & Franck est bien confirmée.\n\nVotre identifiant invité :\n*{identifier}*\n\nVoici votre QR Code personnel :\n{qr_url}\n\nMerci de le conserver précieusement pour le jour du mariage.",
    },
    {
      key: "whatsapp_admin_template",
      value:
        "Nouvelle confirmation de présence.\n\nNom : {nom}\nIdentifiant : {identifier}\n\nCette personne sera présente au mariage.",
    },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { weddingId_key: { weddingId: wedding.id, key: s.key } },
      update: { value: s.value },
      create: { ...s, weddingId: wedding.id },
    });
  }
  console.log(`✅ ${settings.length} paramètres`);

  // ─── WhatsAppConfig ───
  await prisma.whatsAppConfig.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
  console.log("✅ Config WhatsApp");

  console.log("🎉 Seed terminé.");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
