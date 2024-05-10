"use client";

import { useState, useRef, useEffect } from "react";

import "@kitware/vtk.js/Rendering/Profiles/Geometry";

import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkConeSource from "@kitware/vtk.js/Filters/Sources/ConeSource";
import vtkOutlineFilter from "@kitware/vtk.js/Filters/General/OutlineFilter";
import vtkGenericRenderWindow from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";
import ImageConstants from "@kitware/vtk.js/Rendering/Core/ImageMapper/Constants";

const { SlicingMode } = ImageConstants;

export default function ConeVisualizator() {
  const vtkContainerRef = useRef(null);
  const context = useRef(null);
  const [coneResolution, setConeResolution] = useState(6);
  const [representation, setRepresentation] = useState(2);

  useEffect(() => {
    if (!context.current) {
      //window renderer
      const fullScreenRenderer = vtkGenericRenderWindow.newInstance();
      fullScreenRenderer.setContainer(vtkContainerRef.current);
      fullScreenRenderer.resize();

      //sources and wrappers
      const coneSource = vtkConeSource.newInstance({ height: 1.0 });

      const filter = vtkOutlineFilter.newInstance();

      filter.setInputConnection(coneSource.getOutputPort());

      //mappers
      let mapper = vtkMapper.newInstance();
      const mapperOutline = vtkMapper.newInstance();
      mapper.setInputConnection(coneSource.getOutputPort());
      mapperOutline.setInputConnection(filter.getOutputPort());

      //actors
      let actor = vtkActor.newInstance();
      const actorOutline = vtkActor.newInstance();

      //actors to mappers
      actor.setMapper(mapper);
      actorOutline.setMapper(mapperOutline);

      //renderer
      const renderer = fullScreenRenderer.getRenderer();
      const renderWindow = fullScreenRenderer.getRenderWindow();

      renderer.getActiveCamera().setParallelProjection(true);

      renderer.addActor(actor);
      renderer.addActor(actorOutline);
      renderWindow.render();

      context.current = {
        fullScreenRenderer,
        renderWindow,
        renderer,
        coneSource,
        actor,
        mapper,
      };
    }

    return () => {
      if (context.current) {
        const { fullScreenRenderer, coneSource, actor, mapper } =
          context.current;
        actor.delete();
        mapper.delete();
        coneSource.delete();
        fullScreenRenderer.delete();
        context.current = null;
      }
    };
  }, [vtkContainerRef]);

  useEffect(() => {
    if (context.current) {
      const { coneSource, renderWindow } = context.current;
      coneSource.setResolution(coneResolution);
      renderWindow.render();
    }
  }, [coneResolution]);

  useEffect(() => {
    if (context.current) {
      const { actor, renderWindow } = context.current;
      renderWindow.render();
    }
  }, [representation]);

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
