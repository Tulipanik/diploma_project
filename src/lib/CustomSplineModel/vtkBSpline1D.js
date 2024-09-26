import vtkSpline1D from "@kitware/vtk.js/Common/DataModel/Spline1D";
import { m as macro } from "@kitware/vtk.js/macros2.js";
import vtkWidgetState from "@kitware/vtk.js/Widgets/Core/WidgetState";

function vtkBSpline1D(publicAPI, model) {
  // vtkSpline1D.extend(publicAPI, model);
  let t = -1;

  const newton = (n, k) => {
    if (k === 0 || k === n) {
      return 1;
    }
    return newton(n - 1, k) + newton(n - 1, k - 1);
  };

  publicAPI.computeOpenCoefficients = (size, work, x, y) => {
    model.size = size;
    model.x = x;
    model.y = y;
    console.log(work);
    // console.log(model.y);
  };

  publicAPI.getValue = (intervalIndex, t) => {
    let toReturn = 0;
    for (let i = 0; i < model.size; i++) {
      const coefficients =
        newton(model.size, i) * t ** i * (1 - t) ** (model.size - i);
      toReturn += model.y[i] * coefficients;
    }
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
  vtkBSpline1D(publicAPI, model);
}

const newInstance = macro.newInstance(extend, "vtkBSpline1D");

var vtkBSpline1D$1 = {
  newInstance,
  extend,
};

export { vtkBSpline1D$1 as default, extend, newInstance };
