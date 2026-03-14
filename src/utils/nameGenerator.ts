const normalizeName = (value: string) => value.trim().toLowerCase();

const capitalize = (value: string) =>
  value.length > 0 ? value[0].toUpperCase() + value.slice(1).toLowerCase() : '';

export const generateBabyNames = (fatherName: string, motherName: string): string[] => {
  const father = normalizeName(fatherName);
  const mother = normalizeName(motherName);

  if (!father || !mother) {
    return [];
  }

  const fatherHalf = father.slice(0, Math.max(2, Math.ceil(father.length / 2)));
  const motherHalf = mother.slice(Math.floor(mother.length / 2));
  const motherHalfFront = mother.slice(0, Math.max(2, Math.ceil(mother.length / 2)));
  const fatherHalfBack = father.slice(Math.floor(father.length / 2));

  const raw = [
    fatherHalf + motherHalf,
    father + motherHalf.slice(-2),
    motherHalfFront + fatherHalfBack,
    mother + father.slice(-1),
    father[0] + mother,
    mother[0] + father,
  ];

  return Array.from(new Set(raw.map(capitalize).filter((name) => name.length >= 3))).slice(0, 8);
};
