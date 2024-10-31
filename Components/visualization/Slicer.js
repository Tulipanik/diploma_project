"use client";

import { useState, useRef, useEffect } from "react";

import HoverMenu from "./HoverMenu";

import "@kitware/vtk.js/Rendering/Profiles/Volume";

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

import vtkBezieWidget from "@/lib/Widgets/BezieCurve";

import DrawingManager from "@/lib/drawingManager";
import {
  IconButton,
  Slider,
  TextField,
  Stack,
  TextareaAutosize,
  Typography,
} from "@mui/material";
import { Brush, Redo, Timeline, Undo } from "@mui/icons-material";

import theme from "../Theme/theme";

function setCamera(sliceMode, renderer, data) {
  const ijk = [0, 0, 0];
  const position = [0, 0, 0];
  const focalPoint = [0, 0, 0];
  data.indexToWorld(ijk, focalPoint);
  ijk[sliceMode] = 1;
  data.indexToWorld(ijk, position);
  renderer.getActiveCamera().set({ focalPoint, position });
  renderer.resetCamera();
}

export default function Slicer({ imageReader, actualSlicingMode }) {
  const vtkContainerRef = useRef(null);
  const context = useRef(null);
  const labelmapContext = useRef(null);
  const widgetContext = useRef(null);

  //UI parameters
  const [sliceNumber, setSliceNumber] = useState(0);
  const [radius, setRadius] = useState(1);
  const [drawingActivity, setDrawingActivity] = useState(false);
  const [drawingActivity2, setDrawingActivity2] = useState(false);
  const [color, setColor] = useState("#ffffff");
  const [label, setLabel] = useState(1);

  //image elements
  const imageSource = imageReader.getOutputData(0);
  const howManySlices = imageSource.getExtent()[(actualSlicingMode % 3) + 1];

  const drawingMethods = useRef(null);

  useEffect(() => {
    if (!context.current) {
      //image pipeline

      //mapper
      const mapper = vtkImageMapper.newInstance({});
      mapper.setSlicingMode(actualSlicingMode);
      mapper.set({ slice: sliceNumber });
      mapper.onModified(setSliceNumber(mapper.get("slice").slice));

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
      colorTransferFunction.addRGBPoint(1, 0, 0, 1);
      colorTransferFunction.addRGBPoint(0.2, 0.5, 0, 1);

      const piecewiseFunction = vtkPiecewiseFunction.newInstance();
      piecewiseFunction.addPoint(0, 0);
      piecewiseFunction.addPoint(1, 1);

      const painter = vtkPaintFilter.newInstance({});
      painter.setBackgroundImage(imageSource);
      painter.setLabel(1);
      painter.setSlicingMode(actualSlicingMode);

      //actor
      const labelMapActor = vtkImageSlice.newInstance();

      labelMapActor.getProperty().setRGBTransferFunction(colorTransferFunction);
      labelMapActor.getProperty().setPiecewiseFunction(piecewiseFunction);
      labelMapActor.getProperty().setOpacity(0.5);

      //actors to mappers
      const labelMapMapper = vtkImageMapper.newInstance(
        mapper.get("slicingMode")
      );

      labelMapActor.setMapper(labelMapMapper);
      labelMapMapper.setInputConnection(painter.getOutputPort());

      renderer.addViewProp(labelMapActor);

      setCamera(actualSlicingMode, renderer, imageSource);

      //widget pipeline
      const widgetManager = vtkWidgetManager.newInstance({});
      const paintWidget = vtkPaintWidget.newInstance({});
      const bezieWidget = vtkBezieWidget.newInstance({});

      bezieWidget.getWidgetState().setSlicingMode(actualSlicingMode);
      bezieWidget.getWidgetState().setSliceNumber(sliceNumber);
      bezieWidget.getWidgetState().setSpacing(imageSource.getSpacing());

      widgetManager.setRenderer(renderer);
      const paintHandle = widgetManager.addWidget(paintWidget, ViewTypes.SLICE);
      const bezieHandle = widgetManager.addWidget(bezieWidget, ViewTypes.SLICE);

      bezieHandle.setOutputBorder(true);
      const renderWindow = fullScreenRenderer.getRenderWindow();
      renderWindow.render();

      context.current = {
        fullScreenRenderer,
        renderWindow,
        renderer,
        mapper,
        colorTransferFunction,
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
        bezieWidget,
        bezieHandle,
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
      const currentSlice = context.current.mapper.getSlice();

      labelmapContext.current.labelMapMapper.set(
        context.current.mapper.get("slice")
      );

      const ijk = [0, 0, 0];
      const position = [0, 0, 0];

      const slicingMode = context.current.mapper.getSlicingMode() % 3;
      ijk[slicingMode] = context.current.mapper.getSlice();
      imageSource.indexToWorld(ijk, position);

      widgetContext.current.bezieWidget
        .getManipulator()
        .setUserOrigin(position);
      widgetContext.current.bezieHandle.updateRepresentationForRender();

      drawingMethods.current.updatePaintWidget(position);

      context.current.renderWindow.render();
      setSliceNumber(currentSlice);
      widgetContext.current.bezieWidget.setSliceNumber(parseInt(currentSlice));
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
    widgetContext.current.bezieHandle.setVisibility(drawingActivity2);

    widgetContext.current.bezieHandle.updateRepresentationForRender();
  }, [drawingActivity]);

  useEffect(() => {
    widgetContext.current.bezieHandle.reset();
    widgetContext.current.bezieHandle.setVisibility(drawingActivity2);
    widgetContext.current.bezieHandle.updateRepresentationForRender();

    widgetContext.current.widgetManager.enablePicking();
    widgetContext.current.widgetManager.grabFocus(
      widgetContext.current.bezieWidget
    );
    const interactionEventStart =
      widgetContext.current.bezieHandle.onStartInteractionEvent(() => {
        labelmapContext.current.painter.startStroke();
      });

    const interactionEventEnd =
      widgetContext.current.bezieHandle.onEndInteractionEvent(() => {
        const points = Array.from(
          widgetContext.current.bezieHandle.getPoints()
        );

        for (let i = 0; i < points.length; i += 3) {
          labelmapContext.current.painter.addPoint([
            points[i],
            points[i + 1],
            points[i + 2],
          ]);
        }

        labelmapContext.current.painter.endStroke();
      });

    return () => {
      interactionEventStart.unsubscribe();
      interactionEventEnd.unsubscribe();
      widgetContext.current.widgetManager.releaseFocus(
        widgetContext.current.bezieWidget
      );
    };
  }, [drawingActivity2]);

  useEffect(() => {
    context.current.mapper.set({ slice: sliceNumber });
  }, [sliceNumber]);

  const undo = () => {
    labelmapContext.current.painter.undo();
  };

  const redo = () => {
    labelmapContext.current.painter.redo();
  };

  return (
    <div>
      <div ref={vtkContainerRef} />
      <Stack
        spacing={5}
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          height: "100%",
          marginTop: "5%",
          marginBottom: "5%",
          alignItems: "center",
        }}
      >
        <Slider
          sx={{
            '& input[type="range"]': {
              WebkitAppearance: "slider-vertical",
            },
          }}
          orientation="vertical"
          value={sliceNumber}
          aria-label="slice number"
          min={0}
          max={howManySlices}
          onChange={(e) => setSliceNumber(e.target.value)}
        />
        <Stack direction="row">
          <TextField
            variant="standard"
            sx={{
              "& .MuiInputBase-input": {
                color: theme.palette.primary.contrastText,
              },
              width: 40,
            }}
            onChange={(e) => {
              setSliceNumber(e.target.value);
            }}
            value={sliceNumber}
          />
          <Typography
            variant="body1"
            sx={{ color: theme.palette.primary.contrastText }}
          >
            /{howManySlices}
          </Typography>
        </Stack>
      </Stack>

      <HoverMenu>
        <IconButton
          onClick={() => {
            drawingActivity2 && setDrawingActivity2(false);
            setDrawingActivity(!drawingActivity);
          }}
          aria-label="paint"
          color={drawingActivity ? "primary" : "default"}
          variant={drawingActivity ? "contained" : "outlined"}
        >
          <Brush />
        </IconButton>
        <IconButton
          onClick={() => {
            drawingActivity && setDrawingActivity(false);
            setDrawingActivity2(!drawingActivity2);
          }}
          aria-label="curve"
          color={drawingActivity2 ? "primary" : "default"}
          variant={drawingActivity2 ? "contained" : "outlined"}
        >
          <Timeline />
        </IconButton>
        <IconButton onClick={() => undo()}>
          <Undo />
        </IconButton>
        <IconButton onClick={() => redo()}>
          <Redo />
        </IconButton>
        {/* <Stack spacing={2} direction="row" sx={{ alignItems: "center", mb: 1 }}>
          <VolumeDown /> */}
        <Slider
          aria-label="brush size"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          min={1}
          max={100}
        />
        {/* <VolumeUp />
        </Stack> */}
      </HoverMenu>
    </div>
  );
}
