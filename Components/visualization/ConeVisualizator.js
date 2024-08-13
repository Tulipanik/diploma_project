// "use client";

// import { useState, useRef, useEffect } from "react";

// import HoverMenu from "./HoverMenu";

// import "@kitware/vtk.js/Rendering/Profiles/Geometry";
// import "@kitware/vtk.js/Rendering/Profiles/Volume";

// import vtkVolume from "@kitware/vtk.js/Rendering/Core/Volume";
// import vtkVolumeMapper from "@kitware/vtk.js/Rendering/Core/VolumeMapper";
// import vtkGenericRenderWindow from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";

// import vtkPiecewiseFunction from "@kitware/vtk.js/Common/DataModel/PiecewiseFunction";
// import vtkColorTransferFunction from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction";
// import vtkColorMaps from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps";
// import vtkWidgetManager from "@kitware/vtk.js/Widgets/Core/WidgetManager";
// import vtkPaintWidget from "@kitware/vtk.js/Widgets/Widgets3D/PaintWidget";
// import vtkPaintFilter from "@kitware/vtk.js/Filters/General/PaintFilter";

// import { CaptureOn } from "@kitware/vtk.js/Widgets/Core/WidgetManager/Constants";

// const initialParameters = {
//   paintRadius: 5,
//   label: 1,
// };

// const WIDGET_BUILDERS = {
//   Paint: (widgetManager) => {
//     const instance = {
//       widget: widgetManager.addWidget(vtkPaintWidget.newInstance()),
//       filter: vtkPaintFilter.newInstance(),
//     };

//     // console.log(instance.filter);

//     // instance.widget.setRadius(initialParameters.paintRadius);
//     instance.filter.setLabel(initialParameters.label);
//     instance.filter.setRadius(initialParameters.paintRadius);
//     return instance;
//   },
// };

// export default function ConeVisualizator({ imageReader, load }) {
//   const imageSource = useRef(imageReader.getOutputData(0)).current;
//   const vtkContainerRef = useRef(null);
//   const context = useRef(null);
//   const widgetManager = useRef(vtkWidgetManager.newInstance()).current;
//   const activeWidget = useRef(null).current;
//   // const paintFilter = useRef(vtkPaintFilter.newInstance()).current;

//   //setting filters

//   const colorMapTable = vtkColorTransferFunction.newInstance();
//   colorMapTable.applyColorMap(vtkColorMaps.getPresetByName("Grayscale"));
//   colorMapTable.setMappingRange(0, 256);
//   colorMapTable.updateRange();

//   const subdomains = vtkPiecewiseFunction.newInstance();

//   const start = 32;
//   const end = 256;
//   const steps = 20;
//   const startStep = 0;
//   for (let i = startStep; i <= steps; i++) {
//     subdomains.addPoint(
//       start + (i * (end - start)) / steps,
//       (i - startStep) / (steps - startStep)
//     );
//   }

//   useEffect(() => {
//     if (!context.current) {
//       //window renderer
//       const fullScreenRenderer = vtkGenericRenderWindow.newInstance();
//       fullScreenRenderer.setContainer(vtkContainerRef.current);
//       fullScreenRenderer.resize();

//       //renderer
//       const renderer = fullScreenRenderer.getRenderer();
//       const renderWindow = fullScreenRenderer.getRenderWindow();

//       // //sources and wrappers
//       // const imageSource = imageReader.getOutputData(0);

//       //mappers
//       const mapper = vtkVolumeMapper.newInstance();
//       mapper.setSampleDistance(0.7);

//       //actors
//       const actor = vtkVolume.newInstance();

//       actor.getProperty().setScalarOpacity(0, subdomains);
//       actor.getProperty().setRGBTransferFunction(0, colorMapTable);

//       //actors to mappers
//       actor.setMapper(mapper);
//       mapper.setInputData(imageSource);

//       renderer.getActiveCamera().setParallelProjection(true);

//       renderer.addActor(actor);
//       renderer.resetCamera();
//       renderer.updateLightsGeometryToFollowCamera();
//       renderWindow.render();

//       widgetManager.setCaptureOn(CaptureOn.MOUSE_RELEASE);
//       widgetManager.setRenderer(renderer);

//       //widgetPlacelemt
//       // Object.entries(WIDGET_BUILDERS).forEach(([_, builder]) => {
//       //   console.log(builder);
//       //   const widget = builder(widgetManager).widget;
//       //   console.log(imageSource);
//       //   widget.placeWidget(imageSource.getBounds());
//       //   widget.setPlaceFactor(2);
//       //   widgetManager.enablePicking();
//       //   renderWindow.render();
//       //   console.log("siema");
//       // });

//       // context.current = {
//       //   fullScreenRenderer,
//       //   renderWindow,
//       //   renderer,
//       //   actor,
//       //   mapper,
//       // };
//     }

//     return () => {
//       if (context.current) {
//         const { fullScreenRenderer, coneSource, actor, mapper } =
//           context.current;
//         // actor.delete();
//         // mapper.delete();
//         // coneSource.delete();
//         // fullScreenRenderer.delete();
//         context.current = null;
//       }
//     };
//   }, [vtkContainerRef]);

//   return (
//     <div style={{ position: "relative" }}>
//       <div ref={vtkContainerRef} />
//       <HoverMenu></HoverMenu>
//     </div>
//   );
// }

"use client";

import { useState, useRef, useEffect } from "react";

import HoverMenu from "./HoverMenu";

import "@kitware/vtk.js/Rendering/Profiles/Geometry";
import "@kitware/vtk.js/Rendering/Profiles/Volume";

import vtkVolume from "@kitware/vtk.js/Rendering/Core/Volume";
import vtkVolumeMapper from "@kitware/vtk.js/Rendering/Core/VolumeMapper";
import vtkGenericRenderWindow from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";

import vtkPiecewiseFunction from "@kitware/vtk.js/Common/DataModel/PiecewiseFunction";
import vtkColorTransferFunction from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction";
import vtkColorMaps from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps";
import vtkWidgetManager from "@kitware/vtk.js/Widgets/Core/WidgetManager";
import vtkPaintWidget from "@kitware/vtk.js/Widgets/Widgets3D/PaintWidget";
import { ViewTypes } from "@kitware/vtk.js/Widgets/Core/WidgetManager/Constants";

const WIDGETS = {
  paintWidget: vtkPaintWidget.newInstance(),
};

export default function ConeVisualizator({ imageReader, load }) {
  const vtkContainerRef = useRef(null);
  const context = useRef(null);
  // const widgetManager = useRef(vtkWidgetManager.newInstance());
  // const widgetHandlers = useRef({});

  useEffect(() => {
    if (!context.current) {
      // //widget management
      // widgetHandlers.current.paintHandle = widgetManager.current.addWidget(
      //   WIDGETS.paintWidget,
      //   ViewTypes.DEFAULT
      // );
      // widgetManager.current.grabFocus(WIDGETS.paintWidget);

      //sources
      const imageSource = imageReader.getOutputData(0);

      //filters
      const colorMapTable = vtkColorTransferFunction.newInstance();
      colorMapTable.applyColorMap(vtkColorMaps.getPresetByName("Grayscale"));
      colorMapTable.setMappingRange(0, 256);
      colorMapTable.updateRange();

      const subdomains = vtkPiecewiseFunction.newInstance();

      const start = 32;
      const end = 256;
      const steps = 20;
      const startStep = 0;
      for (let i = startStep; i <= steps; i++) {
        subdomains.addPoint(
          start + (i * (end - start)) / steps,
          (i - startStep) / (steps - startStep)
        );
      }

      //mappers
      const mapper = vtkVolumeMapper.newInstance();
      mapper.setSampleDistance(0.7);

      //actors
      const actor = vtkVolume.newInstance();

      actor.getProperty().setScalarOpacity(0, subdomains);
      actor.getProperty().setRGBTransferFunction(0, colorMapTable);

      actor.setMapper(mapper);
      mapper.setInputData(imageSource);

      //render
      const fullScreenRenderer = vtkGenericRenderWindow.newInstance();
      fullScreenRenderer.setContainer(vtkContainerRef.current);
      fullScreenRenderer.resize();

      const renderer = fullScreenRenderer.getRenderer();
      renderer.addActor(actor);

      renderer.getActiveCamera().setParallelProjection(true);
      renderer.resetCamera();

      //render window
      const renderWindow = fullScreenRenderer.getRenderWindow();
      renderWindow.render();

      context.current = {
        fullScreenRenderer,
        renderWindow,
        renderer,
        actor,
        mapper,
      };
    }

    return () => {
      if (context.current) {
        const { fullScreenRenderer, coneSource, actor, mapper } =
          context.current;
        context.current = null;
      }
    };
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <div ref={vtkContainerRef} />
      <HoverMenu></HoverMenu>
    </div>
  );
}
