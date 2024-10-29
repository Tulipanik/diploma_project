import vtkBSpline1D from "./vtkBSpline1D";
import vtkLineSpline1D from "./vtkLineSpline";

import vtkCardinalSpline1D from "@kitware/vtk.js/Common/DataModel/CardinalSpline1D";
import vtkKochanekSpline1D from "@kitware/vtk.js/Common/DataModel/KochanekSpline1D";
import { splineKind } from "@kitware/vtk.js/Common/DataModel/Spline3D/Constants";
import { m as macro } from "@kitware/vtk.js/macros2.js";
import ImageConstants from "@kitware/vtk.js/Rendering/Core/ImageMapper/Constants";

const { SlicingMode } = ImageConstants;

export const extendedSplineKind = { ...splineKind, B_SPLINE: "B_SPLINE" };

function vtkCustomSpline3D(publicAPI, model, initialValues = {}) {
  model.classHierarchy.push("vtkSpline3D");

  // --------------------------------------------------------------------------

  function computeCoefficients1D(spline, points, boundaryConditionValue) {
    if (points.length === 0) {
      vtkErrorMacro("Splines require at least one points");
    }

    // If we have only one point we create a spline
    // which two extremities are the same point
    if (points.length === 1) {
      points.push(points[0]);
    }
    const size = points.length;
    let work = null;
    let intervals = null;
    work = new Float32Array(size);
    if (model.intervals.length === 0) {
      intervals = new Float32Array(size);
      for (let i = 0; i < intervals.length; i++) {
        intervals[i] = i;
      }
    } else {
      intervals = model.intervals;
    }
    if (model.close) {
      spline.computeCloseCoefficients(size, work, intervals, points);
    } else {
      // console.log(spline);

      spline.computeOpenCoefficients(size, work, intervals, points, {
        leftConstraint: model.boundaryCondition,
        leftValue: boundaryConditionValue,
        rightConstraint: model.boundaryCondition,
        rightValue: boundaryConditionValue,
      });
    }

    // console.log(model);
  }

  publicAPI.computeCoefficients = (points) => {
    const x = points.map((pt) => pt[0]);
    const y = points.map((pt) => pt[1]);
    const z = points.map((pt) => pt[2]);
    computeCoefficients1D(model.splineX, x, model.boundaryConditionValues[0]);
    computeCoefficients1D(model.splineY, y, model.boundaryConditionValues[1]);
    computeCoefficients1D(model.splineZ, z, model.boundaryConditionValues[2]);
  };

  // --------------------------------------------------------------------------

  publicAPI.getPoint = (intervalIndex, t) => {
    return [
      model.splineX.getValue(intervalIndex, t),
      model.splineY.getValue(intervalIndex, t),
      model.splineZ.getValue(intervalIndex, t),
    ];
  };

  // --------------------------------------------------------------------------
  // initialization
  // --------------------------------------------------------------------------

  if (model.kind === splineKind.KOCHANEK_SPLINE) {
    model.splineX = vtkKochanekSpline1D.newInstance({
      tension: model.tension,
      continuity: model.continuity,
      bias: model.bias,
    });
    model.splineY = vtkKochanekSpline1D.newInstance({
      tension: model.tension,
      continuity: model.continuity,
      bias: model.bias,
    });
    model.splineZ = vtkKochanekSpline1D.newInstance({
      tension: model.tension,
      continuity: model.continuity,
      bias: model.bias,
    });
  } else if (model.kind === splineKind.CARDINAL_SPLINE) {
    model.splineX = vtkCardinalSpline1D.newInstance();
    model.splineY = vtkCardinalSpline1D.newInstance();
    model.splineZ = vtkCardinalSpline1D.newInstance();
  } else if (model.kind === extendedSplineKind.B_SPLINE) {
    console.log(model.sliceNumber);

    model.splineX =
      model.slicingMode !== SlicingMode.I
        ? vtkBSpline1D.newInstance()
        : vtkLineSpline1D.newInstance({
            sliceNumber: model.sliceNumber,
            spacing: model.spacing[0],
            widgetState: model.widgetState,
          });
    model.splineY =
      model.splicingMode !== SlicingMode.J
        ? vtkBSpline1D.newInstance()
        : vtkLineSpline1D.newInstance({
            sliceNumber: model.sliceNumber,
            spacing: model.spacing[1],
            widgetState: model.widgetState,
          });
    model.splineZ =
      model.slicingMode !== SlicingMode.K
        ? vtkBSpline1D.newInstance()
        : vtkLineSpline1D.newInstance({
            sliceNumber: model.sliceNumber,
            spacing: model.spacing[2],
            widgetState: model.widgetState,
          });
  } else {
    vtkErrorMacro(`Unknown spline type ${model.kind}`);
  }
}

const DEFAULT_VALUES = {
  close: false,
  intervals: [],
  kind: splineKind.KOCHANEK_SPLINE,
  boundaryConditionValues: [0, 0, 0],
  tension: 0,
  continuity: 0,
  bias: 0,
};

// ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  let initialValues =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues);

  // Build VTK API
  macro.obj(publicAPI, model);
  macro.setGet(publicAPI, model, ["close", "intervals", "sliceNumber"]);
  vtkCustomSpline3D(publicAPI, model);
}

// ----------------------------------------------------------------------------

const newInstance = macro.newInstance(extend, "vtkCustomSpline3D");

// ----------------------------------------------------------------------------

var vtkCustomSpline3D$1 = {
  newInstance,
  extend,
};

export { vtkCustomSpline3D$1 as default, extend, newInstance };
