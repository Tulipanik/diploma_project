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
import vtkPaintFilter from "@kitware/vtk.js/Filters/General/PaintFilter";
// import vtkBezieWidget from "@/lib/Widgets/BezieWidget";

import DrawingManager from "@/lib/drawingManager";

export default function ConeVisualizator({ imageReader }) {
  const vtkContainerRef = useRef(null);
  const context = useRef(null);

  //3d elements
  const imageSource = imageReader.getOutputData(0);

  //labelmap elements
  const labelMapMapper = useRef(vtkVolumeMapper.newInstance());
  const painter = useRef(vtkPaintFilter.newInstance({}));

  //widget elements
  const paintHandle = useRef(null);
  const paintWidget = useRef(null);
  const widgetManager = useRef(vtkWidgetManager.newInstance());

  const [radius, setRadius] = useState(1);
  const [drawingActivity, setDrawingActivity] = useState(false);

  const drawingMethods = useRef(null);

  useEffect(() => {
    if (!context.current) {
      //3d render pipeline
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

      //labelmap pipeline
      //filters
      const colorTransferFunction = vtkColorTransferFunction.newInstance();
      colorTransferFunction.addRGBPoint(1, 0, 0, 1); //label 1 color

      const piecewiseFunction = vtkPiecewiseFunction.newInstance();
      piecewiseFunction.addPoint(0, 0);
      piecewiseFunction.addPoint(1, 1);

      painter.current.setBackgroundImage(imageSource);
      painter.current.setLabel(1);
      painter.current.setRadius(5);

      //actor
      const labelMapActor = vtkVolume.newInstance({});
      labelMapActor
        .getProperty()
        .setRGBTransferFunction(0, colorTransferFunction);
      labelMapActor.getProperty().setScalarOpacity(0, piecewiseFunction);

      //actors to mappers
      labelMapActor.setMapper(labelMapMapper.current);
      labelMapMapper.current.setInputConnection(
        painter.current.getOutputPort()
      );

      renderer.addVolume(labelMapActor);

      //widget pipeline
      widgetManager.current.setRenderer(renderer);

      paintWidget.current = vtkPaintWidget.newInstance();
      paintHandle.current = widgetManager.current.addWidget(
        paintWidget.current,
        ViewTypes.VOLUME
      );

      // const bezieWidget = vtkBezieWidget.newInstance();
      // widgetManager.addWidget(bezieWidget);

      // bezieWidget.updateBezierCurve();
      // renderWindow.getInteractor().onLeftButtonPress((callData) => {
      //   bezieWidget.handleLeftButtonPress(callData);
      // });
      // renderWindow.getInteractor().onMouseMove((callData) => {
      //   bezieWidget.handleMouseMove(callData);
      // });
      // renderWindow.getInteractor().onLeftButtonRelease(() => {
      //   bezieWidget.handleLeftButtonRelease();
      // });

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

      drawingMethods.current = DrawingManager(
        widgetManager.current,
        paintWidget.current,
        painter.current,
        paintHandle.current
      );
    }
  }, []);

  useEffect(() => {
    if (drawingActivity) {
      drawingMethods.current.turnOn();
    }

    return () => {
      drawingMethods.current.turnOff();
    };
  }, [drawingActivity]);

  return (
    <div style={{ position: "relative" }}>
      <div ref={vtkContainerRef} />
      <HoverMenu>
        <button
          onClick={() => {
            setDrawingActivity(!drawingActivity);
          }}
        >
          draw!
        </button>
      </HoverMenu>
    </div>
  );
}
