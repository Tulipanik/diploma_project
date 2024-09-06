export default function DrawingManager(
  widgetManager,
  paintWidget,
  painter,
  paintHandle,
  slice = null
) {
  let interactionEventStart;
  let interactionEvent;
  let interactionEventEnd;

  const sliceChecker = (pointToAdd, slice) => {
    if (slice) {
      pointToAdd[2] = slice;
    }
    return pointToAdd;
  };

  return {
    turnOn: () => {
      console.log("slice:" + slice);

      widgetManager.enablePicking();
      widgetManager.grabFocus(paintWidget);
      interactionEventStart = paintHandle.onStartInteractionEvent(() => {
        painter.startStroke();
        const pointToAdd = sliceChecker(
          paintWidget.getWidgetState().getTrueOrigin(),
          slice
        );
        console.log(paintWidget.getWidgetState().getTrueOrigin());
        painter.addPoint(pointToAdd);
      });
      interactionEvent = paintHandle.onInteractionEvent(() => {
        const pointToAdd = sliceChecker(
          paintWidget.getWidgetState().getTrueOrigin(),
          slice
        );
        painter.addPoint(paintWidget.getWidgetState().getTrueOrigin());
      });
      interactionEventEnd = paintHandle.onEndInteractionEvent(() => {
        painter.endStroke();
      });
    },
    turnOff: () => {
      widgetManager.disablePicking();
      widgetManager.releaseFocus();
      if (interactionEventStart && interactionEventStart.unsubscribe) {
        interactionEventStart.unsubscribe();
      }
      if (interactionEvent && interactionEvent.unsubscribe) {
        interactionEvent.unsubscribe();
      }
      if (interactionEventEnd && interactionEventEnd.unsubscribe) {
        interactionEventEnd.unsubscribe();
      }
    },
    setRadius: (newVal) => {
      radius = newVal;
    },
    updateSlice: (newSlice) => {
      slice = slice != null && newSlice;
    },
    updatePaintWidget: (position) => {
      paintWidget.getManipulator().setUserOrigin(position);
    },
  };
}
