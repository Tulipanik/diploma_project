import Slicer from "../../Components/visualization/Slicer";
import ConeVisualizator from "./../../Components/visualization/ConeVisualizator";

export default function Home() {
  return (
    <div className="grid grid-cols-2 gap-2 h-screen">
      <ConeVisualizator />
      <ConeVisualizator />
      <ConeVisualizator />
      <ConeVisualizator />
    </div>
  );
}
