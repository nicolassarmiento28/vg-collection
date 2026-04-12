type EnvMap = Record<string, string | undefined>

function getEnvMap(): EnvMap {
  const processLike = (globalThis as { process?: { env?: EnvMap } }).process
  return processLike?.env ?? {}
}

export function getServerEnv(name: string): string | undefined {
  return getEnvMap()[name]
}

export function setServerEnvForTests(name: string, value: string | undefined): void {
  const processLike = (globalThis as { process?: { env?: EnvMap } }).process

  if (!processLike || !processLike.env) {
    return
  }

  processLike.env[name] = value
}
