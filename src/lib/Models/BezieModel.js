export class Point {
  constructor(nodeNum = -1, x = 0, y = 0, z = 0) {
    this.nodeNum = nodeNum;
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

class Node {
  constructor(data, wl = null, dl = null, wr = null, dr = null) {
    this.data = data;
    this.left = { weigth: wl, data: dl };
    this.right = { weigth: wr, data: dr };
  }
}

export default function BezieModel(points = []) {
  const RESOLUTION = 25;
  const P = 3 > points.length ? points.length : 3;
  let bezieCurvePoints = [];
  let knotVector;

  const generateKnotVector = () => {
    knotVector = Array.from({ length: P + 1 }, () => 0);
    const knotVectorDesiredLength = points.length - P - 1;
    const step = 1 / (knotVectorDesiredLength + 1);

    for (let i = step; i < 1; i += step) knotVector.push(i);
    knotVector.push(...Array.from({ length: P + 1 }, () => 1));
  };

  const countAlpha = (u, first, second) => {
    return (
      (u - knotVector[first]) /
      (knotVector[first + P - second + 1] - knotVector[first])
    );
  };

  const countPoint = (alpha, first, second) => {
    return new Point(
      [second.nodeNum[0], second.nodeNum[1] + 1],
      (1 - alpha) * first.x + alpha * second.x,
      (1 - alpha) * first.y + alpha * second.y,
      first.z
    );
  };

  const createBezieModel = () => {
    if (!knotVector || knotVector.length != points.length + P)
      generateKnotVector();

    const step = 1 / (RESOLUTION - 1);

    let u = -step;

    while (bezieCurvePoints.length != RESOLUTION) {
      let knotVectorPointer = 0;
      u += step;

      // console.log(u);

      for (
        knotVectorPointer;
        knotVector[knotVectorPointer] <= 1;
        knotVectorPointer++
      ) {
        if (
          knotVector[knotVectorPointer] <= u &&
          knotVector[knotVectorPointer + 1] > u
        )
          break;
      }
      let Points = [];

      Points = points
        .slice(knotVectorPointer - P, knotVectorPointer + 1)
        .map((elem) => new Node(elem));

      while (Points.length !== 1) {
        const first = Points.shift();
        const second = Points[0];
        if (first.data.nodeNum[1] !== second.data.nodeNum[1]) {
          continue;
        }

        const alpha = countAlpha(
          u,
          second.data.nodeNum[0],
          second.data.nodeNum[1] + 1
        );
        const newPoint = countPoint(alpha, first.data, second.data);

        Points.push(new Node(newPoint, alpha, first, 1 - alpha, second));
      }

      bezieCurvePoints.push(Points[0].data);
    }
  };
  return {
    setPoints: (newPoints) => {
      points = newPoints;
    },
    drawCurve: (painter) => {
      // console.log(points);

      createBezieModel();

      bezieCurvePoints.forEach((elem) => {
        // console.log(elem);

        painter.setRadius(5);
        painter.addPoint([elem.x, elem.y, elem.z]);
      });
    },
  };
}
