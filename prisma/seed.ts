import { PrismaClient } from "@prisma/client";
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
        description: "Célébration officielle de l'union devant l'officier d'état civil.",
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
        location: "Bangou — Le Tagidor",
        address: "Rte Bangou, Bangou, Région de l'Ouest, Cameroun",
        mapsUrl:
          "https://maps.google.com/?q=Le+Tagidor+Garden+Resort+%26+Spa+Bangou",
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