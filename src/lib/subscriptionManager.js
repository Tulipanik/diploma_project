export function subscribe(subscription) {
  let sub = subscription;

  const unsubscribe = () => {
    if (sub) {
      sub.unsubscribe();
      sub = null;
    }
  };
  return {
    subscribe(newSub) {
      newSub.unsubscribe();
      sub = newSub;
    },
    unsubscribe,
  };
}
