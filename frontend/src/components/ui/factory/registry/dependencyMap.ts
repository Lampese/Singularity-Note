export const FACTORY_DEPENDENCY_MAP = {
  control_core: [],
  button_factory_group: ["control_core"],
  input_factory_group: ["control_core"],
  list_factory_group: ["control_core"],
  overlay_factory_group: [
    "control_core",
    "button_factory_group",
    "input_factory_group",
  ],
} as const;

export type FactoryGroupName = keyof typeof FACTORY_DEPENDENCY_MAP;

export type FactoryDependencyMap = Record<FactoryGroupName, readonly FactoryGroupName[]>;

function visit(
  node: FactoryGroupName,
  map: FactoryDependencyMap,
  visiting: Set<FactoryGroupName>,
  visited: Set<FactoryGroupName>,
  stack: FactoryGroupName[],
  cycles: FactoryGroupName[][],
) {
  if (visited.has(node)) return;
  if (visiting.has(node)) {
    const cycleStart = stack.indexOf(node);
    cycles.push(stack.slice(cycleStart).concat(node));
    return;
  }

  visiting.add(node);
  stack.push(node);

  for (const dep of map[node]) {
    visit(dep, map, visiting, visited, stack, cycles);
  }

  stack.pop();
  visiting.delete(node);
  visited.add(node);
}

export function detectDependencyCycles(
  map: FactoryDependencyMap = FACTORY_DEPENDENCY_MAP,
): FactoryGroupName[][] {
  const visiting = new Set<FactoryGroupName>();
  const visited = new Set<FactoryGroupName>();
  const stack: FactoryGroupName[] = [];
  const cycles: FactoryGroupName[][] = [];

  for (const node of Object.keys(map) as FactoryGroupName[]) {
    visit(node, map, visiting, visited, stack, cycles);
  }

  return cycles;
}

export function assertNoDependencyCycles(
  map: FactoryDependencyMap = FACTORY_DEPENDENCY_MAP,
): void {
  const cycles = detectDependencyCycles(map);
  if (cycles.length > 0) {
    const cycleText = cycles.map((cycle) => cycle.join(" -> ")).join("; ");
    throw new Error(`Factory dependency cycle detected: ${cycleText}`);
  }
}
