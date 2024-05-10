"use client";

import { useState, useRef, useEffect } from "react";

import "@kitware/vtk.js/Rendering/Profiles/Geometry";

import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";

import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkConeSource from "@kitware/vtk.js/Filters/Sources/ConeSource";
import vtkOutlineFilter from "@kitware/vtk.js/Filters/General/OutlineFilter";
import vtkImageMapper from "@kitware/vtk.js/Rendering/Core/ImageMapper";
import vtkImageSlice from "@kitware/vtk.js/Rendering/Core/ImageSlice";
import vtkInteractorStyleImage from "@kitware/vtk.js/Interaction/Style/InteractorStyleImage";
import ImageConstants from "@kitware/vtk.js/Rendering/Core/ImageMapper/Constants";
import vtkGenericRenderWindow from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";

const { SlicingMode } = ImageConstants;

export default function Slicer() {
  const vtkContainerRef = useRef(null);
  const context = useRef(null);
  const [coneResolution, setConeResolution] = useState(6);
  const [representation, setRepresentation] = useState(2);

  useEffect(() => {
    if (!context.current) {
      const fullScreenRenderer = vtkGenericRenderWindow.newInstance();
      fullScreenRenderer.setContainer(vtkContainerRef.current);
      fullScreenRenderer.resize();

      //sources and wrappers
      const coneSource = vtkConeSource.newInstance({ height: 1.0 });

      const istyle = vtkInteractorStyleImage.newInstance();
      istyle.setInteractionMode("IMAGE_SLICING");
      fullScreenRenderer.getInteractor().setInteractorStyle(istyle);

      //mappers
      let mapperImage = vtkImageMapper.newInstance();
      mapperImage.setSliceAtFocalPoint(true);
      mapperImage.setSlicingMode(SlicingMode.Z);

      //actors
      const actorImage = vtkImageSlice.newInstance();

      actorImage.getProperty().setColorWindow(255);
      actorImage.getProperty().setColorLevel(127);

      //actors to mappers

      actorImage.setMapper(mapperImage);
      mapperImage.setInputConnection(coneSource.getOutputPort());

      //renderer
      const renderer = fullScreenRenderer.getRenderer();
      const renderWindow = fullScreenRenderer.getRenderWindow();

      //camera position
      renderer.resetCamera();
      renderer.getActiveCamera().setParallelProjection(true);

      renderer.addActor(actorImage);
      renderWindow.render();

      context.current = {
        fullScreenRenderer,
        renderWindow,
        renderer,
        coneSource,
        // actor,
        // mapper,
      };
    }

    return () => {
      if (context.current) {
        const { fullScreenRenderer, coneSource, actor, mapper } =
          context.current;
        // actor.delete();
        // mapper.delete();
        coneSource.delete();
        fullScreenRenderer.delete();
        context.current = null;
      }
    };
  }, [vtkContainerRef]);

  //   useEffect(() => {
  //     if (context.current) {
  //       const { coneSource, renderWindow } = context.current;
  //       coneSource.setResolution(coneResolution);
  //       renderWindow.render();
  //     }
  //   }, [coneResolution]);

  //   useEffect(() => {
  //     if (context.current) {
  //       const { actor, renderWindow } = context.current;
  //       // actor.getProperty().setRepresentation(representation);
  //       renderWindow.render();
  //     }
  //   }, [representation]);

  return (
    /*!context.current ?*/ //   <form>
    //     <input
    //       onChange={async (e) => {
    //         const files = e.target.files;
    //         console.log(files);
    //         // const reader = await readImageDICOMFileSeries(files);
    //         console.log(reader);
    //       }}
    //       type="file"
    //       multiple
    //     />
    //     <input type="submit" />
    //   </form>
    // ) : (
    <div>
      <div ref={vtkContainerRef} />
      <table
        style={{
          position: "absolute",
          top: "25px",
          left: "25px",
          background: "white",
          padding: "12px",
        }}
      >
        <tbody>
          <tr>
            <td>
              <select
                value={representation}
                style={{ width: "100%" }}
                onInput={(ev) => setRepresentation(Number(ev.target.value))}
              >
                <option value="0">Points</option>
                <option value="1">Wireframe</option>
                <option value="2">Surface</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>
              <input
                type="range"
                min="4"
                max="80"
                value={coneResolution}
                onChange={(ev) => setConeResolution(Number(ev.target.value))}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
