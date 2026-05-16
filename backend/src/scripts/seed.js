import bcrypt from "bcryptjs";
import { connectDb, disconnectDb } from "../config/db.js";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { Hotel } from "../models/Hotel.js";
import { Room } from "../models/Room.js";

const PLACEHOLDER = (seed) => `https://picsum.photos/seed/${seed}/800/600`;

const HOTELS = [
  {
    name: "Bayview Boutique",
    city: "Lisbon",
    country: "Portugal",
    address: "R. da Misericórdia 12",
    starRating: 4,
    description:
      "A small boutique hotel near the river with a rooftop terrace and city views.",
    amenities: ["wifi", "breakfast", "parking", "pool"],
    rooms: [
      { roomType: "single", capacity: 1, pricePerNight: 90, quantity: 4 },
      { roomType: "double", capacity: 2, pricePerNight: 140, quantity: 6 },
      { roomType: "suite", capacity: 3, pricePerNight: 240, quantity: 2 },
    ],
  },
  {
    name: "Old Town Inn",
    city: "Lisbon",
    country: "Portugal",
    address: "Rua Augusta 200",
    starRating: 3,
    description: "Cosy, family-run inn in the heart of the old town.",
    amenities: ["wifi", "breakfast"],
    rooms: [
      { roomType: "single", capacity: 1, pricePerNight: 60, quantity: 6 },
      { roomType: "double", capacity: 2, pricePerNight: 95, quantity: 8 },
    ],
  },
  {
    name: "Harbour Grand",
    city: "Porto",
    country: "Portugal",
    address: "Cais da Ribeira 5",
    starRating: 5,
    description:
      "Five-star riverside hotel with a Michelin-starred restaurant and full spa.",
    amenities: ["wifi", "pool", "gym", "spa", "breakfast", "parking"],
    rooms: [
      { roomType: "double", capacity: 2, pricePerNight: 220, quantity: 10 },
      { roomType: "suite", capacity: 3, pricePerNight: 420, quantity: 4 },
      { roomType: "family", capacity: 5, pricePerNight: 520, quantity: 2 },
    ],
  },
  {
    name: "Atlantic Motel",
    city: "Porto",
    country: "Portugal",
    address: "Av. da Boavista 1500",
    starRating: 2,
    description: "Budget-friendly motel close to the airport.",
    amenities: ["wifi", "parking"],
    rooms: [
      { roomType: "double", capacity: 2, pricePerNight: 55, quantity: 12 },
      { roomType: "family", capacity: 4, pricePerNight: 95, quantity: 6 },
    ],
  },
  {
    name: "Highlands Lodge",
    city: "Edinburgh",
    country: "United Kingdom",
    address: "12 Royal Mile",
    starRating: 4,
    description:
      "Stone-built lodge a five minute walk from the castle. Includes a whisky bar.",
    amenities: ["wifi", "breakfast", "gym", "bar"],
    rooms: [
      { roomType: "single", capacity: 1, pricePerNight: 110, quantity: 5 },
      { roomType: "double", capacity: 2, pricePerNight: 175, quantity: 8 },
      { roomType: "suite", capacity: 3, pricePerNight: 290, quantity: 3 },
    ],
  },
  {
    name: "Loch View Hostel",
    city: "Edinburgh",
    country: "United Kingdom",
    address: "West Port 44",
    starRating: 2,
    description: "Lively hostel with shared kitchen and friendly staff.",
    amenities: ["wifi", "kitchen"],
    rooms: [
      { roomType: "single", capacity: 1, pricePerNight: 35, quantity: 10 },
      { roomType: "family", capacity: 4, pricePerNight: 110, quantity: 4 },
    ],
  },
];

async function seed() {
  await connectDb();
  console.log(`[seed] connected to ${env.mongoUri}`);

  await Promise.all([
    User.deleteMany({}),
    Hotel.deleteMany({}),
    Room.deleteMany({}),
  ]);
  console.log("[seed] cleared users, hotels, rooms");

  const passwordHash = await bcrypt.hash("Password1", env.bcryptRounds);
  const [owner, admin, alice, bob] = await User.create([
    { name: "Owner", email: "owner@example.com", passwordHash, role: "owner" },
    { name: "Admin", email: "admin@example.com", passwordHash, role: "admin" },
    { name: "Alice", email: "alice@example.com", passwordHash, role: "user" },
    { name: "Bob", email: "bob@example.com", passwordHash, role: "user" },
  ]);
  console.log(
    `[seed] users: ${owner.email}, ${admin.email}, ${alice.email}, ${bob.email} (password: Password1)`,
  );

  for (const data of HOTELS) {
    const priceFrom = Math.min(...data.rooms.map((r) => r.pricePerNight));
    const hotel = await Hotel.create({
      name: data.name,
      city: data.city,
      country: data.country,
      address: data.address,
      description: data.description,
      starRating: data.starRating,
      amenities: data.amenities,
      images: [PLACEHOLDER(`${data.name}-1`), PLACEHOLDER(`${data.name}-2`)],
      priceFrom,
    });
    await Room.insertMany(
      data.rooms.map((r, idx) => ({
        hotel: hotel._id,
        roomType: r.roomType,
        capacity: r.capacity,
        pricePerNight: r.pricePerNight,
        quantity: r.quantity,
        amenities: data.amenities.slice(0, 2),
        images: [PLACEHOLDER(`${data.name}-room-${idx}`)],
      })),
    );
    console.log(
      `[seed] hotel: ${hotel.name} (${hotel.city}) — ${data.rooms.length} room types`,
    );
  }

  await disconnectDb();
  console.log("[seed] done");
}

seed().catch(async (err) => {
  console.error("[seed] failed:", err);
  await disconnectDb().catch(() => {});
  process.exit(1);
});
