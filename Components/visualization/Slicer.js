"use client";

import { useState, useRef, useEffect } from "react";

import HoverMenu from "./HoverMenu";

import "@kitware/vtk.js/Rendering/Profiles/Volume";

import ImageConstants from "@kitware/vtk.js/Rendering/Core/ImageMapper/Constants";
import vtkGenericRenderWindow from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";
import vtkInteractorStyleImage from "@kitware/vtk.js/Interaction/Style/InteractorStyleImage";
import vtkImageSlice from "@kitware/vtk.js/Rendering/Core/ImageSlice";
import vtkImageMapper from "@kitware/vtk.js/Rendering/Core/ImageMapper";

import vtkWidgetManager from "@kitware/vtk.js/Widgets/Core/WidgetManager";
import vtkPaintWidget from "@kitware/vtk.js/Widgets/Widgets3D/PaintWidget";
import vtkPaintFilter from "@kitware/vtk.js/Filters/General/PaintFilter";
import { ViewTypes } from "@kitware/vtk.js/Widgets/Core/WidgetManager/Constants";
import vtkColorTransferFunction from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction";
import vtkPiecewiseFunction from "@kitware/vtk.js/Common/DataModel/PiecewiseFunction";

import DrawingManager from "@/lib/drawingManager";

const { SlicingMode } = ImageConstants;

export default function Slicer({ imageReader }) {
  const vtkContainerRef = useRef(null);
  const context = useRef(null);
  const labelmapContext = useRef(null);
  const widgetContext = useRef(null);

  //UI parameters
  const actualSlicingMode = SlicingMode.K;
  const [sliceNumber, setSliceNumber] = useState(0);
  const [radius, setRadius] = useState(1);
  const [drawingActivity, setDrawingActivity] = useState(false);

  //image elements
  const imageSource = imageReader.getOutputData(0);

  const drawingMethods = useRef(null);

  useEffect(() => {
    if (!context.current) {
      //image pipeline

      console.log(imageSource.indexToWorld);
      //mapper
      const mapper = vtkImageMapper.newInstance({});
      mapper.setSliceAtFocalPoint(true);
      mapper.setKSlice(sliceNumber);
      mapper.setSlicingMode(actualSlicingMode);
      mapper.onModified(setSliceNumber(mapper.getSlice()));

      //actors
      const actor = vtkImageSlice.newInstance();

      //actors to mappers
      actor.setMapper(mapper);
      mapper.setInputData(imageSource);

      //renderer
      const fullScreenRenderer = vtkGenericRenderWindow.newInstance({
        background: [0, 0, 0],
      });
      fullScreenRenderer.setContainer(vtkContainerRef.current);
      fullScreenRenderer.resize();
      const renderer = fullScreenRenderer.getRenderer();
      renderer.addViewProp(actor);
      renderer.resetCamera();

      //interactors
      const interactor = vtkInteractorStyleImage.newInstance({
        interactionMode: "IMAGE_SLICE",
      });

      fullScreenRenderer.getInteractor().setInteractorStyle(interactor);

      //labelmap pipeline
      //filters
      const colorTransferFunction = vtkColorTransferFunction.newInstance();
      colorTransferFunction.addRGBPoint(1, 0, 0, 1); //label 1 color

      const piecewiseFunction = vtkPiecewiseFunction.newInstance();
      piecewiseFunction.addPoint(0, 0);
      piecewiseFunction.addPoint(1, 1);

      const painter = vtkPaintFilter.newInstance({});
      painter.setBackgroundImage(imageSource);
      painter.setLabel(1);
      painter.setSlicingMode(SlicingMode);

      //actor
      const labelMapActor = vtkImageSlice.newInstance();
      labelMapActor.getProperty().setRGBTransferFunction(colorTransferFunction);
      labelMapActor.getProperty().setPiecewiseFunction(piecewiseFunction);
      labelMapActor.getProperty().setOpacity(0.5);

      //actors to mappers
      const labelMapMapper = vtkImageMapper.newInstance({});
      labelMapActor.setMapper(labelMapMapper);
      labelMapMapper.setInputConnection(painter.getOutputPort());

      renderer.addViewProp(labelMapActor);

      //widget pipeline
      const widgetManager = vtkWidgetManager.newInstance({});
      const paintWidget = vtkPaintWidget.newInstance({});

      widgetManager.setRenderer(renderer);
      const paintHandle = widgetManager.addWidget(paintWidget, ViewTypes.SLICE);

      widgetManager.grabFocus(paintWidget);

      //render window
      const renderWindow = fullScreenRenderer.getRenderWindow();
      renderWindow.render();

      context.current = {
        fullScreenRenderer,
        renderWindow,
        renderer,
        mapper,
      };

      labelmapContext.current = {
        labelMapActor,
        labelMapMapper,
        painter,
      };

      widgetContext.current = {
        widgetManager,
        paintWidget,
        paintHandle,
      };

      drawingMethods.current = DrawingManager(
        widgetManager,
        paintWidget,
        painter,
        paintHandle,
        sliceNumber
      );
    }
  }, []);

  useEffect(() => {
    const updateSliceNumber = () => {
      const currentSlice = Math.round(context.current.mapper.getSlice());
      labelmapContext.current.labelMapMapper.set(
        context.current.mapper.get("slice", "slicingMode")
      );
      drawingMethods.current.updateSlice(
        context.current.mapper.get("slice").slice
      );

      const ijk = [0, 0, 0];
      const position = [0, 0, 0];

      const slicingMode = context.current.mapper.getSlicingMode() % 3;
      ijk[slicingMode] = context.current.mapper.getSlice();
      imageSource.indexToWorld(ijk, position);

      drawingMethods.current.updatePaintWidget(position);

      context.current.renderWindow.render();
      setSliceNumber(currentSlice);
    };

    const sub = context.current.mapper.onModified(updateSliceNumber);

    return () => {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (drawingActivity) {
      drawingMethods.current.turnOn();
    }

    return () => {
      drawingMethods.current.turnOff();
    };
  }, [drawingActivity]);

  useEffect(() => {
    labelmapContext.current.painter.setRadius(radius);
  }, [radius]);

  useEffect(() => {
    widgetContext.current.paintHandle.setVisibility(drawingActivity);
    widgetContext.current.paintHandle.updateRepresentationForRender();
  }, [drawingActivity]);

  const undo = () => {
    labelmapContext.current.painter.undo();
  };

  const redo = () => {
    labelmapContext.current.painter.redo();
  };

  return (
    <div>
      <div ref={vtkContainerRef} />
      <input
        style={{ position: "absolute", zIndex: 3 }}
        onChange={(e) => setRadius(e.target.value)}
        type="range"
        min="0"
        max="100"
        value={radius}
        step="1"
      />
      <HoverMenu>
        <div>slice: {sliceNumber}</div>
        <button onClick={() => setDrawingActivity(!drawingActivity)}>
          draw
        </button>
        <button onClick={() => undo()}>undo</button>
        <button onClick={() => redo()}>redo</button>
        <input
          onChange={(e) => setRadius(e.target.value)}
          type="range"
          min="0"
          max="100"
          value={radius}
          step="1"
        />
      </HoverMenu>
    </div>
  );
}
