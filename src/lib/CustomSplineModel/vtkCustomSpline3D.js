import vtkSpline3D from "@kitware/vtk.js/Common/DataModel/Spline3D";
import vtkBSpline1D from "./vtkBSpline1D";
import { m as macro } from "@kitware/vtk.js/macros2.js";
import { splineKind } from "@kitware/vtk.js/Common/DataModel/Spline3D/Constants";

export const extendedSplineKind = { ...splineKind, B_SPLINE: "B_SPLINE" };

function vtkCustomSpline1D(publicAPI, model, initialValues = {}) {
  vtkSpline3D.extend(publicAPI, model, initialValues);

  if (model.kind === extendedSplineKind.B_SPLINE) {
    model.splineX = vtkBSpline1D.newInstance();
    model.splineY = vtkBSpline1D.newInstance();
    model.splineZ = vtkBSpline1D.newInstance();
  }
}

const DEFAULT_VALUES = {};

function extend(publicAPI, model) {
  let initialValues =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  Object.assign(model, DEFAULT_VALUES, initialValues);
  vtkSpline3D.extend(publicAPI, model, initialValues);

  macro.obj(publicAPI, model);
  vtkCustomSpline1D(publicAPI, model, initialValues);
}

const newInstance = macro.newInstance(extend, "vtkBSpline1D");

var vtkCustomSpline3D$1 = {
  newInstance,
  extend,
};

export { vtkCustomSpline3D$1 as default, extend, newInstance };
