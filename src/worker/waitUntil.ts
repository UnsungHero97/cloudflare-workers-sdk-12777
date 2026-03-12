async function sleep(ms = 1000) :Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export default async function waitUntil(
  condition :() => Promise<boolean>,
  options :{ ms ?:number; max ?:number },
) :Promise<void> {
  // TODO - try/catch
  const { ms = 1000, max = 1000 } = options;
  let elapsed = 0;
  while (elapsed < max) {
    if (await condition()) {
      break;
    }
    await sleep(ms);
    elapsed += ms;
  }
}
