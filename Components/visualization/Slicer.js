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

const { SlicingMode } = ImageConstants;

export default function Slicer({ imageReader }) {
  const vtkContainerRef = useRef(null);
  const context = useRef(null);
  const [coneResolution, setConeResolution] = useState(6);
  const [representation, setRepresentation] = useState(2);

  useEffect(() => {
    if (!context.current) {
      //render window
      const fullScreenRenderer = vtkGenericRenderWindow.newInstance({
        background: [0, 0, 0],
      });
      fullScreenRenderer.setContainer(vtkContainerRef.current);
      fullScreenRenderer.resize();

      //interactors
      const interactor = vtkInteractorStyleImage.newInstance({
        interactionMode: "IMAGE_SLICE",
      });

      fullScreenRenderer.getInteractor().setInteractorStyle(interactor);

      //sources and wrappers
      const imageSource = imageReader.getOutputData(0);

      //mappers
      const mapper = vtkImageMapper.newInstance();

      //actors
      const actor = vtkImageSlice.newInstance();
      // actor.setProperty().setColorWindow(255);
      // actor.setProperty().setColorLevel(127);

      //actors to mappers
      actor.setMapper(mapper);
      mapper.setInputData(imageSource);

      //initials
      mapper.setSliceAtFocalPoint(true);
      mapper.setKSlice(30);
      mapper.setSlicingMode(SlicingMode.K);

      //renderer
      const renderer = fullScreenRenderer.getRenderer();
      const renderWindow = fullScreenRenderer.getRenderWindow();
      renderer.addActor(actor);

      //widget manager
      const widgetManager = vtkWidgetManager.newInstance();
      widgetManager.setRenderer(renderer);

      //widgets
      const paintWidget = vtkPaintWidget.newInstance();
      const paintHandle = widgetManager.addWidget(
        paintWidget,
        ViewTypes.DEFAULT
      );

      widgetManager.grabFocus(paintWidget);

      const painter = vtkPaintFilter.newInstance();

      //camera position
      renderer.resetCamera();
      renderWindow.render();

      context.current = {
        fullScreenRenderer,
        renderWindow,
        renderer,
      };
    }
  });

  return (
    <div>
      <div ref={vtkContainerRef} />
      <HoverMenu>
        <select
          value={representation}
          style={{ width: "100%" }}
          onInput={(ev) => setRepresentation(Number(ev.target.value))}
        >
          <option value="0">Points</option>
          <option value="1">Wireframe</option>
          <option value="2">Surface</option>
        </select>
        <input
          type="range"
          min="4"
          max="80"
          value={coneResolution}
          onChange={(ev) => setConeResolution(Number(ev.target.value))}
        />
      </HoverMenu>
    </div>
  );
}
