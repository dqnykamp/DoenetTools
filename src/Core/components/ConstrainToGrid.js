import ConstraintComponent from "./abstract/ConstraintComponent";
import { findFiniteNumericalValue } from "../utils/math";

export default class ConstrainToGrid extends ConstraintComponent {
  static componentType = "constrainToGrid";

  static createAttributesObject() {
    let attributes = super.createAttributesObject();
    attributes.dx = {
      createComponentOfType: "number",
      createStateVariable: "dx",
      defaultValue: 1,
      public: true,
    };
    attributes.dy = {
      createComponentOfType: "number",
      createStateVariable: "dy",
      defaultValue: 1,
      public: true,
    };
    attributes.dz = {
      createComponentOfType: "number",
      createStateVariable: "dz",
      defaultValue: 1,
      public: true,
    };
    attributes.xoffset = {
      createComponentOfType: "number",
      createStateVariable: "xoffset",
      defaultValue: 0,
      public: true,
    };
    attributes.yoffset = {
      createComponentOfType: "number",
      createStateVariable: "yoffset",
      defaultValue: 0,
      public: true,
    };
    attributes.zoffset = {
      createComponentOfType: "number",
      createStateVariable: "zoffset",
      defaultValue: 0,
      public: true,
    };
    attributes.ignoreGraphBounds = {
      createComponentOfType: "boolean",
      createStateVariable: "ignoreGraphBounds",
      defaultValue: false,
      public: true,
    };
    return attributes;
  }

  static returnStateVariableDefinitions() {
    let stateVariableDefinitions = super.returnStateVariableDefinitions();

    stateVariableDefinitions.independentComponentConstraints = {
      returnDependencies: () => ({}),
      definition: () => ({
        setValue: { independentComponentConstraints: true },
      }),
    };

    stateVariableDefinitions.graphXmin = {
      additionalStateVariablesDefined: [
        "graphXmax",
        "graphYmin",
        "graphYmax",
        "graphXminIgnoredChanges",
        "graphXmaxIgnoredChanges",
        "graphYminIgnoredChanges",
        "graphYmaxIgnoredChanges",
      ],
      returnDependencies: () => ({
        graphAncestor: {
          dependencyType: "ancestor",
          componentType: "graph",
          variableNames: ["xmin", "xmax", "ymin", "ymax"],
        },
      }),
      definition({ dependencyValues, ignoreAxisLimitChangesInConstraints }) {
        console.log("def of graphXmin", {
          dependencyValues,
          ignoreAxisLimitChangesInConstraints,
        });
        if (dependencyValues.graphAncestor === null) {
          return {
            setValue: {
              graphXmin: null,
              graphXmax: null,
              graphYmin: null,
              graphYmax: null,
              graphXminIgnoredChanges: null,
              graphXmaxIgnoredChanges: null,
              graphYminIgnoredChanges: null,
              graphYmaxIgnoredChanges: null,
            },
          };
        }

        let graphXmin = dependencyValues.graphAncestor.stateValues.xmin;
        let graphXmax = dependencyValues.graphAncestor.stateValues.xmax;
        let graphYmin = dependencyValues.graphAncestor.stateValues.ymin;
        let graphYmax = dependencyValues.graphAncestor.stateValues.ymax;

        if (
          ![graphXmin, graphXmax, graphYmin, graphYmax].every(Number.isFinite)
        ) {
          graphXmin = null;
          graphXmax = null;
          graphYmin = null;
          graphYmax = null;
        }

        if (ignoreAxisLimitChangesInConstraints) {
          console.log("return no changes!", {
            graphXmin,
            graphXmax,
            graphYmin,
            graphYmax,
          });
          return {
            setValue: {
              graphXmin,
              graphXmax,
              graphYmin,
              graphYmax,
            },
            noChanges: [
              "graphXminIgnoredChanges",
              "graphXmaxIgnoredChanges",
              "graphYminIgnoredChanges",
              "graphYmaxIgnoredChanges",
            ],
          };
        } else {
          console.log("changing everything to", {
            graphXmin,
            graphXmax,
            graphYmin,
            graphYmax,
          });
          return {
            setValue: {
              graphXmin,
              graphXmax,
              graphYmin,
              graphYmax,
              graphXminIgnoredChanges: graphXmin,
              graphXmaxIgnoredChanges: graphXmax,
              graphYminIgnoredChanges: graphYmin,
              graphYmaxIgnoredChanges: graphYmax,
            },
          };
        }
      },
    };

    // Since state variable independentComponentConstraints is true,
    // expect function applyComponentConstraint to be called with
    // a single component value as the object, for example,  {x1: 13}

    // use the convention of x1, x2, and x3 for variable names
    // so that components can call constraints generically for n-dimensions
    // use x,y,z for properties so that authors can use the more familar tag names

    stateVariableDefinitions.applyComponentConstraint = {
      returnDependencies: () => ({
        dx: {
          dependencyType: "stateVariable",
          variableName: "dx",
        },
        dy: {
          dependencyType: "stateVariable",
          variableName: "dy",
        },
        dz: {
          dependencyType: "stateVariable",
          variableName: "dz",
        },
        xoffset: {
          dependencyType: "stateVariable",
          variableName: "xoffset",
        },
        yoffset: {
          dependencyType: "stateVariable",
          variableName: "yoffset",
        },
        zoffset: {
          dependencyType: "stateVariable",
          variableName: "zoffset",
        },
        constraintAncestor: {
          dependencyType: "ancestor",
          componentType: "constraints",
          variableNames: [
            "graphXmin",
            "graphXmax",
            "graphYmin",
            "graphYmax",
            "graphXminIgnoredChanges",
            "graphXmaxIgnoredChanges",
            "graphYminIgnoredChanges",
            "graphYmaxIgnoredChanges",
          ],
        },
        graphXmin: {
          dependencyType: "stateVariable",
          variableName: "graphXmin",
        },
        graphXmax: {
          dependencyType: "stateVariable",
          variableName: "graphXmax",
        },
        graphYmin: {
          dependencyType: "stateVariable",
          variableName: "graphYmin",
        },
        graphYmax: {
          dependencyType: "stateVariable",
          variableName: "graphYmax",
        },
        graphXminIgnoredChanges: {
          dependencyType: "stateVariable",
          variableName: "graphXminIgnoredChanges",
        },
        graphXmaxIgnoredChanges: {
          dependencyType: "stateVariable",
          variableName: "graphXmaxIgnoredChanges",
        },
        graphYminIgnoredChanges: {
          dependencyType: "stateVariable",
          variableName: "graphYminIgnoredChanges",
        },
        graphYmaxIgnoredChanges: {
          dependencyType: "stateVariable",
          variableName: "graphYmaxIgnoredChanges",
        },
        ignoreGraphBounds: {
          dependencyType: "stateVariable",
          variableName: "ignoreGraphBounds",
        },
      }),
      definition: ({ dependencyValues }) => ({
        setValue: {
          applyComponentConstraint: function ({
            variables,
            ignoreAxisLimitChangesInConstraints,
          }) {
            console.log("apply comp const", {
              variables,
              dependencyValues,
              ignoreAxisLimitChangesInConstraints,
            });
            let ancestor;
            if (
              dependencyValues.constraintAncestor !== null &&
              dependencyValues.constraintAncestor.stateValues.graphXmin !== null
            ) {
              ancestor = "constraints";
            } else if (dependencyValues.graphXmin !== null) {
              ancestor = "graph";
            }

            // if given the value of x1, apply to constraint to x1
            // and ignore any other arguments (which shouldn't be given)
            if ("x1" in variables) {
              let x1 = findFiniteNumericalValue(variables.x1);

              // if found a non-numerical value, return no constraint
              if (!Number.isFinite(x1)) {
                return {};
              }

              let dx = dependencyValues.dx;
              let xoffset = dependencyValues.xoffset;
              let x1constrained =
                Math.round((x1 - xoffset) / dx) * dx + xoffset;
              if (Number.isFinite(x1constrained)) {
                if (!dependencyValues.ignoreGraphBounds) {
                  // if in a graph, exclude grid points outside graph bounds
                  let xmin, xmax;
                  if (ancestor === "constraints") {
                    if (ignoreAxisLimitChangesInConstraints) {
                      xmin =
                        dependencyValues.constraintAncestor.stateValues
                          .graphXminIgnoredChanges;
                      xmax =
                        dependencyValues.constraintAncestor.stateValues
                          .graphXmaxIgnoredChanges;
                    } else {
                      xmin =
                        dependencyValues.constraintAncestor.stateValues
                          .graphXmin;
                      xmax =
                        dependencyValues.constraintAncestor.stateValues
                          .graphXmax;
                    }
                  } else if (ancestor === "graph") {
                    if (ignoreAxisLimitChangesInConstraints) {
                      xmin = dependencyValues.graphXminIgnoredChanges;
                      xmax = dependencyValues.graphXmaxIgnoredChanges;
                    } else {
                      xmin = dependencyValues.graphXmin;
                      xmax = dependencyValues.graphXmax;
                    }
                  }
                  if (xmin !== undefined) {
                    if (x1constrained < xmin) {
                      x1constrained =
                        Math.ceil((xmin - xoffset) / dx) * dx + xoffset;
                    } else if (x1constrained > xmax) {
                      x1constrained =
                        Math.floor((xmax - xoffset) / dx) * dx + xoffset;
                    }
                  }
                }

                return {
                  constrained: true,
                  variables: { x1: x1constrained },
                };
              } else {
                return {};
              }
            }

            // if given the value of x2, apply to constraint to x2
            // and ignore any other arguments (which shouldn't be given)
            if ("x2" in variables) {
              let x2 = findFiniteNumericalValue(variables.x2);
              // if found a non-numerical value, return no constraint
              if (!Number.isFinite(x2)) {
                return {};
              }

              let dy = dependencyValues.dy;
              let yoffset = dependencyValues.yoffset;
              let x2constrained =
                Math.round((x2 - yoffset) / dy) * dy + yoffset;
              if (Number.isFinite(x2constrained)) {
                if (!dependencyValues.ignoreGraphBounds) {
                  // if in a graph, exclude grid points outside graph bounds
                  let ymin, ymax;
                  if (ancestor === "constraints") {
                    if (ignoreAxisLimitChangesInConstraints) {
                      ymin =
                        dependencyValues.constraintAncestor.stateValues
                          .graphYminIgnoredChanges;
                      ymax =
                        dependencyValues.constraintAncestor.stateValues
                          .graphYmaxIgnoredChanges;
                    } else {
                      ymin =
                        dependencyValues.constraintAncestor.stateValues
                          .graphYmin;
                      ymax =
                        dependencyValues.constraintAncestor.stateValues
                          .graphYmax;
                    }
                  } else if (ancestor === "graph") {
                    if (ignoreAxisLimitChangesInConstraints) {
                      ymin = dependencyValues.graphYminIgnoredChanges;
                      ymax = dependencyValues.graphYmaxIgnoredChanges;
                    } else {
                      ymin = dependencyValues.graphYmin;
                      ymax = dependencyValues.graphYmax;
                    }
                  }
                  if (ymin !== undefined) {
                    if (x2constrained < ymin) {
                      x2constrained =
                        Math.ceil((ymin - yoffset) / dy) * dy + yoffset;
                    } else if (x2constrained > ymax) {
                      x2constrained =
                        Math.floor((ymax - yoffset) / dy) * dy + yoffset;
                    }
                  }
                }

                return {
                  constrained: true,
                  variables: { x2: x2constrained },
                };
              } else {
                return {};
              }
            }

            // if given the value of x3, apply to constraint to x3
            // and ignore any other arguments (which shouldn't be given)
            if ("x3" in variables) {
              let x3 = findFiniteNumericalValue(variables.x3);
              // if found a non-numerical value, return no constraint
              if (!Number.isFinite(x3)) {
                return {};
              }

              let dz = dependencyValues.dz;
              let zoffset = dependencyValues.zoffset;
              let x3constrained =
                Math.round((x3 - zoffset) / dz) * dz + zoffset;
              if (Number.isFinite(x3constrained)) {
                return {
                  constrained: true,
                  variables: { x3: x3constrained },
                };
              } else {
                return {};
              }
            }

            // if didn't get x1, x2, or x3 as argument, don't constrain anything
            return {};
          },
        },
      }),
    };

    return stateVariableDefinitions;
  }
}
