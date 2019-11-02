const LETTERS = [
  [/ą/g, 'a'], [/Ą/g, 'A'],
  [/ć/g, 'c'], [/Ć/g, 'C'],
  [/ę/g, 'e'], [/Ę/g, 'E'],
  [/ł/g, 'l'], [/Ł/g, 'L'],
  [/ń/g, 'n'], [/Ń/g, 'N'],
  [/ó/g, 'o'], [/Ó/g, 'O'],
  [/ś/g, 's'], [/Ś/g, 'S'],
  [/ż/g, 'z'], [/Ź/g, 'Z'],
  [/ź/g, 'z'], [/Ż/g, 'Z'],
];

const escapeDiacritics = (str) => {
  let unescaped = str;

  for (let i = LETTERS.length - 1; i >= 0; --i) {
    const template = LETTERS[i];
    unescaped = unescaped.replace(template[0], template[1]);
  }

  return unescaped;
};

export default escapeDiacritics;
