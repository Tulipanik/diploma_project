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

const { SlicingMode } = ImageConstants;

export default function Slicer({ imageReader }) {
  const vtkContainerRef = useRef(null);
  const context = useRef(null);

  const actualSlicingMode = SlicingMode.K;
  const [sliceNumber, setSliceNumber] = useState(null);

  //UI parameters
  const [radius, setRadius] = useState(1);
  const [drawingActivity, setDrawingActivity] = useState(false);

  //image elements
  const imageSource = imageReader.getOutputData(0);
  // imageSource.indexToWorld;
  const mapperRef = useRef(vtkImageMapper.newInstance());

  //labelmap elements
  const painter = useRef(vtkPaintFilter.newInstance({}));

  //widget elements
  const paintHandle = useRef(null);
  const paintWidget = useRef(null);

  useEffect(() => {
    if (!context.current) {
      const mapper = mapperRef.current;

      //image pipeline

      //mappers
      mapper.setSliceAtFocalPoint(true);
      mapper.setKSlice(30);
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

      painter.current.setBackgroundImage(imageSource);
      painter.current.setLabel(1);
      painter.current.setSlicingMode(SlicingMode);

      //actor
      const labelMapActor = vtkImageSlice.newInstance();
      labelMapActor.getProperty().setRGBTransferFunction(colorTransferFunction);
      labelMapActor.getProperty().setPiecewiseFunction(piecewiseFunction);
      labelMapActor.getProperty().setOpacity(0.5);

      //mapper
      const labelMapMapper = vtkImageMapper.newInstance();

      //actors to mappers
      labelMapActor.setMapper(labelMapMapper);
      labelMapMapper.setInputConnection(painter.current.getOutputPort());

      renderer.addViewProp(labelMapActor);

      //widget pipeline
      const widgetManager = vtkWidgetManager.newInstance();
      widgetManager.setRenderer(renderer);

      paintWidget.current = vtkPaintWidget.newInstance();
      paintHandle.current = widgetManager.addWidget(
        paintWidget.current,
        ViewTypes.SLICE
      );

      widgetManager.grabFocus(paintWidget.current);

      //render window
      const renderWindow = fullScreenRenderer.getRenderWindow();
      renderWindow.render();

      context.current = {
        fullScreenRenderer,
        renderWindow,
        renderer,
      };
    }
  }, []);

  useEffect(() => {
    const updateSliceNumber = () => {
      setSliceNumber(Math.round(mapperRef.current.getSlice()));
    };

    const sub = mapperRef.current.onModified(updateSliceNumber);

    return () => {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    const initializeHandle = (handle) => {
      handle.onStartInteractionEvent(() => {
        painter.current.startStroke();
      });
      handle.onEndInteractionEvent(() => {
        painter.current.endStroke();
      });
    };

    paintHandle.current.onStartInteractionEvent(() => {
      painter.current.startStroke();
      painter.current.addPoint(
        paintWidget.current.getWidgetState().getTrueOrigin()
      );
    });

    paintHandle.current.onInteractionEvent(() => {
      painter.current.addPoint(
        paintWidget.current.getWidgetState().getTrueOrigin()
      );
    });

    initializeHandle(paintHandle.current);
    console.log("event setter");
  }, []);

  useEffect(() => {
    painter.current.setRadius(radius);
    console.log("radius");
  }, [radius]);

  useEffect(() => {
    console.log(paintHandle.current);

    paintHandle.current.setVisibility(drawingActivity);
    paintHandle.current.updateRepresentationForRender();
  }, [drawingActivity]);

  const undo = () => {
    painter.current.undo();
    console.log("undo");
  };

  const redo = () => {
    painter.current.redo();
    console.log("redo");
  };

  return (
    <div>
      <div ref={vtkContainerRef} />
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
