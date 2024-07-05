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


export default function ConeVisualizator({ imageReader, load }) {
  const vtkContainerRef = useRef(null);
  const context = useRef(null);

  //setting filters

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

  useEffect(() => {
    if (!context.current) {
      //window renderer
      const fullScreenRenderer = vtkGenericRenderWindow.newInstance();
      fullScreenRenderer.setContainer(vtkContainerRef.current);
      fullScreenRenderer.resize();

      //sources and wrappers
      const imageSource = imageReader.getOutputData(0);

      //mappers
      const mapper = vtkVolumeMapper.newInstance();
      mapper.setSampleDistance(0.7);

      //actors
      const actor = vtkVolume.newInstance();

      actor.getProperty().setScalarOpacity(0, subdomains);
      actor.getProperty().setRGBTransferFunction(0, colorMapTable);

      //actors to mappers
      actor.setMapper(mapper);
      mapper.setInputData(imageSource);

      //renderer
      const renderer = fullScreenRenderer.getRenderer();
      const renderWindow = fullScreenRenderer.getRenderWindow();

      renderer.getActiveCamera().setParallelProjection(true);

      renderer.addActor(actor);
      renderer.resetCamera();
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
        // actor.delete();
        // mapper.delete();
        // coneSource.delete();
        // fullScreenRenderer.delete();
        context.current = null;
      }
    };
  }, [vtkContainerRef]);

  return (
    <div style={{ position: "relative" }}>
      <div ref={vtkContainerRef} />
      <HoverMenu></HoverMenu>
    </div>
  );
}
