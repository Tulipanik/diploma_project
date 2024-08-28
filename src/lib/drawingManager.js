export default function DrawingManager(
  widgetManager,
  paintWidget,
  painter,
  paintHandle,
  radius = 1
) {
  // let radius = 1;
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
  };
}
