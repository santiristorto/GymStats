import "./DonutChart.css";

function DonutChart({ segments, size = 140, thickness = 20 }) {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);

  let cursor = 0;
  const stops = segments
    .map((seg) => {
      const start = total === 0 ? 0 : (cursor / total) * 360;
      cursor += seg.value;
      const end = total === 0 ? 0 : (cursor / total) * 360;
      return `${seg.color} ${start}deg ${end}deg`;
    })
    .join(", ");

  const style = {
    width: size,
    height: size,
    background: total === 0 ? "var(--color-border)" : `conic-gradient(${stops})`,
  };

  const holeSize = size - thickness * 2;

  return (
    <div className="donut" style={style} role="img" aria-label="Distribución de estados de pago">
      <div className="donut-hole" style={{ width: holeSize, height: holeSize }}>
        <strong>{total}</strong>
        <span>socios</span>
      </div>
    </div>
  );
}

export default DonutChart;
