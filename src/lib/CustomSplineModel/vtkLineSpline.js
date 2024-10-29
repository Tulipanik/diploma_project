import vtkSpline1D from "@kitware/vtk.js/Common/DataModel/Spline1D";
import { m as macro } from "@kitware/vtk.js/macros2.js";
import vtkWidgetState from "@kitware/vtk.js/Widgets/Core/WidgetState";

function vtkLineSpline1D(publicAPI, model) {
  let t = -1;

  publicAPI.computeOpenCoefficients = (size, work, x, y) => {
    // console.log(size);
    // console.log(work);
  };

  publicAPI.getValue = (intervalIndex, t) => {
    // console.log(model.widgetState.getSliceNumber());

    let toReturn = model.sliceNumber * model.spacing;
    return toReturn;
  };
}

const DEFAULT_VALUES = {};

function extend(publicAPI, model) {
  let initialValues =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  Object.assign(model, DEFAULT_VALUES, initialValues);
  vtkSpline1D.extend(publicAPI, model, initialValues);

  macro.obj(publicAPI, model);
  vtkLineSpline1D(publicAPI, model);
}

const newInstance = macro.newInstance(extend, "vtkBSpline1D");

var vtkLineSpline1D$1 = {
  newInstance,
  extend,
};

export { vtkLineSpline1D$1 as default, extend, newInstance };
