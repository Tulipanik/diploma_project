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
import vtkInteractorStyleTrackballCamera from "@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera";
import vtkKochanekSpline1D from "@kitware/vtk.js/Common/DataModel/KochanekSpline1D";
import vtkSplineWidget from "@kitware/vtk.js/Widgets/Widgets3D/SplineWidget";

const { SlicingMode } = ImageConstants;

export default function Slicer({ imageReader }) {
  const vtkContainerRef = useRef(null);
  const context = useRef(null);
  const actualSlicingMode = SlicingMode.K;
  const [widgetMapper, setWidgetMapper] = useState(
    vtkImageMapper.newInstance()
  );
  const [sliceNumber, setSliceNumber] = useState(null);

  const imageSource = imageReader.getOutputData(0);
  imageSource.indexToWorld
  const mapperRef = useRef(vtkImageMapper.newInstance());
  // const paintWidget = vtkPaintWidget.newInstance({
  //   radius: 1,
  //   painting: true,
  // });
  // let paintHandle;

  let widgetRepresentation;
  let widgetManager;
  let widget;

  useEffect(() => {
    if (!context.current) {
      const mapper = mapperRef.current;

      //sources

      //mappers
      mapper.setSliceAtFocalPoint(true);
      mapper.setKSlice(30);
      mapper.setSlicingMode(actualSlicingMode);
      // setSliceNumber(mapper.getSlice());
      // console.log(mapper.getBounds());
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

      //widget pipeline
      widgetManager = vtkWidgetManager.newInstance();
      widgetManager.setRenderer(renderer);

      widget = vtkSplineWidget.newInstance();
      widgetRepresentation = widgetManager.addWidget(widget);

      //widget state
      // const painter = vtkPaintFilter.newInstance();
      // painter.setSlicingMode(actualSlicingMode)

      // const widgetActor = vtkImageSlice.newInstance();

      // widgetActor.setMapper(widgetMapper);
      // mapper.setInputConnection(painter.getOutputData());

      //widget manager
      const widgetManager = vtkWidgetManager.newInstance({});
      // widgetManager.setRenderer(renderer);
      // paintHandle = widgetManager.addWidget(paintWidget, ViewTypes.SLICE);
      // widgetMapper.onModified(update)

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

  const createSpline = () => {
    widgetRepresentation.reset();
    widgetManager.grabFocus(widget);
  };

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

  return (
    <div>
      <div ref={vtkContainerRef} />
      <HoverMenu>
        <div>slice: {sliceNumber}</div>
        <button onProgress={() => createSpline()}>create spline</button>
      </HoverMenu>
    </div>
  );
}
