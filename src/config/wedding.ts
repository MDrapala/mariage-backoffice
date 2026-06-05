// Informations du mariage — miroir de wedding/src/config/wedding.ts
export const WEDDING = {
  bride: "Lénaelle",
  groom: "Mathieu",
  date: "2027-08-07T00:00:00+02:00",
  accessCode: "07/08/2027",
  venue: {
    name: "Maison Jenny",
    address:
      "84 rue de Hegenheim, 68220 Hagenthal-le-Bas — Voegtlinshoffen, 68420, France",
    coordinates: { lat: 48.8219622, lng: 2.358207 },
  },
  cityHall: {
    name: "Mairie de Voegtlinshoffen",
    address: "1 Rue de l'Église, 68420 Voegtlinshoffen",
    coordinates: { lat: 48.0257946, lng: 7.2245873 },
  },
  contacts: {
    groom: { name: "Mathieu", phone: "06 28 73 61 95" },
    bride: { name: "Lénaelle", phone: "06 04 49 19 25" },
  },
  siteUrl: "https://mariage-lenaelle-mathieu.fr",
} as const;

export function daysUntilWedding(from: Date = new Date()): number {
  const target = new Date(WEDDING.date).getTime();
  const diff = target - from.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
