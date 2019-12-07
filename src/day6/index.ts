type Orbit = [string, string];
interface Planet {
  id: string;
  child?: string;
  parents: string[];
}

interface OrbitGraph {
  [id: string]: Planet;
}

const createPlanet = (id: string): Planet => ({
  id,
  parents: []
});

const buildGraph = (orbits: Orbit[], graph: OrbitGraph) => {
  if (orbits.length === 0) {
    return graph;
  }

  const [thingBeingOrbitedId, planetId] = orbits[0];

  let planet = graph[planetId];
  if (planet == null) {
    planet = createPlanet(planetId);
    graph[planetId] = planet;
  }
  planet.child = thingBeingOrbitedId;

  let thingBeingOrbited = graph[thingBeingOrbitedId];
  if (thingBeingOrbited == null) {
    thingBeingOrbited = createPlanet(thingBeingOrbitedId);
    graph[thingBeingOrbitedId] = thingBeingOrbited;
  }
  thingBeingOrbited.parents.push(planetId);

  return buildGraph(orbits.slice(1), graph);
};

const countDirect = (graph: OrbitGraph): number => Object.keys(graph).length;

const countIndirectPlanet = (planetId: string, graph: OrbitGraph): number => {
  let currId = planetId;
  let count = -1;

  while (currId !== "COM" && currId != null) {
    const currPlanet = graph[currId];
    count += 1;

    currId = currPlanet.child;
  }

  return count;
};

const countIndirect = (graph: OrbitGraph): number =>
  Object.keys(graph)
    .map(id => countIndirectPlanet(id, graph))
    .reduce((acc, n) => acc + n, 0);

const parseInput = (input: string): Orbit[] =>
  input
    .trim()
    .split("\n")
    .map(s => s.split(")") as Orbit);

export const solveP1 = (input: string): number => {
  const orbits = parseInput(input);
  const graph = buildGraph(orbits, {});

  const direct = countDirect(graph);
  const indirect = countIndirect(graph);

  return direct + indirect;
};

const findPathBetween = (graph: OrbitGraph, start: string, end: string) => {
  const planetIds: Map<string, number> = new Map();
  planetIds.set(start, 0);

  const unvisited: string[] = [start];

  while (unvisited.length !== 0) {
    const planetId = unvisited[0];
    const planet = graph[planetId];

    // traverse to child and parent of current planet
    for (const linked of [planet.child, ...planet.parents].filter(Boolean)) {
      if (!planetIds.has(linked)) {
        if (!unvisited.includes(linked)) {
          planetIds.set(linked, planetIds.get(planetId)! + 1);
          unvisited.push(linked);
        }
      }
    }

    unvisited.shift();
  }

  const path: string[] = [];
  let current = end;
  while (current !== start) {
    path.push(current);

    const planet = graph[current];

    let bestNeighbour = current;
    let bestScore = planetIds.get(planet.id);

    for (const linked of [planet.child, ...planet.parents].filter(Boolean)) {
      const score = planetIds.get(linked) ?? Infinity;
      if (score < bestScore) {
        bestScore = score;
        bestNeighbour = linked;
      }
    }

    current = bestNeighbour;
  }

  return path;
};

export const solveP2 = (input: string) => {
  const orbits = parseInput(input);
  const graph = buildGraph(orbits, {});

  const path = findPathBetween(graph, "YOU", "SAN");
  return path.length - 2;
};
