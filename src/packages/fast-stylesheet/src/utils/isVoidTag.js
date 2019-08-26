// todo: Add more tags
export const VOID_TAGS = [
  'input',
  'textarea',
  'img',
  'svg',
  'hr',
];

const isVoidTag = tag => VOID_TAGS.indexOf(tag) !== -1;

export default isVoidTag;
