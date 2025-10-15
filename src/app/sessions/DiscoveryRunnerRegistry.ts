type Runner = {
  ask: (input: string) => Promise<string>;
};

class DiscoveryRunnerRegistry {
  private runners = new Map<string, Runner>();

  get(key: string): Runner | undefined {
    return this.runners.get(key);
  }

  set(key: string, runner: Runner): void {
    this.runners.set(key, runner);
  }

  delete(key: string): void {
    this.runners.delete(key);
  }
}

export const discoveryRunnerRegistry = new DiscoveryRunnerRegistry();


