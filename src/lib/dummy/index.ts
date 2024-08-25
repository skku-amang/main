export const generateDummys = <T>(count: number, createFn: (id: number) => T): T[] => {
  return Array.from({ length: count }, (_, index) => createFn(index + 1));
};