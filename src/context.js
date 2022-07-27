const Graph = require('graph-data-structure')

const { DependencyCycleError } = require('./errors')

class PhoContext {
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
  getFieldValue(fullFieldName) {
    return this._data[fullFieldName]
  }

  /**
   * Sets the value of the given full path key.
   * @param fullFieldName - The full path field name (root.nested.field1)
   * @param value - The field's value.
   */
  setFieldValue(fullFieldName, value) {
    this._data[fullFieldName] = value
  }

  ensureNoDependencyCycles() {
    if (this.dependencyGraph.hasCycle()) {
      throw new DependencyCycleError('Found cycle dependencies')
    }
  }

  serialize() {
    const d3Graph = this.dependencyGraph.serialize()
    const result = {
      graph: {
        directed: true,
        nodes: d3Graph.nodes,
        edges: d3Graph.links,
      },
    }
    return result
  }
}

module.exports = {
  PhoContext,
}
