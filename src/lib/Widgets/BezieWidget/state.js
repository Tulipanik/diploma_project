import vtkStateBuilder from "@kitware/vtk.js/Widgets/Core/StateBuilder.js";
import { BoundaryCondition } from "@kitware/vtk.js/Common/DataModel/Spline1D/Constants.js";
import { extendedSplineKind } from "@/lib/CustomSplineModel/vtkCustomSpline3D";
import ImageConstants from "@kitware/vtk.js/Rendering/Core/ImageMapper/Constants";

const { SlicingMode } = ImageConstants;
console.log(SlicingMode);

function generateState() {
  return vtkStateBuilder
    .createBuilder()
    .addField({
      name: "splineKind",
      initialValue: extendedSplineKind.B_SPLINE,
    })
    .addField({
      name: "splineClosed",
      initialValue: false,
    })
    .addField({
      name: "splineBoundaryCondition",
      initialValue: BoundaryCondition.DEFAULT,
    })
    .addField({
      name: "splineBoundaryConditionValues",
      initialValue: [0, 0, 0],
    })
    .addField({
      name: "splineTension",
      initialValue: 0,
    })
    .addField({
      name: "splineContinuity",
      initialValue: 0,
    })
    .addField({
      name: "splineBias",
      initialValue: 0,
    })
    .addField({
      name: "slicingMode",
      initialValue: SlicingMode.I,
    })
    .addField({
      name: "sliceNumber",
      initialValue: 0,
    })
    .addStateFromMixin({
      labels: ["moveHandle"],
      mixins: ["origin", "color", "scale1", "visible", "manipulator"],
      name: "moveHandle",
      initialValues: {
        scale1: 10,
        visible: false,
      },
    })
    .addDynamicMixinState({
      labels: ["handles"],
      mixins: ["origin", "color", "scale1", "visible", "manipulator"],
      name: "handle",
      initialValues: {
        scale1: 10,
      },
    })
    .build();
}

export { generateState as default };
