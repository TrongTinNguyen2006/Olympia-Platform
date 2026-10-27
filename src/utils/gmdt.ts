export function removeVietnameseAccents(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export function cleanStringForGMDT(str: string): string {
  const unaccented = removeVietnameseAccents(str);
  return unaccented.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function textToGmdtMatMa(rawAnswer: string): { cleanAnswer: string; matMa: string } {
  const cleanAnswer = cleanStringForGMDT(rawAnswer);
  const keypadMap: Record<string, string> = {
    A: '1', B: '1', C: '1',
    D: '2', E: '2', F: '2',
    G: '3', H: '3', I: '3',
    J: '4', K: '4', L: '4',
    M: '5', N: '5', O: '5',
    P: '6', Q: '6', R: '6',
    S: '7', T: '7',
    U: '8', V: '8',
    W: '9', X: '9',
    Y: '0', Z: '0'
  };
  let matMa = '';
  for (const ch of cleanAnswer) {
    if (keypadMap[ch]) {
      matMa += keypadMap[ch];
    } else if (/[0-9]/.test(ch)) {
      matMa += ch;
    }
  }
  return { cleanAnswer, matMa };
}
