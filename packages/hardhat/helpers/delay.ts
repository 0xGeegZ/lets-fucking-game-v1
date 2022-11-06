export const delay = async (ms: number) =>
  // eslint-disable-next-line promise/param-names
  new Promise((res) => setTimeout(res, ms))
