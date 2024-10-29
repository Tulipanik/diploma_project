import { m as macro } from "@kitware/vtk.js/macros2.js";
import vtkAbstractWidgetFactory from "@kitware/vtk.js/Widgets/Core/AbstractWidgetFactory.js";
import vtkPlanePointManipulator from "@kitware/vtk.js/Widgets/Manipulators/PlaneManipulator.js";
import vtkSphereHandleRepresentation from "@kitware/vtk.js/Widgets/Representations/SphereHandleRepresentation.js";
import widgetBehavior from "./BezieWidget/behavior.js";
import generateState from "./BezieWidget/state.js";
import { ViewTypes } from "@kitware/vtk.js/Widgets/Core/WidgetManager/Constants.js";

import vtkCurveContextRepresentation from "./vtkCurveContextRepresentation.js";

// ----------------------------------------------------------------------------
// Factory
// ----------------------------------------------------------------------------

function vtkBezieWidget(publicAPI, model) {
  model.classHierarchy.push("vtkBezieWidget");
  const superClass = {
    ...publicAPI,
  };

  // --- Widget Requirement ---------------------------------------------------

  model.methodsToLink = [
    "boundaryCondition",
    "close",
    "outputBorder",
    "fill",
    "borderColor",
    "errorBorderColor",
    "scaleInPixels",
  ];
  publicAPI.getRepresentationsForViewType = (viewType) => {
    switch (viewType) {
      case ViewTypes.DEFAULT:
      case ViewTypes.GEOMETRY:
      case ViewTypes.SLICE:
      case ViewTypes.VOLUME:
      default:
        return [
          {
            builder: vtkSphereHandleRepresentation,
            labels: ["handles", "moveHandle"],
          },
          {
            builder: vtkCurveContextRepresentation,
            labels: ["handles", "moveHandle"],
          },
        ];
    }
  };

  // --- Public methods -------------------------------------------------------
  publicAPI.setManipulator = (manipulator) => {
    superClass.setManipulator(manipulator);
    model.widgetState.getMoveHandle().setManipulator(manipulator);
    model.widgetState.getHandleList().forEach((handle) => {
      handle.setManipulator(manipulator);
    });
  };

  publicAPI.setSliceNumber = (sliceNumber) => {
    model.widgetState.setSliceNumber(sliceNumber);
  };

  // --------------------------------------------------------------------------
  // initialization
  // --------------------------------------------------------------------------

  // Default manipulator
  publicAPI.setManipulator(
    model.manipulator ||
      model.manipulator ||
      vtkPlanePointManipulator.newInstance({
        useCameraNormal: true,
      })
  );
}

// ----------------------------------------------------------------------------

const defaultValues = (initialValues) => ({
  freehandMinDistance: 0.1,
  allowFreehand: true,
  resolution: 32,
  defaultCursor: "pointer",
  handleSizeInPixels: 100,
  resetAfterPointPlacement: false,
  behavior: widgetBehavior,
  widgetState: generateState(),
  ...initialValues,
});

// ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  let initialValues =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, defaultValues(initialValues));
  vtkAbstractWidgetFactory.extend(publicAPI, model, initialValues);
  macro.setGet(publicAPI, model, [
    "manipulator",
    "freehandMinDistance",
    "allowFreehand",
    "resolution",
    "defaultCursor",
    "handleSizeInPixels",
    "resetAfterPointPlacement",
  ]);
  vtkBezieWidget(publicAPI, model);
}

// ----------------------------------------------------------------------------

const newInstance = macro.newInstance(extend, "vtkBezieWidget");

// ----------------------------------------------------------------------------

var vtkBezieWidget$1 = {
  newInstance,
  extend,
};

export { vtkBezieWidget$1 as default, extend, newInstance };
