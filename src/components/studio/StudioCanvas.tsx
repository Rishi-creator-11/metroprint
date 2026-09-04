"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Rect, Group, Image as KImage, Text as KText, Transformer } from "react-konva";
import type Konva from "konva";
import type { ResolvedPrintSpec } from "@/lib/studio/print-specs";
import type { Layer as DesignLayer, SideDesign } from "@/lib/studio/design";

interface Props {
  spec: ResolvedPrintSpec;
  side: SideDesign;
  showGuides: boolean;
  preview: boolean;
  zoom: number;
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
  onChangeLayer: (index: number, patch: Partial<DesignLayer>) => void;
  containerSize: { w: number; h: number };
  onStage?: (stage: Konva.Stage | null) => void;
}

function useHtmlImage(url: string | null) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!url) {
      setImg(null);
      return;
    }
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.src = url;
    image.onload = () => setImg(image);
    image.onerror = () => setImg(null);
    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [url]);
  return img;
}

function ImageNode({
  layer,
  pxPerIn,
  selected,
  listening,
  onSelect,
  onChange,
}: {
  layer: Extract<DesignLayer, { kind: "image" }>;
  pxPerIn: number;
  selected: boolean;
  listening: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<DesignLayer>) => void;
}) {
  const img = useHtmlImage(layer.url);
  const ref = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (selected && trRef.current && ref.current) {
      trRef.current.nodes([ref.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selected, img]);

  if (!img) return null;

  return (
    <>
      <KImage
        ref={ref}
        image={img}
        x={layer.x * pxPerIn}
        y={layer.y * pxPerIn}
        width={layer.width * pxPerIn}
        height={layer.height * pxPerIn}
        rotation={layer.rotation}
        draggable={listening}
        listening={listening}
        onMouseDown={onSelect}
        onTap={onSelect}
        onDragEnd={(e) =>
          onChange({ x: e.target.x() / pxPerIn, y: e.target.y() / pxPerIn })
        }
        onTransformEnd={() => {
          const node = ref.current;
          if (!node) return;
          const sx = node.scaleX();
          const sy = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            x: node.x() / pxPerIn,
            y: node.y() / pxPerIn,
            width: Math.max(0.1, (node.width() * sx) / pxPerIn),
            height: Math.max(0.1, (node.height() * sy) / pxPerIn),
            rotation: node.rotation(),
          });
        }}
      />
      {selected && listening && (
        <Transformer
          ref={trRef}
          rotateEnabled
          keepRatio
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
          boundBoxFunc={(oldBox, newBox) => (newBox.width < 12 || newBox.height < 12 ? oldBox : newBox)}
        />
      )}
    </>
  );
}

function TextNode({
  layer,
  pxPerIn,
  selected,
  listening,
  onSelect,
  onChange,
}: {
  layer: Extract<DesignLayer, { kind: "text" }>;
  pxPerIn: number;
  selected: boolean;
  listening: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<DesignLayer>) => void;
}) {
  const ref = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (selected && trRef.current && ref.current) {
      trRef.current.nodes([ref.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selected]);

  return (
    <>
      <KText
        ref={ref}
        text={layer.text}
        x={layer.x * pxPerIn}
        y={layer.y * pxPerIn}
        width={layer.width * pxPerIn}
        fontSize={(layer.fontSize / 72) * pxPerIn}
        fontStyle={layer.bold ? "bold" : "normal"}
        fill={layer.fill}
        align={layer.align}
        rotation={layer.rotation}
        draggable={listening}
        listening={listening}
        onMouseDown={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => onChange({ x: e.target.x() / pxPerIn, y: e.target.y() / pxPerIn })}
        onTransformEnd={() => {
          const node = ref.current;
          if (!node) return;
          const sx = node.scaleX();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            x: node.x() / pxPerIn,
            y: node.y() / pxPerIn,
            width: Math.max(0.3, (node.width() * sx) / pxPerIn),
            rotation: node.rotation(),
          });
        }}
      />
      {selected && listening && (
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={["middle-left", "middle-right"]}
          boundBoxFunc={(oldBox, newBox) => (newBox.width < 20 ? oldBox : newBox)}
        />
      )}
    </>
  );
}

export default function StudioCanvas({
  spec,
  side,
  showGuides,
  preview,
  zoom,
  selectedIndex,
  onSelect,
  onChangeLayer,
  containerSize,
  onStage,
}: Props) {
  const stageRef = useRef<Konva.Stage>(null);
  useEffect(() => {
    onStage?.(stageRef.current);
    return () => onStage?.(null);
  }, [onStage]);
  // Base scale: fit the bleed box into the container with padding.
  const fitScale = useMemo(() => {
    const pad = 80;
    const availW = Math.max(120, containerSize.w - pad);
    const availH = Math.max(120, containerSize.h - pad);
    const basePxPerIn = Math.min(availW / spec.bleedWidth, availH / spec.bleedHeight);
    return basePxPerIn;
  }, [containerSize, spec]);

  const pxPerIn = fitScale * zoom;
  const boardW = spec.bleedWidth * pxPerIn;
  const boardH = spec.bleedHeight * pxPerIn;
  const offsetX = Math.max(40, (containerSize.w - boardW) / 2);
  const offsetY = Math.max(40, (containerSize.h - boardH) / 2);

  const bleedPx = spec.bleed * pxPerIn;
  const safePx = (spec.bleed + spec.safeMargin) * pxPerIn;
  const trimW = spec.width * pxPerIn;
  const trimH = spec.height * pxPerIn;

  const bg = side.background === "transparent" ? undefined : side.background;

  return (
    <Stage
      ref={stageRef}
      width={Math.max(containerSize.w, boardW + 80)}
      height={Math.max(containerSize.h, boardH + 80)}
      onMouseDown={(e) => {
        if (e.target === e.target.getStage()) onSelect(null);
      }}
      onTap={(e) => {
        if (e.target === e.target.getStage()) onSelect(null);
      }}
    >
      <Layer>
        {/* board shadow */}
        <Rect x={offsetX + 4} y={offsetY + 6} width={boardW} height={boardH} fill="rgba(15,23,42,0.18)" cornerRadius={2} />
        <Group x={offsetX} y={offsetY} clipX={preview ? bleedPx : 0} clipY={preview ? bleedPx : 0} clipWidth={preview ? trimW : boardW} clipHeight={preview ? trimH : boardH}>
          {/* transparent checkerboard hint */}
          {side.background === "transparent" ? (
            <Rect width={boardW} height={boardH} fillPatternScale={{ x: 1, y: 1 }} fill="#f1f5f9" />
          ) : (
            <Rect width={boardW} height={boardH} fill={bg} />
          )}

          {side.layers.map((layer, i) =>
            layer.kind === "image" ? (
              <ImageNode
                key={i}
                layer={layer}
                pxPerIn={pxPerIn}
                selected={!preview && selectedIndex === i}
                listening={!preview}
                onSelect={() => onSelect(i)}
                onChange={(patch) => onChangeLayer(i, patch)}
              />
            ) : (
              <TextNode
                key={i}
                layer={layer}
                pxPerIn={pxPerIn}
                selected={!preview && selectedIndex === i}
                listening={!preview}
                onSelect={() => onSelect(i)}
                onChange={(patch) => onChangeLayer(i, patch)}
              />
            ),
          )}
        </Group>

        {/* guides drawn on top, not clipped */}
        {showGuides && !preview && (
          <Group x={offsetX} y={offsetY} listening={false}>
            <Rect width={boardW} height={boardH} stroke="#ef4444" strokeWidth={1} dash={[6, 4]} />
            <Rect x={bleedPx} y={bleedPx} width={trimW} height={trimH} stroke="#0f172a" strokeWidth={1.5} />
            <Rect x={safePx} y={safePx} width={boardW - safePx * 2} height={boardH - safePx * 2} stroke="#2563eb" strokeWidth={1} dash={[4, 4]} />
          </Group>
        )}
        {preview && (
          <Group x={offsetX} y={offsetY} listening={false}>
            <Rect x={bleedPx} y={bleedPx} width={trimW} height={trimH} stroke="#e2e8f0" strokeWidth={1} />
          </Group>
        )}
      </Layer>
    </Stage>
  );
}
