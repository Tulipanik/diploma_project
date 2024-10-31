"use client";

import * as React from "react";
import { useState } from "react";

import Slicer from "./../../Components/visualization/Slicer";
import ConeVisualizator from "./../../Components/visualization/ConeVisualizator";
import vtkXMLImageDataReader from "@kitware/vtk.js/IO/XML/XMLImageDataReader";
import ImageConstants from "@kitware/vtk.js/Rendering/Core/ImageMapper/Constants";

import { styled } from "@mui/material/styles";
import Image from "next/image";
import { Typography, Button, Container } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import theme from "../../Components/Theme/theme";
import { ThemeProvider } from "@mui/material/styles";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const { SlicingMode } = ImageConstants;

export default function Home() {
  const [binaryData, setBinaryData] = useState(null);
  const imageReader = vtkXMLImageDataReader.newInstance();

  const loadFile = async (e) => {
    e.preventDefault();
    const dataTransfer = e.dataTransfer;
    const files = e.target.files || dataTransfer.files;
    if (files.length == 1) {
      const extension = files[0].name.split(".").slice(-1)[0];
      const loadedData = await load({ file: files[0], ext: extension });
      imageReader.parseAsArrayBuffer(loadedData);
      setBinaryData(imageReader);
    }
  };

  const load = (toLoad) => {
    return new Promise((resolve, reject) => {
      if (toLoad.file && toLoad.ext === "vti") {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target.result);
        };
        reader.onerror = (error) => {
          reject(error);
        };
        reader.readAsArrayBuffer(toLoad.file);
      } else {
        reject(new Error("Invalid file or file type"));
      }
    });
  };

  return (
    <ThemeProvider theme={theme}>
      {!binaryData ? (
        <React.Fragment>
          <div className=" w-[100vw] h-[70vh] overflow-hidden">
            <div className="flex overflow-hidden justify-center items-center relative w-[110vw] h-[90vh]">
              <Image
                fill
                src="/pexels-pixabay-40568.jpg"
                alt="background image"
                className="-z-10 object-cover blur-md brightness-90"
              />
              <Typography
                variant="h1"
                // sx={{ color: theme.palette.primary.contrastText }}
              >
                Witaj w{" "}
                <span style={{ color: theme.palette.primary.main }}>
                  MediView
                </span>
                <Image
                  alt="logo"
                  src="/logo.svg"
                  height={100}
                  width={100}
                  className="relative inline-block"
                />
              </Typography>
            </div>
          </div>
          <Container className="relative flex flex-col w-full h-[25vh] justify-center items-center p-10 m-auto bg-white rounded border-8 -translate-y-1/2">
            <Typography variant="h3" className="relative" gutterBottom>
              Załącz pliki po których chcesz rysować tutaj
            </Typography>
            <Button
              component="label"
              role={undefined}
              variant="contained"
              tabIndex={-1}
              startIcon={<CloudUploadIcon />}
            >
              Załącz plik
              <VisuallyHiddenInput type="file" onChange={loadFile} multiple />
            </Button>
          </Container>
          <footer
            style={{ backgroundColor: theme.palette.primary.main }}
            className="flex justify-center align-center overflow-hidden h-[5vh]"
          >
            <Typography variant="body2">
              Photo by Pixabay:
              https://www.pexels.com/photo/close-up-photo-of-a-stethoscope-40568/
            </Typography>
          </footer>
        </React.Fragment>
      ) : (
        <div>
          {/* <ConeVisualizator
              style={{ width: "50%" }}
              imageReader={binaryData}
              load={load}
            /> */}
          <Slicer imageReader={binaryData} actualSlicingMode={SlicingMode.K} />
        </div>
      )}
    </ThemeProvider>
  );
}
