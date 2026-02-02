import { MaterialDropAnimation, useMaterialDropAnimation } from "./MaterialDropAnimation";

export function MaterialDropOverlay() {
  const { drops, clearDrops } = useMaterialDropAnimation();

  return <MaterialDropAnimation drops={drops} onComplete={clearDrops} />;
}
