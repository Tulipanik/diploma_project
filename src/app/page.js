"use client";

import Slicer from "../../Components/visualization/Slicer";
import ConeVisualizator from "./../../Components/visualization/ConeVisualizator";
import vtkXMLImageDataReader from "@kitware/vtk.js/IO/XML/XMLImageDataReader";
import { useState } from "react";

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
    <div>
      {!binaryData ? (
        <div>
          <input type="file" onChange={loadFile} />
        </div>
      ) : (
        <div>
          <ConeVisualizator
            style={{ width: "50%" }}
            imageReader={binaryData}
            load={load}
          />
          {/* <Slicer imageReader={binaryData} load={load} /> */}
        </div>
      )}
    </div>
  );
}
