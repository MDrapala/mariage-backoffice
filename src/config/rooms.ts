// Options proposées dans les listes déroulantes du formulaire de chambre.
// L'utilisateur peut aussi saisir une valeur libre dans les champs texte.

export const ROOM_CATEGORIES = [
  "standard",
  "supérieure",
  "familiale",
  "privilège junior",
  "suite nuptiale",
  "single",
] as const;

export const ROOM_FLOORS = [
  "-1 (sous open space)",
  "-1",
  "rez de chaussée",
  "1",
  "2",
] as const;

export const ROOM_SIDES = ["jardin", "rue", "rue / jardin"] as const;

export const ROOM_BATHROOMS = [
  "douche",
  "baignoire",
  "douche + baignoire",
] as const;

export const ROOM_FLOORINGS = [
  "PARQUET",
  "MOQUETTE",
  "PARQUET + MOQUETTE",
] as const;

export const ASSIGNMENT_STATUSES = ["provisoire", "confirmée"] as const;
