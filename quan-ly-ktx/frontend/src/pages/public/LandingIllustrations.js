// Hình minh họa tự vẽ cho trang chủ (SVG thuần, không dùng ảnh ngoài).

const ICON_PATHS = {
  room: 'M4 20V6l8-3 8 3v14M9 20v-5h6v5M8 9h2M14 9h2M8 12h2M14 12h2',
  bill: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3',
  bolt: 'M13 2 5 14h6l-1 8 8-12h-6z',
  water: 'M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z',
  contract: 'M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v5M16 3v5',
  key: 'M14 10a4 4 0 1 0-3.5 4L4 20.5V22h3v-2h2v-2h2l1.5-1.5A4 4 0 0 0 14 10z',
  chart: 'M4 20h16M7 16v-5M12 16V7M17 16v-8',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  shield: 'M12 3 5 6v6c0 4 3 7.5 7 9 4-1.5 7-5 7-9V6z',
  wrench: 'M15 4a5 5 0 0 0-5 6.5L4 16.5 7.5 20l6-6A5 5 0 0 0 20 9l-3 1-2-2 1-3z',
  laptop: 'M5 6h14v9H5zM3 18h18',
  phone: 'M8 3h8v18H8zM11 18h2',
  tablet: 'M5 4h14v16H5zM11 17h2',
};

export function LineIcon({ name, size = 24, className }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

// Biểu tượng chính: ngôi nhà ký túc xá với quỹ đạo, gợi nhớ logo React nhưng là hình riêng.
export function BrandEmblem({ size = 96 }) {
  return (
    <svg className="lp-emblem" width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true" focusable="false">
      <ellipse cx="60" cy="60" rx="54" ry="20" stroke="currentColor" strokeWidth="4" />
      <ellipse cx="60" cy="60" rx="54" ry="20" stroke="currentColor" strokeWidth="4" transform="rotate(60 60 60)" />
      <ellipse cx="60" cy="60" rx="54" ry="20" stroke="currentColor" strokeWidth="4" transform="rotate(-60 60 60)" />
      <path d="M44 72V56l16-12 16 12v16z" fill="currentColor" />
      <rect x="55" y="62" width="10" height="10" rx="1.5" className="lp-emblem-door" />
    </svg>
  );
}

function Screen({ x, y, w, h, compact = false }) {
  const pad = compact ? 6 : 10;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="4" className="lp-dev-screen" />
      <rect x={x + pad} y={y + pad} width={w - pad * 2} height={compact ? 10 : 12} rx="3" className="lp-dev-bar" />
      <rect x={x + pad} y={y + pad + (compact ? 18 : 22)} width={w - pad * 2} height={compact ? 22 : 30} rx="3" className="lp-dev-block" />
      <rect x={x + pad} y={y + pad + (compact ? 46 : 60)} width={(w - pad * 3) / 2} height={compact ? 22 : 30} rx="3" className="lp-dev-block soft" />
      <rect x={x + pad * 2 + (w - pad * 3) / 2} y={y + pad + (compact ? 46 : 60)} width={(w - pad * 3) / 2} height={compact ? 22 : 30} rx="3" className="lp-dev-block soft" />
    </g>
  );
}

// Laptop, 2 điện thoại và máy tính bảng: giao diện chạy trên mọi kích thước màn hình.
export function DevicesIllustration() {
  return (
    <svg className="lp-devices" viewBox="0 0 880 260" role="img" aria-label="Minh họa giao diện KTX Care trên máy tính, điện thoại và máy tính bảng">
      <g className="lp-dev-frame">
        <rect x="40" y="40" width="250" height="170" rx="10" />
        <path d="M10 222h310l-18 18H28z" />
      </g>
      <Screen x={54} y={54} w={222} h={142} />

      <g className="lp-dev-frame">
        <rect x="350" y="36" width="104" height="204" rx="18" />
      </g>
      <Screen x={360} y={56} w={84} h={170} compact />
      <circle cx="402" cy="46" r="3" className="lp-dev-dot" />

      <g className="lp-dev-frame">
        <rect x="474" y="36" width="104" height="204" rx="18" />
      </g>
      <Screen x={484} y={56} w={84} h={170} compact />
      <rect x="512" y="43" width="28" height="6" rx="3" className="lp-dev-dot" />

      <g className="lp-dev-frame">
        <rect x="610" y="40" width="240" height="190" rx="14" />
      </g>
      <Screen x={624} y={54} w={212} h={162} />
    </svg>
  );
}

// Khung mô phỏng trang Tổng quan (chỉ là hình khối, không phải số liệu thật).
export function DashboardSketch() {
  return (
    <div className="lp-sketch" aria-hidden="true">
      <div className="lp-sketch-top">
        <span className="lp-sketch-dot" /><span className="lp-sketch-dot" /><span className="lp-sketch-dot" />
        <span className="lp-sketch-url">#overview</span>
      </div>
      <div className="lp-sketch-body">
        <div className="lp-sketch-side">
          {['chart', 'room', 'user', 'contract', 'bill', 'bolt'].map((icon) => (
            <span key={icon}><LineIcon name={icon} size={16} /></span>
          ))}
        </div>
        <div className="lp-sketch-main">
          <div className="lp-sketch-tiles">
            {['room', 'user', 'contract', 'bill'].map((icon) => (
              <div className="lp-sketch-tile" key={icon}>
                <LineIcon name={icon} size={18} />
                <i /><b />
              </div>
            ))}
          </div>
          <div className="lp-sketch-chart">
            {[46, 70, 58, 88, 64, 78].map((height, index) => (
              <span key={index} style={{ height: `${height}%` }} />
            ))}
          </div>
          <div className="lp-sketch-rows">
            <i /><i /><i />
          </div>
        </div>
      </div>
    </div>
  );
}

// Ảnh thu nhỏ cho mục "Xem nhanh".
export function PreviewThumb({ kind }) {
  if (kind === 'rooms') {
    const states = ['empty', 'some', 'full', 'some', 'empty', 'full', 'some', 'some', 'empty', 'full', 'some', 'empty'];
    return (
      <div className="lp-thumb lp-thumb-rooms" aria-hidden="true">
        {states.map((state, index) => <span key={index} className={state} />)}
      </div>
    );
  }
  if (kind === 'bills') {
    return (
      <div className="lp-thumb lp-thumb-bills" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row}><i /><i /><b className={row % 2 ? 'paid' : ''} /></div>
        ))}
      </div>
    );
  }
  return (
    <div className="lp-thumb lp-thumb-phone" aria-hidden="true">
      <div className="lp-thumb-handset">
        <span className="lp-thumb-avatar" />
        <i /><i className="short" />
        <div className="lp-thumb-card" />
        <div className="lp-thumb-card soft" />
      </div>
    </div>
  );
}
