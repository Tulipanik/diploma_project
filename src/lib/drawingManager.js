export default function DrawingManager(
  widgetManager,
  paintWidget,
  painter,
  paintHandle
) {
  let interactionEventStart;
  let interactionEvent;
  let interactionEventEnd;

  return {
    turnOn: () => {
      widgetManager.enablePicking();
      widgetManager.grabFocus(paintWidget);
      interactionEventStart = paintHandle.onStartInteractionEvent(() => {
        painter.startStroke();
        painter.addPoint(paintWidget.getWidgetState().getTrueOrigin());
      });
      interactionEvent = paintHandle.onInteractionEvent(() => {
        console.log(paintWidget.getWidgetState().getTrueOrigin());

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
    updatePaintWidget: (position) => {
      paintWidget.getManipulator().setUserOrigin(position);
    },
  };
}
