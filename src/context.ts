import Graph from 'graph-data-structure'

import { DependencyCycleError } from './errors'

export interface Node {
  id: string
}

export interface Link {
  source: string;
  target: string;
  weight: number;
}

export interface SerializedGraph {
  graph: {
    directed: boolean
    nodes: Node[]
    edges: Link[]
  }
}

export class PhoContext {
  definitions: Record<string, any>
  dependencyGraph: any
  schema: any
  _data: Record<string, any>
  /*
   * Create a new PhoContext
   * Represents the state that is shared by all the configuration objects
   */
  constructor() {
    this.definitions = {}
    this.dependencyGraph = Graph() // contains which fields depend on other fields to be resolved
    this.schema = Graph() // contains the hierarchy of which fields are inside which fields

    this._data = {}
  }

  /**
   * Returns the post processed value of the given full path key.
   * This is accessible to validator/modifiers based on their defined
   * dependencies.
   * @param fullFieldName - The full path field name (root.nested.field1)
   */
  getFieldValue(fullFieldName: string) {
    return this._data[fullFieldName]
  }

  /**
   * Sets the value of the given full path key.
   * @param fullFieldName - The full path field name (root.nested.field1)
   * @param value - The field's value.
   */
  setFieldValue(fullFieldName: string, value: any) {
    this._data[fullFieldName] = value
  }

  ensureNoDependencyCycles() {
    if (this.dependencyGraph.hasCycle()) {
      throw new DependencyCycleError('Found cycle dependencies')
    }
  }

  serialize(): SerializedGraph {
    const d3Graph = this.dependencyGraph.serialize()
    const result = {
      graph: {
        directed: true,
        nodes: d3Graph.nodes as Node[],
        edges: d3Graph.links as Link[],
      },
    }
    return result
  }
}