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
  let drawingActivity = false;
  const vtkContainerRef = useRef(null);
  const context = useRef(null);

  const widgetElems = { isInUse: false };

  useEffect(() => {
    if (!context.current) {
      //sources
      const imageSource = imageReader.getOutputData(0);

      //mappers
      const mapper = vtkImageMapper.newInstance();
      mapper.setSliceAtFocalPoint(true);
      mapper.setKSlice(30);
      mapper.setSlicingMode(SlicingMode.K);

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

      //render window
      const renderWindow = fullScreenRenderer.getRenderWindow();
      renderWindow.render();

      //widget pipeline
      //mappers
      const widgetMapper = vtkImageMapper.newInstance();

      //actor
      const widgetActor = vtkImageSlice.newInstance();

      //widget manager
      widgetElems.widgetManager = vtkWidgetManager.newInstance();
      widgetElems.widgetManager.setRenderer(renderer);

      //widgets
      widgetElems.paintWidget = vtkPaintWidget.newInstance();
      widgetElems.paintHandle = widgetElems.widgetManager.addWidget(
        widgetElems.paintWidget,
        ViewTypes.SLICE
      );

      widgetElems.painter = vtkPaintFilter.newInstance();

      //painter function elems
      const colorFunc = vtkColorTransferFunction.newInstance();
      const subdomains = vtkPiecewiseFunction.newInstance();

      colorFunc.addRGBPoint(1, 0, 0, 1);
      subdomains.addPoint(0, 0);
      subdomains.addPoint(1, 1);

      widgetActor.getProperty().setRGBTransferFunction(colorFunc);
      widgetActor.getProperty().setPiecewiseFunction(subdomains);
      widgetActor.getProperty().setOpacity(0.5);

      //actors to mappers
      widgetActor.setMapper(widgetMapper);
      widgetMapper.setInputConnection(widgetElems.painter.getOutputPort());

      //renderer
      renderer.addViewProp(widgetActor);

      widgetElems.painter.setBackgroundImage(imageSource);
      widgetElems.painter.setLabel(1);
      widgetElems.painter.setSlicingMode(SlicingMode.K);

      widgetElems.paintWidget.getManipulator().setUserOrigin([0, 0, 0]);
      widgetElems.paintHandle.updateRepresentationForRender();

      widgetElems.paintHandle
        .getWidgetState()
        .getHandle()
        .setDirection([0, 0, 1]);

      widgetElems.paintWidget.setRadius(10);
      widgetElems.painter.setRadius(10);
      context.current = {
        fullScreenRenderer,
        renderWindow,
        renderer,
      };
    }
  }, []);

  const setDrawActive = () => {
    // console.log(widgetElems);
    widgetElems.widgetManager.grabFocus(widgetElems.paintWidget);
    widgetElems.paintHandle.setVisibility(!widgetElems.isInUse);
    widgetElems.paintHandle.updateRepresentationForRender();

    widgetElems.paintHandle.onStartInteractionEvent(() => {
      widgetElems.painter.startStroke();
      widgetElems.painter.addPoint(
        widgetElems.paintWidget.getWidgetState().getTrueOrigin()
      );
    });

    widgetElems.paintHandle.onInteractionEvent(() => {
      widgetElems.painter.addPoint(
        widgetElems.paintWidget.getWidgetState().getTrueOrigin()
      );
    });
    initializeHandle(widgetElems.paintHandle);
  };

  const initializeHandle = (handle) => {
    handle.onStartInteractionEvent(() => {
      widgetElems.painter.startStroke();
    });
    handle.onEndInteractionEvent(() => {
      widgetElems.painter.endStroke();
    });
  };

  const setDrawInactive = () => {
    const handle = widgetElems.paintHandle;
    // console.log(handle);
    const nullFunction = () => {};
    handle.onInteractionEvent(nullFunction);
    handle.onStartInteractionEvent(nullFunction);
    handle.onEndInteractionEvent(nullFunction);
  };

  const setDrawState = () => {
    drawingActivity = !drawingActivity;
    drawingActivity ? setDrawActive() : setDrawInactive();
  };

  return (
    <div>
      <div ref={vtkContainerRef} />
      <HoverMenu>
        <input type="button" onClick={setDrawState} value="draw!" />
      </HoverMenu>
    </div>
  );
}
